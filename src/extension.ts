import * as vscode from "vscode";
import { copyFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import getQuotesBetweenHeaders from "./getQuotesBetweenHeaders";

interface QuoteState {
	dismissedPermanently: boolean;
}

interface FolderState {
	quotesHash: string;
	quotes: Record<string, QuoteState>;
}

const EXTENSION_NAME = "FYI";
const FILE_NAME = "FYI.md";
const TEMPLATE_FILE_PATH = join(__dirname, FILE_NAME);
const DISMISS_PERMANENTLY = "Got it";
const DISMISS_TEMPORARILY = "Not now";
const LEARN_MORE = "Learn More";
const CRUCIAL_PREFIX = "(!)";
const log = (message: string) => console.log(`${EXTENSION_NAME}: ${message}`);

export function activate(context: vscode.ExtensionContext) {
	const { workspaceFolders } = vscode.workspace;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		log("No workspace folder is open!");
		return;
	}

	workspaceFolders.forEach((folder) => {
		const folderPath = folder.uri.fsPath;
		const filePath = join(folderPath, FILE_NAME);
		log(` Reading file from path: ${filePath}`);
		const state = context.globalState.get<FolderState>(folderPath);
		log(` Folder state - ${JSON.stringify(state, null, 2)}`);
		readFile(filePath, "utf8")
			.then((data) => {
				const quotes = getQuotesBetweenHeaders(data);
				const currentQuotesHash = hashQuotes(quotes);
				log(` Current quotes hash: ${currentQuotesHash}`);
				const storedQuotesHash = state?.quotesHash;
				log(` Stored quotes hash: ${storedQuotesHash || "N/A"}`);
				// If the quotes have changed, reset the dismissed state
				if (storedQuotesHash && (currentQuotesHash !== storedQuotesHash)) {
					// TODO: handle async
					context.globalState.update(folderPath, {
						quotesHash: currentQuotesHash,
						quotes: {},
					});
					log(` State has been reset due to changes in the ${FILE_NAME} file.`);
				}
				quotes.forEach((quote, index) => {
					const quoteKey = `quote_${index}`;
					const dismissedPermanently =
						state?.quotes[quoteKey]?.dismissedPermanently || false;
					if (!dismissedPermanently) {
						const anchorRegex = /#([a-zA-Z0-9-_]+)$/;
						const anchorMatch = quote.match(anchorRegex);
						const anchor = anchorMatch && anchorMatch[0];
						const displayQuote = quote.replace(anchorRegex, "").trim();
						const isCrucial = displayQuote.startsWith(CRUCIAL_PREFIX);
						const finalQuote = isCrucial
							? displayQuote.substring(3).trim()
							: displayQuote;
						const buttons = [];
						if (anchor) {
							buttons.push(LEARN_MORE);
						}
						buttons.push(DISMISS_PERMANENTLY);
						if (!isCrucial) {
							buttons.push(DISMISS_TEMPORARILY);
						}
						return vscode.window
							.showInformationMessage(
								finalQuote,
								{ modal: isCrucial },
								...buttons,
							)
							.then((selection) => {
								switch (selection) {
									case DISMISS_PERMANENTLY: {
										const newState = state || { quotesHash: "", quotes: {} };
										newState.quotesHash = currentQuotesHash;
										const newQuoteState = newState.quotes[quoteKey]
											? {
												...newState.quotes[quoteKey],
												dismissedPermanently: true,
											}
											: { dismissedPermanently: true };
										newState.quotes[quoteKey] = newQuoteState;
										context.globalState.update(folderPath, newState);
										log(` Dismissed permanently - ${quoteKey}`);
										break;
									}
									case LEARN_MORE: {
										const showPreviewCommandParams = vscode.Uri
											.file(filePath)
											.with({
												fragment: (anchor || "").replace("#", ""),
											});
										return vscode.commands
											.executeCommand(
												"markdown.showPreview",
												showPreviewCommandParams,
											);
										// Once they've read the details, still not updating state,
										// so that the notification will appear again next time
										// and they can decide to dismiss it permanently then.
									}
									default:
										// No-op, just dismiss the notification without updating the state
										break;
								}
							});
					}
				});
			})
			.catch((err) => {
				if (err.code === "ENOENT") {
					vscode.window.showWarningMessage(
						`Missing ${FILE_NAME} file in workspace at ${folderPath}.` +
							`\nThis file is required for the ${EXTENSION_NAME} extension to work.`,
					);
					return copyFile(TEMPLATE_FILE_PATH, filePath);
				}
				if (err.message === "Headers missing") {
					vscode.window.showWarningMessage(
						`Missing required headers in ${FILE_NAME} file in the workspace at ${folderPath}.`,
					);
					return;
				}
				console.error(err);
				vscode.window.showWarningMessage(
					"Something went awry, check the logs for more details.",
				);
			})
			.catch((err) => {
				console.error(err);
				vscode.window.showWarningMessage(
					`Unable to create an ${FILE_NAME} file. Create one manually to use the ${EXTENSION_NAME} extension.`,
				);
			});
	});

	const resetDisposable = vscode.commands.registerCommand(
		"fyi.resetDismissedNotifications",
		() => {
			log("Resetting dismissed notifications.");
			const { workspaceFolders } = vscode.workspace;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				log("No workspace folder is open.");
				return;
			}
			Promise.resolve()
				.then(() => {
					if (workspaceFolders.length > 1) {
						log(
							"Multiple workspace folders are open - asking user to select one.",
						);
						return vscode.window.showInformationMessage(
							"You have multiple workspace folders open. Please select one to reset dismissed notifications.",
							...workspaceFolders.map((folder) => folder.name),
						).then((selection) => {
							return workspaceFolders.find((folder) =>
								folder.name === selection
							)?.uri.fsPath;
						});
					}
					return workspaceFolders[0].uri.fsPath;
				})
				.then((folderPath) => {
					if (folderPath) {
						context.globalState.update(folderPath, {
							quotesHash: "",
							quotes: {},
						});
						return vscode.window
							.showInformationMessage(
								"Dismissed notifications have been reset.",
							);
					}
				})
				.catch((e) => {
					console.error(e);
					vscode.window.showErrorMessage(
						"An error occurred while resetting dismissed notifications.",
					);
				});
		},
	);

	context.subscriptions.push(resetDisposable);
}

// Utility function to hash quotes
function hashQuotes(quotes: string[]): string {
	return createHash("sha256")
		.update(quotes.join(""))
		.digest("hex");
}

// This method is called when your extension is deactivated
export function deactivate() {}
