import * as vscode from 'vscode';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import getQuotesBetweenHeaders from './getQuotesBetweenHeaders';

interface QuoteState {
	dismissedPermanently: boolean;
}

interface FolderState {
	quotesHash: string;
	quotes: Record<string, QuoteState>;
};

export function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		console.log('FYI: No workspace folder is open.');
		return;
	}

	workspaceFolders.forEach(folder => {
		const filename = 'fyi.md';
		const folderPath = folder.uri.fsPath;
		const filePath = join(folderPath, filename); // TODO: see if we can support case-insensitive file names
		console.log(`FYI: Reading file from path: ${filePath}`);
		const state = context.globalState.get<FolderState>(folderPath);
		console.log(`FYI: Folder state - ${JSON.stringify(state, null, 2)}`);
		readFile(filePath, 'utf8')
			.then(data => {
				const quotes = getQuotesBetweenHeaders(data);
				const currentQuotesHash = hashQuotes(quotes);
				console.log(`FYI: Current quotes hash: ${currentQuotesHash}`);
				const storedQuotesHash = state?.quotesHash;
				console.log(`FYI: Stored quotes hash: ${storedQuotesHash || 'N/A'}`);
				// If the quotes have changed, reset the dismissed state
				if (storedQuotesHash && (currentQuotesHash !== storedQuotesHash)) {
					// TODO: handle async
					context.globalState.update(folderPath, { quotesHash: currentQuotesHash, quotes: {} });
					console.log(`FYI: State has been reset due to changes in the ${filename} file.`);
				}
				quotes.forEach((quote, index) => {
					const quoteKey = `quote_${index}`;
					const dismissedPermanently = state?.quotes[quoteKey]?.dismissedPermanently || false;
					if (!dismissedPermanently) {
						const anchorRegex = /#([a-zA-Z0-9-_]+)$/;
						const anchorMatch = quote.match(anchorRegex);
						const anchor = anchorMatch && anchorMatch[0];
						const displayQuote = quote.replace(anchorRegex, '').trim();
						// TODO: handle async
						vscode.window.showInformationMessage(displayQuote, 'Learn More', 'Got it', 'Not now')
							.then((selection) => {
								switch (selection) {
									case 'Got it': {
										const newState = state || { quotesHash: '', quotes: {} };
										newState.quotesHash = currentQuotesHash;
										const newQuoteState = newState.quotes[quoteKey]
											? { ...newState.quotes[quoteKey], dismissedPermanently: true }
											: { dismissedPermanently: true };
										newState.quotes[quoteKey] = newQuoteState;
										context.globalState.update(folderPath, newState);
										console.log(`FYI: Dismissed permanently - ${quoteKey}`);
										break;
									}
									case 'Learn More': {
										const showPreviewCommandParams = vscode.Uri
											.file(filePath)
											.with({
												fragment: (anchor || '').replace('#', ''),
											});
										// TODO: handle async
										vscode.commands
											.executeCommand('markdown.showPreview', showPreviewCommandParams);
										// Once they've read the details, still not updating state,
										// so that the notification will appear again next time
										// and they can decide to dismiss it permanently then.
										break;
									}
									default:
										// No-op, just dismiss the notification without updating the state
										break;
								}
							});
					}
				});
			})
			.catch(err => {
				console.error(err);
				vscode.window.showWarningMessage(`Unable to read ${filename} - this file is required for the FYI extension to work properly.`);
			});
	});

	const resetDisposable = vscode.commands.registerCommand('fyi.resetDismissedNotifications', () => {
		console.log('FYI: Resetting dismissed notifications.');
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			console.log('FYI: No workspace folder is open.');
			return;
		}
		Promise.resolve()
			.then(() => {
				if (workspaceFolders.length > 1) {
					console.log('FYI: Multiple workspace folders are open - asking user to select one.');
					return vscode.window.showInformationMessage(
						'You have multiple workspace folders open. Please select one to reset dismissed notifications.',
						...workspaceFolders.map(folder => folder.name)
					).then((selection) => {
						return workspaceFolders.find(folder => folder.name === selection)?.uri.fsPath;
					});
				}
				return workspaceFolders[0].uri.fsPath;
			})
			.then(folderPath => {
				if (folderPath) {
					context.globalState.update(folderPath, { quotesHash: '', quotes: {} });
					return vscode.window
						.showInformationMessage('FYI: Dismissed notifications have been reset.');
				}
			})
			.catch((e) => {
				console.error(e);
				vscode.window.showErrorMessage('FYI: An error occurred while resetting dismissed notifications.');
			});
	});

	context.subscriptions.push(resetDisposable);
}

// Utility function to hash quotes
function hashQuotes(quotes: string[]): string {
	const hash = require('crypto').createHash('sha256');
	hash.update(quotes.join(''));
	return hash.digest('hex');
}

// This method is called when your extension is deactivated
export function deactivate() {}
