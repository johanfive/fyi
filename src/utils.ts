import * as vscode from "vscode";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  CRUCIAL_PREFIX,
  DISMISS_PERMANENTLY,
  DISMISS_TEMPORARILY,
  EXTENSION_NAME,
  FILE_NAME,
  FolderState,
  LEARN_MORE,
} from "./constants";

export const log = (message: string) =>
  console.log(`${EXTENSION_NAME}: ${message}`);

export const hashQuotes = (quotes: string[]): string =>
  createHash("sha256")
    .update(quotes.join(""))
    .digest("hex");

export const parseQuote = (quote: string) => {
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
  return { finalQuote, anchor, buttons, isCrucial };
};

export const getState = (
  context: vscode.ExtensionContext,
  folderPath: string,
) => context.globalState.get<FolderState>(folderPath);

export const getFilePath = (folderPath: string) => join(folderPath, FILE_NAME);
