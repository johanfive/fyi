import * as vscode from "vscode";
import { getState, log } from "./utils";
import { FILE_NAME } from "./constants";
import parseMdFile from "./parseMdFile";
import sendNotification from "./sendNotification";

const notify = (context: vscode.ExtensionContext) => {
  const { workspaceFolders } = vscode.workspace;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    log("No workspace folder is open!");
    return;
  }
  workspaceFolders.forEach((folder) => {
    const folderPath = folder.uri.fsPath;
    const state = getState(context, folderPath);
    log(` Folder state - ${JSON.stringify(state, null, 2)}`);
    parseMdFile(folderPath)
      .then(({ quotes, currentQuotesHash }) => {
        if (!state || state.quotesHash !== currentQuotesHash) {
          log(
            state
              ? `Resetting state due to changes in the ${FILE_NAME} file.`
              : "Init - setting state",
          );
          return context.globalState.update(folderPath, {
            quotesHash: currentQuotesHash,
            quotes: {},
          }).then(() => ({ quotes, currentQuotesHash }));
        }
        return { quotes, currentQuotesHash };
      })
      .then(({ quotes, currentQuotesHash }) => {
        const notificationPromises = quotes.map(
          sendNotification(context, folderPath, currentQuotesHash),
        );
        return Promise.allSettled(notificationPromises);
      })
      .catch((error) => {
        vscode.window.showErrorMessage(error.message);
      })
      .then((outcome) => {
        if (Array.isArray(outcome)) {
          const errors = outcome
            .filter((o) => o.status === "rejected")
            .map((o) => o.reason)
            .join(", ");
          vscode.window.showErrorMessage(errors);
        }
      });
  });
};

export default notify;
