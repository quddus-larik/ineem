import { NextRequest } from "next/server";
import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { supabase } from "@/lib/supabase/client";
import { createSession } from "@/lib/db/chat";
import { SupabaseChatMessageHistory } from "@/lib/langchain/supabase_chat_history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentToString(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (typeof item === "object" && item !== null && "text" in item) {
          return String((item as { text?: unknown }).text || "");
        }

        return "";
      })
      .join("");
  }

  return String(content ?? "");
}

const llm = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY!,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful AI assistant.

Respond concisely and helpfully.

You have access to the previous conversation through the conversation history.

Use the conversation history when it is relevant.

Do not claim to have fetched emails or external data unless the user explicitly provides that data.`,
  ],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const chain = prompt.pipe(llm);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message = body?.message;
    let sessionId = body?.sessionId;
    const userId = body?.userId;
    const useMemory =
      body && typeof body.useMemory !== "undefined"
        ? Boolean(body.useMemory)
        : true;

    if (typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userMessage = message.trim();

    // Create a session in DB if one was not provided.
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      let uid: string | undefined = userId;

      if (!uid) {
        const { data: userData } = await supabase.auth.getUser();
        uid = userData?.user?.id;
      }

      if (!uid) {
        return new Response(
          JSON.stringify({
            error: "Cannot create session: missing user",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const title = userMessage.slice(0, 60) || "Chat session";
      const newId = await createSession(uid, title);

      if (!newId) {
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      sessionId = newId;
    }

    // Session-scoped, DB-backed history is the single source of truth.
    // RunnableWithMessageHistory persists the user + assistant messages
    // to the `chat` table automatically via SupabaseChatMessageHistory.
    const conversationalChain = new RunnableWithMessageHistory({
      runnable: chain,

      getMessageHistory: (id: string) =>
        useMemory
          ? new SupabaseChatMessageHistory(id)
          : new ChatMessageHistory(),

      inputMessagesKey: "input",

      historyMessagesKey: "history",
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        // Tell the client which session is being used (handy when we
        // just created one).
        send("session", { sessionId });

        try {
          let full = "";

          const llmStream = await conversationalChain.stream(
            { input: userMessage },
            { configurable: { sessionId } }
          );

          for await (const chunk of llmStream) {
            const token = contentToString(chunk?.content);

            if (token) {
              full += token;
              send("token", { token });
            }
          }

          send("done", { sessionId, response: full });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Stream failed";
          console.error("Stream error:", error);
          send("error", { error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Session-Id": String(sessionId),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response(
      JSON.stringify({ error: error?.message || "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
