import pdfImg from 'pdf-img-convert';
import { createWorker } from 'tesseract.js';

export async function extractPdfTextWithOcr(filePath) {
  const pages = await pdfImg.convert(filePath, { scale: 2.0 });
  const worker = await createWorker('eng');

  const pageTexts = [];
  for (const pageBuffer of pages) {
    const { data: { text } } = await worker.recognize(pageBuffer);
    pageTexts.push(text);
  }

  await worker.terminate();

  return cleanTextForLLM(pageTexts.join('\n\n'));
}

function cleanTextForLLM(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}