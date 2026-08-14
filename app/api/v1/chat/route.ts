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

    const classifierResponse = await llm.invoke(`
You are an AI request classifier.

Classify the user's request into exactly one of these types:

1. find-email
2. conversation

Use "find-email" when the user wants to:
- find emails
- search emails
- show emails
- list emails
- get emails
- find unread emails
- find emails from someone
- find emails to someone
- find emails with a subject
- find emails with attachments
- search Gmail
- search their inbox
- retrieve matching emails

Use "conversation" for everything else.

For find-email requests, convert the user's request
into a valid Gmail search query.

Supported Gmail operators:

is:read
is:unread
from:email@example.com
to:email@example.com
cc:email@example.com
subject:invoice
has:attachment
filename:pdf
in:inbox
is:starred
is:important
newer_than:7d
older_than:30d
after:2026/01/01
before:2026/08/01

Examples:

User:
Show unread emails

Result:
{
  "type": "find-email",
  "query": "is:unread",
  "maxResults": 10,
  "actions": "list_messages"
}

User:
Show unread emails from abc@gmail.com

Result:
{
  "type": "find-email",
  "query": "from:abc@gmail.com is:unread",
  "maxResults": 10,
  "actions": "list_messages"
}

User:
Give me emails from abc@gmail.com

Result:
{
  "type": "find-email",
  "query": "from:abc@gmail.com",
  "maxResults": 10,
  "actions": "list_messages"
}

User:
Show emails from abc@gmail.com in my inbox

Result:
{
  "type": "find-email",
  "query": "from:abc@gmail.com in:inbox",
  "maxResults": 10,
  "actions": "list_messages"
}

User:
Show unread PDF emails

Result:
{
  "type": "find-email",
  "query": "is:unread filename:pdf",
  "maxResults": 10,
  "actions": "list_messages"
}

For conversation requests, return:

{
  "type": "conversation"
}

IMPORTANT RULES:

- Return ONLY valid JSON.
- Do not use markdown.
- Do not add explanations.
- Never fetch emails.
- Never call any API.
- Never invent email results.
- maxResults must always be 10 for find-email.
- actions must always be "list_messages" for find-email.

User request:
${userMessage}
`);

    const classificationText = contentToString(
      classifierResponse.content
    ).trim();

    const classification =
      parseJsonResponse(classificationText);

    if (classification.type === "find-email") {
      const emailQuery =
        typeof classification.query === "string"
          ? classification.query
          : "";
      const maxResults = 10;

      try {
        const emailsUrl = new URL("/api/v1/emails", req.url);
        emailsUrl.searchParams.set("action", "list_messages");
        emailsUrl.searchParams.set("query", emailQuery);
        emailsUrl.searchParams.set("maxResults", String(maxResults));
        emailsUrl.searchParams.set("user_id", sessionId);

        const authHeader = req.headers.get("authorization");

        const emailsRes = await fetch(emailsUrl.toString(), {
          method: "GET",
          cache: "no-store",
          headers: authHeader ? { Authorization: authHeader } : undefined,
        });

        const emailsData = await emailsRes.json().catch(() => null);

        if (!emailsRes.ok) {
          // Save error to chat and return empty content response
          try {
            await saveChatMessage(sessionId, "assistant", "");
            await saveChatMessage(sessionId, "assistant", String(emailsData || "Failed to fetch emails."));
          } catch (saveErr) {
            console.error("Failed to save error messages:", saveErr);
          }

          return NextResponse.json(
            {
              type: "find-email",
              query: emailQuery,
              maxResults,
              actions: "list_messages",
              error: emailsData || "failed to fetch emails",
              content: "",
            },
            { status: emailsRes.status || 500 }
          );
        }

        // Save an initial assistant instruction with empty content
        try {
          await saveChatMessage(sessionId, "assistant", "");
        } catch (saveInitError) {
          console.error("Failed to save initial assistant instruction message:", saveInitError);
        }

        // Build a simple summary of the fetched emails for assistant content
        let summary = "";

        try {
          if (!emailsData) {
            summary = "No messages found.";
          } else {
            const messagesArray = Array.isArray(emailsData.messages)
              ? emailsData.messages
              : Array.isArray(emailsData)
              ? emailsData
              : null;

            const count = messagesArray ? messagesArray.length : (emailsData.resultSizeEstimate ?? 0);

            summary = `Found ${count} message${count === 1 ? "" : "s"}.`;

            if (messagesArray && messagesArray.length > 0) {
              const items = messagesArray.slice(0, 5).map((m: any, i: number) => {
                const subject =
                  (m.payload && Array.isArray(m.payload.headers)
                    ? m.payload.headers.find((h: any) => h.name === "Subject")?.value
                    : null) || m.subject || m.snippet || m.summary || "(no subject)";

                return `${i + 1}. ${String(subject).trim()}`;
              });

              if (items.length) {
                summary += "\n\n" + items.join("\n");
              }
            }
          }
        } catch (e) {
          console.error("Failed to build emails summary:", e);
          summary = "Found messages (summary unavailable).";
        }

        // Save the assistant's summary to the database so frontend can fetch it from history
        try {
          await saveChatMessage(sessionId, "assistant", summary);
        } catch (saveError) {
          console.error("Failed to save assistant email summary:", saveError);
        }

        // Return the find-email response with empty content; detailed assistant content is stored in DB
        return NextResponse.json({
          type: "find-email",
          query: emailQuery,
          maxResults,
          actions: "list_messages",
          content: "",
          emails: emailsData,
        });
      } catch (err: any) {
        console.error("Error during find-email flow:", err);

        try {
          await saveChatMessage(sessionId, "assistant", "");
          await saveChatMessage(sessionId, "assistant", String(err?.message || err));
        } catch (saveErr) {
          console.error("Failed to save catch error messages:", saveErr);
        }

        return NextResponse.json(
          {
            type: "find-email",
            query: emailQuery,
            maxResults,
            actions: "list_messages",
            error: err?.message || String(err),
            content: "",
          },
          { status: 500 }
        );
      }
    }

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
