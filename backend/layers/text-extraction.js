import pdfParse from "pdf-parse";

// Accepts a Buffer (uploaded file) and returns { data: string }
export async function processPdfExtraction(buffer) {
  if (!buffer) {
    throw new Error("No file buffer provided for extraction");
  }

  // pdf-parse returns an object with text (full document) and numpages
  const result = await pdfParse(buffer);
  const text = result?.text || "";

  return {
    data: text,
    meta: { numpages: result?.numpages ?? null },
  };
}
