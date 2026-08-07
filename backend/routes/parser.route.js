import express from "express";
import multer from "multer";
import { processPdfExtraction } from "../layers/text-extraction.js";
import { chunkPdfData } from "../layers/json-chunks-process.js";
import { uploadDocument } from "../services/upload.service.js";
import { supabase } from "../lib/supabase.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { TurnIntoTRON } from "../layers/json-tron.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

router.post("/extract", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded. Use field name 'file'." });
    }

    const CompanyId = req.body.company_id;
    const documentId = req.body.document_id;

    if (!CompanyId) {
      return res.status(400).json({ success: false, error: "company_id is required in body" });
    }

    // Upload to storage
    const uploadedDoc = await uploadDocument({ companyId: CompanyId, documentId, file });

    // Create document record (mark processing)
    const docInsert = {
      company_id: CompanyId,
      storage_path: uploadedDoc.path,
      filename: file.originalname,
      status: "processing",
    };
    if (documentId) docInsert.id = documentId;

    const { data: DBdata, error: docError } = await supabase.from("documents").insert(docInsert).select();
    if (docError) throw docError;

    const docRecord = Array.isArray(DBdata) && DBdata.length ? DBdata[0] : null;
    const docId = docRecord?.id || documentId;

    // Extract text from uploaded file buffer
    const extracted = await processPdfExtraction(file.buffer);
    // If extraction returned a plain string, wrap into pages for the chunker
    const pdfData = extracted && extracted.data && typeof extracted.data === "string"
      ? { pages: [{ num: 1, text: extracted.data }] }
      : extracted.data;

    // Create chunks
    const chunks = chunkPdfData(pdfData);

    // For each chunk generate embedding and insert into document_chunks
    const rows = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const content = chunk.pageContent;
      const vector = await generateEmbedding(TurnIntoTRON(content));

      rows.push({
        document_id: docId,
        company_id: CompanyId,
        chunk_index: i,
        section: chunk.metadata?.section || null,
        page_start: chunk.metadata?.page || null,
        page_end: chunk.metadata?.page || null,
        content,
        token_count: estimateTokens(content),
        metadata: chunk.metadata || {},
        embedding: vector,
      });
    }

    if (rows.length) {
      const { data: chunkData, error: chunkError } = await supabase.from("document_chunks").insert(rows).select();
      if (chunkError) throw chunkError;
    }

    // Update document record to completed and attach extracted text + page count
    const pageCount = Array.isArray(pdfData.pages) ? pdfData.pages.length : null;
    const { error: updateErr } = await supabase
      .from("documents")
      .update({ status: "completed", content: typeof extracted.data === "string" ? extracted.data : JSON.stringify(extracted.data), page_count: pageCount })
      .eq("id", docId);

    if (updateErr) {
      // log but don't fail the whole request
      console.error("Failed to update document record:", updateErr);
    }

    res.status(200).json({ success: true, document_id: docId, chunks: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Extraction failed", details: err.message || err });
  }
});

router.get("/", (req, res) => {
  res.json({
    message: "hello world",
  });
});

export const ParserRoute = router;
