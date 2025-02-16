import * as vscode from "vscode";
import selectWorkspaceThenDo from "./selectWorkspaceThenDo";
import { Action } from "./constants";

const resetFolderState =
  (context: vscode.ExtensionContext): Action => (folderPath) => {
    context.globalState.update(folderPath, {
      quotesHash: "",
      quotes: {},
    });
    return vscode.window
      .showInformationMessage(
        "Dismissed notifications have been reset.",
      );
  };

const resetDismissedNotifications =
  (context: vscode.ExtensionContext) => () => {
    selectWorkspaceThenDo(
      "reset dissmissed notifications",
      resetFolderState(context),
    );
  };

export default resetDismissedNotifications;
