import * as vscode from "vscode";
import resetDismissedNotifications from "./resetDismissedNotifications";
import notify from "./notify";

export function activate(context: vscode.ExtensionContext) {
	notify(context);

	const resetDisposable = vscode.commands.registerCommand(
		"fyi.resetDismissedNotifications",
		resetDismissedNotifications(context),
	);

	context.subscriptions.push(resetDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
