import { NextResponse, NextRequest } from "next/server";
import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { SystemMessage } from "@langchain/core/messages";
import { supabase } from "@/lib/supabase/client";

const messagesHistories: Record<string, ChatMessageHistory> = {};

const loadHistoryFromDb = async (
  sessionId: string
): Promise<ChatMessageHistory> => {
  if (messagesHistories[sessionId]) {
    return messagesHistories[sessionId];
  }

  const history = new ChatMessageHistory();

  messagesHistories[sessionId] = history;

  try {
    const { data, error } = await supabase
      .from("chat")
      .select("role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error || !data) {
      if (error) {
        console.error(
          "Failed to load history from DB:",
          error
        );
      }

      return history;
    }

    for (const row of data) {
      const role = (row as any).role;
      const content = (row as any).content;

      const text =
        typeof content === "string"
          ? content
          : content?.text ||
          JSON.stringify(content);

      try {
        if (role === "user") {
          await history.addUserMessage(text);
        } else if (role === "assistant") {
          await history.addAIMessage(text);
        } else {
          await history.addMessage(
            new SystemMessage(text)
          );
        }
      } catch (error) {
        console.warn(
          "Failed to populate history:",
          sessionId,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      "Error loading history from Supabase:",
      error
    );
  }

  return history;
};

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

        if (
          typeof item === "object" &&
          item !== null &&
          "text" in item
        ) {
          return String(
            (item as { text?: unknown }).text || ""
          );
        }

        return "";
      })
      .join("");
  }

  return String(content ?? "");
}

function parseJsonResponse(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error(
        "Invalid JSON response from classifier"
      );
    }

    return JSON.parse(match[0]);
  }
}

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message = body?.message;
    const sessionId = body?.sessionId;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof sessionId !== "string" ||
      !sessionId.trim()
    ) {
      return NextResponse.json(
        {
          error: "sessionId is required",
        },
        { status: 400 }
      );
    }

    const userMessage = message.trim();

    const useMemory = (body && typeof body.useMemory !== "undefined") ? Boolean(body.useMemory) : true;

    const history = useMemory ? await loadHistoryFromDb(sessionId) : new ChatMessageHistory();

    if (useMemory) {
      const { error: userInsertError } =
        await supabase.from("chat").insert([
          {
            session_id: sessionId,
            role: "user",
            content: {
              text: userMessage,
            },
          },
        ]);

      if (userInsertError) {
        console.error(
          "Failed to save user message:",
          userInsertError
        );
      }
    }

    const prompt =
      ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are a helpful AI assistant.

Respond concisely and helpfully.

You have access to the previous conversation
through the conversation history.

Use the conversation history when it is relevant.

Do not claim to have fetched emails or external
data unless the user explicitly provides that data.`,
        ],

        new MessagesPlaceholder("history"),

        ["human", "{input}"],
      ]);

    const chain = prompt.pipe(llm);

    const conversationalChain =
      new RunnableWithMessageHistory({
        runnable: chain,

        getMessageHistory: (
          id: string
        ) => {
          return (
            messagesHistories[id] ||
            new ChatMessageHistory()
          );
        },

        inputMessagesKey: "input",

        historyMessagesKey: "history",
      });

    const response =
      await conversationalChain.invoke(
        {
          input: userMessage,
        },
        {
          configurable: {
            sessionId,
          },
        }
      );

    const content = contentToString(
      response?.content
    );

    if (useMemory) {
      const { error: assistantInsertError } =
        await supabase.from("chat").insert([
          {
            session_id: sessionId,
            role: "assistant",
            content: {
              text: content,
            },
          },
        ]);

      if (assistantInsertError) {
        console.error(
          "Failed to save assistant message:",
          assistantInsertError
        );
      }
    }

    return NextResponse.json({
      type: "conversation",
      response: content,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
