import PDFParser from "pdf2json";

export async function extractPdfText(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true); // true = extract text only (fast mode)

    pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      // Stream raw text directly without constructing complex layout trees
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.loadPDF(filePath);
  });
}
