import { Router } from "express";
import { handleIngestPolicy, handleAuditPolicy } from "../controllers/policyController.js";

const router = Router();

// Ingest master policies from Supabase storage
router.post("/ingest", handleIngestPolicy);

// Audit new contracts against ingested policies
router.post("/audit", handleAuditPolicy);

export const policyRoute = router;