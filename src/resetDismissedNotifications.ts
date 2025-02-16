import * as vscode from "vscode";
import selectWorkspaceThenDo from "./selectWorkspaceThenDo";

const resetFolderState =
  (context: vscode.ExtensionContext) => (folderPath: string) => {
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
