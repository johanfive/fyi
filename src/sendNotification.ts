import * as vscode from "vscode";
import { getFilePath, getState, log, parseQuote } from "./utils";
import { DISMISS_PERMANENTLY, LEARN_MORE } from "./constants";

const sendNotification = (
  context: vscode.ExtensionContext,
  folderPath: string,
  currentQuotesHash: string,
) =>
(quote: string, index: number) => {
  const quoteKey = `quote_${index}`;
  const state = getState(context, folderPath);
  const dismissedPermanently = state?.quotes[quoteKey]?.dismissedPermanently ||
    false;
  if (dismissedPermanently) {
    return Promise.resolve();
  }
  const { finalQuote, isCrucial, buttons, anchor } = parseQuote(quote);
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
          return context.globalState
            .update(folderPath, newState)
            .then(() => {
              log(` Dismissed permanently - ${quoteKey}`);
            });
        }
        case LEARN_MORE: {
          const showPreviewCommandParams = vscode.Uri
            .file(getFilePath(folderPath))
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
          return;
      }
    });
};

export default sendNotification;
