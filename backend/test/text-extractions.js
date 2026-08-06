import { extractPdfTextWithOcr } from "../layers/text-extraction";

async function Run() {
    let data = await extractPdfTextWithOcr("../uploads/1785860236802.pdf");

    return data;
}