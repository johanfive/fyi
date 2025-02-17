import { readFile } from "node:fs/promises";
import { FILE_NAME, GENERATE_MD_CMD } from "./constants";
import getQuotesBetweenHeaders from "./getQuotesBetweenHeaders";
import { getFilePath, hashQuotes, log } from "./utils";

const parseMdFile = (
  folderPath: string,
): Promise<{ quotes: string[]; currentQuotesHash: string }> => {
  const filePath = getFilePath(folderPath);
  log(` Reading file from path: ${filePath}`);
  return readFile(filePath, "utf8")
    .then((data) => {
      const quotes = getQuotesBetweenHeaders(data);
      const currentQuotesHash = hashQuotes(quotes);
      log(` Current quotes hash: ${currentQuotesHash}`);
      return { quotes, currentQuotesHash };
    })
    .catch((error) => {
      if (error.code === "ENOENT") {
        error.message = `Missing ${FILE_NAME} file.`;
        error.isWarning = true;
        error.command = GENERATE_MD_CMD;
        error.commandArgs = [folderPath];
        error.buttonText = "Generate File";
      }
      throw error;
    });
};

export default parseMdFile;
