import * as vscode from "vscode";
import { exec } from "node:child_process";
import notify from "./notify";

const handleFileChange = (
  context: vscode.ExtensionContext,
  uri: vscode.Uri,
) => {
  const filePath = uri.fsPath;
  const folderPath = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
  if (!folderPath) {
    return;
  }
  exec("git config user.email", { cwd: folderPath }, (err, stdout) => {
    if (err) {
      vscode.window.showErrorMessage(
        `Error getting git user email: ${err.message}`,
      );
      return;
    }
    const currentUserEmail = stdout.trim();
    exec(
      `git log -1 --pretty=format:%ae ${filePath}`,
      { cwd: folderPath },
      (err, stdout) => {
        if (err) {
          if (err.message.includes("Not a git repository")) {
            vscode.window.showWarningMessage(
              `The folder ${folderPath} is not a git repository.`,
            );
          } else {
            vscode.window.showErrorMessage(
              `Error getting git log: ${err.message}`,
            );
          }
          return;
        }
        const lastAuthorEmail = stdout.trim();
        let logMsg = `File was modified by ${lastAuthorEmail}`;
        if (lastAuthorEmail !== currentUserEmail) {
          console.log("Notify - ", logMsg);
          notify(context);
        } else {
          console.log("Skip - ", logMsg);
        }
      },
    );
  });
};

export default handleFileChange;
