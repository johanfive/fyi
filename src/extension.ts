import * as vscode from "vscode";
import resetDismissedNotifications from "./resetDismissedNotifications";
import notify from "./notify";
import generateMdFile from "./generateMdFile";
import handleFileChange from "./handleFileChange";
import {
	FILE_NAME,
	GENERATE_MD_CMD,
	RECOMMEND_CMD,
	RESET_DISSMISSED_CMD,
} from "./constants";
import addToWorkspaceRecommendations from "./recommend";

export function activate(context: vscode.ExtensionContext) {
	notify(context);

	const resetDismissedDisposable = vscode.commands.registerCommand(
		RESET_DISSMISSED_CMD,
		resetDismissedNotifications(context),
	);

	const generateMdFileDisposable = vscode.commands.registerCommand(
		GENERATE_MD_CMD,
		generateMdFile,
	);

	const fsWatcherDisposable = vscode.workspace.createFileSystemWatcher(
		`**/${FILE_NAME}`,
	);
	fsWatcherDisposable.onDidChange((uri) => handleFileChange(context, uri));
	fsWatcherDisposable.onDidCreate((uri) => handleFileChange(context, uri));
	fsWatcherDisposable.onDidDelete((uri) =>
		console.log(`${uri.fsPath} deleted`)
	);

	const disposable = vscode.commands.registerCommand(
		RECOMMEND_CMD,
		addToWorkspaceRecommendations,
	);

	context.subscriptions.push(resetDismissedDisposable);
	context.subscriptions.push(generateMdFileDisposable);
	context.subscriptions.push(fsWatcherDisposable);
	context.subscriptions.push(disposable);
}

export function deactivate() {}
