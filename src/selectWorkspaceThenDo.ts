import * as vscode from "vscode";
import { log } from "./utils";

type Action = (folderPath: string) => void;

const selectWorkspaceThenDo = (description: string, action: Action) => {
  log(description);
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
          `You have multiple workspace folders open. Please select one to ${description}.`,
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
        action(folderPath);
      }
    })
    .catch((e) => {
      console.error(e);
      vscode.window.showErrorMessage(
        `An error occurred while attempting to ${description}.`,
      );
    });
};

export default selectWorkspaceThenDo;
