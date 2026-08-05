import { supabase } from "../lib/supabase.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatGroq, GroqEmbeddings } from "@langchain/groq";

const BUCKET_NAME = "rag-documents";

// Reusable instances
const embeddings = new GroqEmbeddings({ maxRetries: 2 });
const llm = new ChatGroq({
  model: "llama-3.1-70b-versatile",
  temperature: 0,
});

// 1. Ingestion Stage: Downloads file from Supabase Storage, parses,chunks, and indexes vectors linked to a specific user_id.

export async function ingestStorageDocument(filePath, userId) {
  // Download file blob from storage
  const { data: fileBlob, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) throw error;

  // Parse file content
  const loader = new PDFLoader(fileBlob);
  const rawDocs = await loader.load();

  // Chunk documents
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const docs = await splitter.splitDocuments(rawDocs);

  // Map user_id and storage_path into metadata for row-level/jsonb filtering
  const docsWithMetadata = docs.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: {
      ...doc.metadata,
      user_id: userId,
      storage_path: filePath,
    },
  }));

  // Store in Supabase Vector Table
  await SupabaseVectorStore.fromDocuments(docsWithMetadata, embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
  });

  return { success: true, totalChunks: docsWithMetadata.length };
}


// 2. Retrieval & Generation Stage: Queries user-isolated vectors
export async function askQuestion(question, userId) {
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
  });

  // Filter context specifically to the querying user
  const retriever = vectorStore.asRetriever({
    k: 3,
    filter: { user_id: userId },
  });

  const relevantDocs = await retriever.invoke(question);

  if (!relevantDocs.length) {
    return {
      answer: "I don't know based on the provided documents.",
      sources: [],
    };
  }

  // Generate signed URLs for referenced source files
  const sourcePaths = [
    ...new Set(relevantDocs.map((d) => d.metadata.storage_path).filter(Boolean)),
  ];

  const sources = await Promise.all(
    sourcePaths.map(async (path) => {
      const { data } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, 3600); // 1-hour expiration

      return { path, url: data?.signedUrl ?? null };
    })
  );

  // Synthesize answer using retrieved context
  const context = relevantDocs.map((d) => d.pageContent).join("\n\n");

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "Answer only from the provided context. If the context is insufficient, say you don't know.",
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${question}`,
    },
  ]);

  return {
    answer: result.content,
    sources,
  };
}