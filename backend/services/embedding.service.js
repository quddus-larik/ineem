import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export async function generateEmbedding(text) {
  if (!text?.trim()) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });
  const vector = await embeddings.embedQuery(text);
  console.log("Vector Produced Length:", vector.length);

  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Embedding provider returned an invalid vector");
  }

  return vector;
}
