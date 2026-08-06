import { PDFParse } from "pdf-parse";
import { TurnIntoTRON } from "./json-tron.js";

export async function processPdfExtraction() {
  const pdfUrl = "https://hijwuidftauwnhksgxfr.supabase.co/storage/v1/object/public/rag_documents/Resume.pdf";
  const pdf2url = "https://bitcoin.org/bitcoin.pdf"

  // Pass a URL instance as the first argument
  const parser = new PDFParse(new URL(pdf2url));

  // Await the asynchronous text extraction
  const pdfText = await parser.getText();

  return {
    data: pdfText
  };
}
