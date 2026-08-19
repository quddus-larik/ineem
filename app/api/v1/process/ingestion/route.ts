import { NextRequest } from "next/server";
import { Octokit } from "@octokit/rest";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const { repositoryId, repoFullName, accessToken } = await req.json();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (event: string, data: Record<string, any>) => {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(payload));
  };

  // Run the indexing pipeline asynchronously
  (async () => {
    try {
      await sendEvent("status", {
        message: "Fetching repository tree from GitHub...",
      });

      const octokit = new Octokit({ auth: accessToken });
      const [owner, repo] = repoFullName.split("/");

      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      const { data: treeData } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "true",
      });

      const codeFiles = treeData.tree.filter(
        (item) =>
          item.type === "blob" &&
          item.path &&
          /\.(js|ts|jsx|tsx|py|go|rs|java|cpp|c|md|json)$/i.test(item.path) &&
          !item.path.includes("node_modules/") &&
          !item.path.includes(".git/")
      );

      await sendEvent("status", {
        message: `Found ${codeFiles.length} files. Starting chunking & embedding...`,
        totalFiles: codeFiles.length,
      });

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      for (let i = 0; i < codeFiles.length; i++) {
        const file = codeFiles[i];

        try {
          const { data: blob } = await octokit.git.getBlob({
            owner,
            repo,
            file_sha: file.sha!,
          });

          const fileContent = Buffer.from(blob.content, "utf-8").toString(
            "utf-8"
          );
          const chunks = await splitter.splitText(fileContent);

          if (chunks.length > 0) {
            // Generate Google embeddings for chunks in parallel
            const embeddingPromises = chunks.map((chunk) =>
              ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: chunk,
                config: {
                  taskType: "RETRIEVAL_DOCUMENT",
                },
              })
            );

            const embeddingResults = await Promise.all(embeddingPromises);

            const records = chunks.map((chunk, idx) => ({
              repository_id: repositoryId,
              file_path: file.path!,
              chunk_index: idx,
              content: chunk,
              embedding: embeddingResults[idx].embedding.values,
            }));

            await supabase.from("code_embeddings").insert(records);
          }

          await sendEvent("progress", {
            currentFile: file.path,
            processed: i + 1,
            total: codeFiles.length,
            percentage: Math.round(((i + 1) / codeFiles.length) * 100),
          });
        } catch (err: any) {
          await sendEvent("file_error", {
            file: file.path,
            error: err.message,
          });
        }
      }

      await sendEvent("completed", {
        message: "Repository indexed successfully!",
      });
    } catch (error: any) {
      await sendEvent("error", { message: error.message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}