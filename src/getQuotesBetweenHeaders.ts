const getQuotesBetweenHeaders = (markdown: string, h1 = '# FYI', h2 = '# Details') => {
  const lines = markdown.split('\n');
  let quotes = [];
  let isBetweenHeaders = false;
  let multilineQuote = '';

  lines.forEach(line => {
      if (line.startsWith(h1)) {
          isBetweenHeaders = true;
      } else if (line.startsWith(h2)) {
          isBetweenHeaders = false;
      }

      // If we are between the headers, collect quotes
      if (isBetweenHeaders) {
          if (line.startsWith('>')) {
              multilineQuote += line.slice(1).trim() + '\n';
          } else if (multilineQuote) {
              quotes.push(multilineQuote.trim());
              multilineQuote = '';
          }
      }
  });

  if (multilineQuote) {
      quotes.push(multilineQuote.trim());
  }

  return quotes;
};

export default getQuotesBetweenHeaders;
