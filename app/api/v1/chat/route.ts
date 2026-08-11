import { NextResponse, NextRequest } from "next/server";
import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";


const messagesHistories: Record<string, ChatMessageHistory> = {};

export const emailResponseSchema = z.object({
  content: z.string().describe("message response from AI LLM"),
  emails: z.array(
    z.object({
      to: z.string(),
      from: z.string(),
      subject: z.string(),
      thread_id: z.string(),
      snippet: z.string(),
    }),
  ),
  summery: z.string().describe("message and emails summery"),
});

const loadHistoryFromDb = async (sessionId: string): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("chat")
      .select("role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("Failed to load history from DB:", error);
      return;
    }

    const history = messagesHistories[sessionId];
    if (!history || !data) return;

    for (const row of data) {
      const role = (row as any).role;
      const content = (row as any).content;
      // content stored as JSONB; try common shapes
      const text = typeof content === "string" ? content : content?.text || JSON.stringify(content);

      // add to in-memory history using LangChain helpers if available
      // prefer strongly named methods, but tolerate missing by try/catch
      try {
        if (role === "user") {
          // @ts-ignore
          history.addUserMessage ? history.addUserMessage(text) : history.addMessage?.({ role: "user", content: text });
        } else if (role === "assistant") {
          // @ts-ignore
          history.addAssistantMessage ? history.addAssistantMessage(text) : history.addMessage?.({ role: "assistant", content: text });
        } else {
          // system or others
          // @ts-ignore
          history.addSystemMessage ? history.addSystemMessage(text) : history.addMessage?.({ role: "system", content: text });
        }
      } catch (e) {
        // ignore population errors; worst-case the chain runs without DB history
        console.warn("Failed to populate in-memory history for session", sessionId, e);
      }
    }
  } catch (err) {
    console.error("Error loading history from supabase:", err);
  }
};

const getMessageHistoryForSession = async (sessionId: string): Promise<ChatMessageHistory> => {
  if (!messagesHistories[sessionId]) {
    messagesHistories[sessionId] = new ChatMessageHistory();
    // populate from DB
    await loadHistoryFromDb(sessionId);
  }
  return messagesHistories[sessionId];
};

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message doesn't exist" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // If user asks for recent emails, delegate to the Supabase Edge Function used by the email store
    const emailQueryTriggers = [/last three days email/i, /last 3 days email/i, /emails? from the last 3 days/i, /emails? from the last three days/i];
    const wantsEmails = emailQueryTriggers.some((r) => r.test(message));

    if (wantsEmails) {
      try {
        const body: Record<string, unknown> = {
          action: "list_messages",
          query: "newer_than:3d",
          maxResults: 50,
        };

        const { data, error } = await supabase.functions.invoke("gmail-connector", { body });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const messages = data?.messages || [];

        // fetch full message bodies in parallel
        const fetched = await Promise.all(
          messages.map(async (m: any) => {
            try {
              const { data: full, error: getErr } = await supabase.functions.invoke("gmail-connector", {
                body: { action: "get_message", id: m.id },
              });
              if (getErr) throw getErr;
              const msg = full?.message || {};
              return {
                id: m.id,
                threadId: m.threadId || msg.threadId || msg.thread_id,
                snippet: m.snippet || msg.snippet || "",
                subject: msg.subject || m.subject || "",
                from: msg.from || m.from || "",
                to: msg.to || m.to || "",
                date: msg.date || m.date || "",
                body: msg.body || msg.snippet || m.snippet || "",
              };
            } catch (e) {
              return {
                id: m.id,
                threadId: m.threadId || null,
                snippet: m.snippet || "",
                subject: m.subject || "",
                from: m.from || "",
                to: m.to || "",
                date: m.date || "",
                body: m.snippet || "",
              };
            }
          })
        );

        // persist the user query
        await supabase.from("chat").insert([{ session_id: sessionId, role: "user", content: { text: message } }]);

        // Ask the LLM to read these emails and produce a content and summery
        const llm = new ChatGroq({
          model: "openai/gpt-oss-20b",
          temperature: 0,
          apiKey: process.env.GROQ_API_KEY,
        });

        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            "You are a helpful assistant. Read the provided emails and answer the user's request using only the information from these emails. Produce a JSON object with keys: content (assistant message describing what the emails contain about the user's request), emails (array with to, from, subject, thread_id, snippet), summery (one-paragraph summary). Keep content factual and cite which email (by id) contains the focal info when helpful."
          ],
          ["human", `User asked: ${message}\n\nEmails:\n${JSON.stringify(fetched)}`]
        ]);

        const chain = prompt.pipe(llm);

        const conversationalChain = new RunnableWithMessageHistory({
          runnable: chain,
          getMessageHistory: (id: string) => messagesHistories[id] || new ChatMessageHistory(),
          inputMessagesKey: "input",
          historyMessagesKey: "history",
        });

        const response: any = await conversationalChain.invoke({ input: message }, { configurable: { sessionId } });

        // response.content should be a parsed JSON object per response_format
        let structured: any = response?.content;
        if (!structured || typeof structured !== "object") {
          try {
            structured = JSON.parse(typeof response === "string" ? response : JSON.stringify(response));
          } catch (e) {
            structured = { content: response?.toString() || "", emails: fetched, summery: "" };
          }
        }

        // ensure emails field contains the fetched summary fields
        structured.emails = fetched.map((e) => ({ to: e.to || "", from: e.from || "", subject: e.subject || "", thread_id: e.threadId || "", snippet: e.snippet || "" }));

        // persist assistant structured reply
        await supabase.from("chat").insert([{ session_id: sessionId, role: "assistant", content: structured }]);

        return NextResponse.json({ role: "assistant", content: structured.content, emails: fetched, summery: structured.summery });
      } catch (err: any) {
        console.error("Failed to fetch emails from edge function:", err);
        return NextResponse.json({ error: err.message || "Failed to fetch emails" }, { status: 500 });
      }
    }

    // Persist the incoming user message
    await supabase.from("chat").insert([{ session_id: sessionId, role: "user", content: { text: message } }]);

    // Ensure in-memory history is ready and populated
    const history = await getMessageHistoryForSession(sessionId);

    const llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });

    const llmStructuredResponse = llm.withStructuredOutput(emailResponseSchema);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful and witty AI assistant. Answer accurately using context from past interactions."
      ],
      new MessagesPlaceholder("history"),
      ["human", "{input}"]
    ]);

    const chain = prompt.pipe(llm);

    const conversationalChain = new RunnableWithMessageHistory({
      runnable: chain,
      // RunnableWithMessageHistory expects a sync function; provide one that returns the populated history
      getMessageHistory: (id: string) => {
        // return existing memory. Note: history population is async earlier.
        return messagesHistories[id] || new ChatMessageHistory();
      },
      inputMessagesKey: "input",
      historyMessagesKey: "history"
    });

    const response: any = await conversationalChain.invoke(
      { input: message },
      { configurable: { sessionId } }
    );

    const assistantContent = response?.content ?? (typeof response === "string" ? response : JSON.stringify(response));

    // persist assistant response
    await supabase.from("chat").insert([{ session_id: sessionId, role: "assistant", content: { text: assistantContent } }]);

    return NextResponse.json({ role: "assistant", content: assistantContent });

  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

