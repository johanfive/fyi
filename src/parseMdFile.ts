import * as vscode from "vscode";
import { copyFile, readFile } from "node:fs/promises";
import { EXTENSION_NAME, FILE_NAME, TEMPLATE_FILE_PATH } from "./constants";
import getQuotesBetweenHeaders from "./getQuotesBetweenHeaders";
import { getFilePath, hashQuotes, log } from "./utils";

const parseMdFile = (
  folderPath: string,
): Promise<{ quotes: string[]; currentQuotesHash: string }> => {
  const filePath = getFilePath(folderPath);
  log(` Reading file from path: ${filePath}`);
  const fileAtLocation = `${FILE_NAME} file in workspace at ${folderPath}`;
  return readFile(filePath, "utf8")
    .then((data) => {
      const quotes = getQuotesBetweenHeaders(data);
      const currentQuotesHash = hashQuotes(quotes);
      log(` Current quotes hash: ${currentQuotesHash}`);
      return { quotes, currentQuotesHash };
    })
    .catch((error) => {
      if (error.code === "ENOENT") {
        return copyFile(TEMPLATE_FILE_PATH, filePath)
          .then(() => {
            vscode.window.showInformationMessage(
              `${EXTENSION_NAME} created missing ${fileAtLocation}.`,
            );
            return parseMdFile(folderPath);
          });
      }
      throw error;
    });
};

export default parseMdFile;
