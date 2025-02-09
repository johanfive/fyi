import * as vscode from "vscode";
import { log } from "./utils";

const resetDismissedNotifications =
  (context: vscode.ExtensionContext) => () => {
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
            return workspaceFolders.find((folder) => folder.name === selection)
              ?.uri.fsPath;
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
  };

export default resetDismissedNotifications;
