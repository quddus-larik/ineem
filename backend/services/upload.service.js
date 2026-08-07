import { supabase } from "../lib/supabase.js";

const BUCKET = "documents";

export async function uploadDocument({ companyId, documentId, file }) {
  const extension = file.originalname.split(".").pop() || "pdf";

  const path = `${companyId}/${documentId}/original.${extension}`;

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return {
    path: data.path,
  };
}
