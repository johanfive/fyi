import { FILE_NAME } from "./constants";

const getQuotesBetweenHeaders = (
    markdown: string,
    openingHeader = "# FYI",
    closingHeader = "# Details",
) => {
    const lines = markdown.split("\n");
    let quotes = [];
    let currentQuote = "";
    let isBetweenHeaders = false;
    let openingHeaderExists = false;
    let closingHeaderExists = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith(openingHeader)) {
            isBetweenHeaders = true;
            openingHeaderExists = true;
        } else if (line.startsWith(closingHeader)) {
            isBetweenHeaders = false;
            closingHeaderExists = true;
            break;
        }
        // If we are between the headers, collect quotes
        if (isBetweenHeaders) {
            if (line.startsWith(">")) {
                currentQuote += line.slice(1).trim() + "\n";
            } else if (currentQuote) {
                quotes.push(currentQuote.trim());
                currentQuote = "";
            }
        }
    }
    // Without this check,
    // the last quote in the markdown might be missed
    // if it doesn't end with a new line
    if (currentQuote) {
        quotes.push(currentQuote.trim());
    }
    if (openingHeaderExists && closingHeaderExists) {
        return quotes;
    }
    throw new Error(`Headers missing in ${FILE_NAME}`);
};

export default getQuotesBetweenHeaders;
