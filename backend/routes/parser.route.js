import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { processPdfExtraction } from "../layers/text-extraction.js";
import { TurnIntoTRON } from "../layers/json-tron.js";
import { chunkPdfData } from "../layers/json-chunks-process.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/extract", upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "No file uploaded. Use field name 'file'." });
    }

    const data = await processPdfExtraction(file.buffer);
    const chunks = chunkPdfData(data.data)
    const TRON_FORMAT = TurnIntoTRON(chunks)
    res.status(200).json({ success: true, data: data.data, chunks, TRON: TRON_FORMAT });
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
