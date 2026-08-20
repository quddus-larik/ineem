import {
  StateGraph,
  Annotation,
  START,
  END,
} from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";

const GroqApiKey = process.env.GROQ_API_KEY ?? "";

const llm = new ChatGroq({
  apiKey: GroqApiKey,
  model: "llama-3.3-70b-versatile",
});

// ---------------------------------------------------------------------------
// GitHub repository data
// ---------------------------------------------------------------------------

type Repo = {
  name: string;
  owner: string;
  description: string;
  stars: number;
  language: string;
  url: string;
};

// Mock repository data. This is the placeholder until the live GitHub API
// is wired up (see getRepositories below).
const mockRepos: Repo[] = [
  {
    name: "ineem",
    owner: "acme",
    description: "Main platform repo for the Ineem assistant.",
    stars: 1280,
    language: "TypeScript",
    url: "https://github.com/acme/ineem",
  },
  {
    name: "langgraph-workflows",
    owner: "acme",
    description: "Reusable LangGraph workflow definitions and helpers.",
    stars: 642,
    language: "Python",
    url: "https://github.com/acme/langgraph-workflows",
  },
  {
    name: "supabase-adapter",
    owner: "acme",
    description: "Supabase client adapter with session-scoped chat history.",
    stars: 310,
    language: "TypeScript",
    url: "https://github.com/acme/supabase-adapter",
  },
  {
    name: "groq-chat-ui",
    owner: "acme",
    description: "Streaming chat UI powered by Groq LLMs.",
    stars: 98,
    language: "TypeScript",
    url: "https://github.com/acme/groq-chat-ui",
  },
];

/**
 * Returns repositories for the given query.
 *
 * INTEGRATION POINT: replace the mock with a live GitHub API call, e.g.
 *
 *   import { Octokit } from "octokit";
 *   const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
 *   const { data } = await octokit.search.repos({
 *     q: query ?? "",
 *     per_page: 5,
 *     sort: "stars",
 *   });
 *   return data.items.map((r) => ({ ... }));
 *
 * For now it returns mock data so the workflow can be exercised end-to-end.
 */
async function getRepositories(query?: string): Promise<Repo[]> {
  if (!query) return mockRepos;

  const q = query.toLowerCase();
  const filtered = mockRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.language.toLowerCase().includes(q)
  );

  return filtered.length > 0 ? filtered : mockRepos;
}

// ---------------------------------------------------------------------------
// Workflow state
// ---------------------------------------------------------------------------

const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  intent: Annotation<string>,
  output: Annotation<string>,
});

async function classify(state: typeof StateAnnotation.State) {
  const prompt = `You are a router for a GitHub AI assistant.
Classify the user's message into exactly one of:
- "conversation" if it is a greeting or casual chit-chat (hello, hi, how are you, etc.)
- "github" if the user is asking about GitHub repositories, code, issues, pull requests, or repo data
- "unknown" for anything else unrelated to GitHub or casual conversation
Respond with only the single word. Message: ${state.input}`;

  const res = await llm.invoke(prompt);
  const intent =
    res.content.toString().trim().toLowerCase() || "unknown";

  return { intent };
}

async function handleConversation(state: typeof StateAnnotation.State) {
  const res = await llm.invoke(
    `You are a friendly GitHub assistant. Respond warmly to: ${state.input}`
  );
  return { output: res.content.toString() };
}

async function handleGithub(state: typeof StateAnnotation.State) {
  const repos = await getRepositories(state.input);

  const repoList = repos
    .map(
      (r) =>
        `- ${r.owner}/${r.name} (${r.language}, ${r.stars} stars): ${r.description}\n  ${r.url}`
    )
    .join("\n");

  const res = await llm.invoke(
    `You are a GitHub assistant. The user asked: "${state.input}".
  
Use ONLY the repository data below to answer. Do not invent repositories.

Repositories:
${repoList}

Answer the user's question using this data, and include the repo URLs when relevant.`
  );

  return { output: res.content.toString() };
}

async function handleFallback(state: typeof StateAnnotation.State) {
  const res = await llm.invoke(
    `You are a helpful GitHub assistant. Reply to: ${state.input}`
  );
  return { output: res.content.toString() };
}

function routeIntent(state: typeof StateAnnotation.State) {
  if (state.intent === "conversation") return "conversation";
  if (state.intent === "github") return "github";
  return "fallback";
}

const workflow = new StateGraph(StateAnnotation)
  .addNode("classify", classify)
  .addNode("conversation", handleConversation)
  .addNode("github", handleGithub)
  .addNode("fallback", handleFallback)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeIntent, {
    conversation: "conversation",
    github: "github",
    fallback: "fallback",
  })
  .addEdge("conversation", END)
  .addEdge("github", END)
  .addEdge("fallback", END);

export const graph = workflow.compile();

export async function runAssistance(message: string) {
  const result = await graph.invoke({ input: message });
  return result.output;
}
