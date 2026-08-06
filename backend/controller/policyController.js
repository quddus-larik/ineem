import { ingestStorageDocument, askQuestion } from "../pipeline/rag.js";

// Ingest the file from the user given data
export async function handleIngestPolicy(req, res) {
  try {
    const { filePath, userId } = req.body;

    if (!filePath || !userId) {
      return res.status(400).json({
        success: false,
        error: "Both 'filePath' and 'userId' are required in request body.",
      });
    }

    const result = await ingestStorageDocument(filePath, userId);

    return res.status(200).json({
      success: true,
      message: "Company policy successfully ingested and vectorized.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to ingest company policy document.",
    });
  }
}

// POST /api/policies/audit
export async function handleAuditPolicy(req, res) {
  try {
    const { contractText, userId } = req.body;

    if (!contractText || !userId) {
      return res.status(400).json({
        success: false,
        error: "Both 'contractText' and 'userId' are required in request body.",
      });
    }

    // Formulate a structured audit query prompt for your RAG pipeline
    const auditPrompt = `
You are Policy Pilot, an automated compliance auditor. 
Audit the target contract below against the company policy context retrieved.

Analyze the contract and provide:
1. Overall Risk Level (LOW, MEDIUM, HIGH)
2. Summary of compliance findings
3. Specific clauses that violate the company policy along with the reasons and specific risk level per violation.

Target Contract text to audit:
"${contractText}"
`;

  
    const ragResult = await askQuestion(auditPrompt, userId);

    return res.status(200).json({
      success: true,
      data: {
        auditReport: ragResult.answer,
        referencedPolicies: ragResult.sources,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to complete Policy Pilot audit.",
    });
  }
}