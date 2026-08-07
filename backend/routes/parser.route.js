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

router.post("/extract", upload.single("file"), async (req, res) => {
  try {

    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded. Use field name 'file'." });
    }

    const file = req.file;
    const CompanyId = req.body.company_id;
    const documentId = req.body.document_id;

    // Upload into Supabase Storage returnn { path: string }
    const uploadedDoc = await uploadDocument(CompanyId,documentId,file);

    // Store in Supabase DB (document data)
    const { data: DBdata, error } = await  supabase
      .from("documents")
      .insert({
        storage_path: uploadedDoc.path,
        filename: file.originalname,
      }).eq("company_id", CompanyId);

    // Data Extraction
    const data = await processPdfExtraction(file.buffer);
    // Turn into chunks
    const chunks = chunkPdfData(data.data);

    // Embeddings Phase (External) OR (Local Compilations)
    const vector = await generateEmbedding(TurnIntoTRON(data.data));

    const { data: vectorData ,error: vectorError  } = await supabase.from("")

    res.status(200).json({ success: true, data: data.data, chunks });
  } catch (err) {
    res.status(500).json({ success: false, error: "Extraction failed", details: err.message });
  }
});

router.get("/", (req, res) => {
  res.json({
    message: "hello world",
  });
});

export const ParserRoute = router;
