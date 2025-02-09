const getQuotesBetweenHeaders = (
    markdown: string,
    h1 = "# FYI",
    h2 = "# Details",
) => {
    const lines = markdown.split("\n");
    let quotes = [];
    let isBetweenHeaders = false;
    let currentQuote = "";
    let h1Exists = false;
    let h2Exists = false;
    lines.forEach((line) => {
        if (line.startsWith(h1)) {
            isBetweenHeaders = true;
            h1Exists = true;
        } else if (line.startsWith(h2)) {
            isBetweenHeaders = false;
            h2Exists = true;
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
    });
    if (currentQuote) {
        quotes.push(currentQuote.trim());
    }
    if (h1Exists && h2Exists) {
        return quotes;
    }
    throw new Error("Headers missing");
};

export default getQuotesBetweenHeaders;
