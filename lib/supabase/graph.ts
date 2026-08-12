import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { supabase } from "./client";

const llm = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

const Graphs = new StateGraph({
  channels: {
    query: {
      value: (oldValue, newValue) => newValue,
      default: () => "",
    },

    answer: {
      value: (oldValue, newValue) => newValue,
      default: () => "",
    },
  },
});


/**
 * Convert LLM response content to string.
 */
function contentToString(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.text || "";
      })
      .join("");
  }

  return String(content);
}


/**
 * Email Agent
 *
 * User:
 *   "Show unread emails from abc@mail.com"
 *
 * LLM:
 *   "from:abc@mail.com is:unread"
 *
 * Supabase Edge Function:
 *   action: list_messages
 *
 * Gmail:
 *   returns matching emails
 */
async function emailAgent(state) {
  try {
    // -----------------------------------------
    // 1. Convert natural language -> Gmail query
    // -----------------------------------------

    const queryResponse = await llm.invoke(`
You are a Gmail search query generator.

  Convert the user's request into a valid Gmail API search query.

Supported Gmail operators include:

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

Query:
  is:unread

User:
  Show read emails

Query:
  is:read

User:
  Give me emails from abc@mail.com

Query:
from:abc@mail.com

User:
Show unread emails from abc@mail.com

Query:
from:abc@mail.com is:unread

User:
  Show read emails from abc@mail.com

Query:
from:abc@mail.com is:read

User:
  Show unread PDF emails

Query:
  is:unread filename:pdf

User:
  Show emails from abc@mail.com with attachments

  Query:
    from:abc@mail.com has:attachment

User:
  Show emails from abc@mail.com from the last 7 days

Query:
  from:abc@mail.com newer_than:7d

Rules:

  1. Return ONLY the Gmail query.
2. Do not explain the query.
3. Do not use markdown.
4. Do not put the query inside quotes.
5. If there is no filter, return an empty string.

  User request:
  ${state.query}
`);

    const gmailQuery = contentToString(queryResponse.content).trim();


    // -----------------------------------------
    // 2. Call Supabase Edge Function
    // -----------------------------------------

    const { data, error } = await supabase.functions.invoke(
      "gmail-connector",
      {
        body: {
          action: "list_messages",
          query: gmailQuery,
          maxResults: 30,
        },
      }
    );

    if (error) {
      throw new Error(
        error.message || "Failed to fetch emails"
      );
    }


    // -----------------------------------------
    // 3. Check Edge Function response
    // -----------------------------------------

    if (data?.error) {
      throw new Error(data.error);
    }

    const emails = data?.messages || [];


    // -----------------------------------------
    // 4. Generate final answer
    // -----------------------------------------

    const answerResponse = await llm.invoke(`
You are an email assistant.

  User request:
  ${state.query}

Gmail query:
  ${gmailQuery || "(no filter)"}

Emails returned from Gmail:
  ${JSON.stringify(emails, null, 2)}

Answer the user's request using ONLY the emails returned above.

Rules:
  - Do not invent emails.
- Do not invent sender names, subjects, dates, or content.
- Mention sender, subject, and date when available.
- Keep the response clear and concise.
- If there are no matching emails, say:
"No matching emails were found."

  `);

    return {
      answer: contentToString(answerResponse.content),
    };

  } catch (error) {
    console.error("Email agent error:", error);

    return {
      answer: `I couldn't fetch the emails: ${error.message}`,
};
}
}


Graphs.addNode("emailAgent", emailAgent);

Graphs.addEdge(START, "emailAgent");
Graphs.addEdge("emailAgent", END);

const app = Graphs.compile();


// Example
const result = await app.invoke({
  query: "Show unread emails from qudduslarek@gmai.com in my inbox",
});

console.log(result.answer);