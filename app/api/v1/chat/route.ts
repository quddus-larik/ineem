import {NextRequest, NextResponse} from "next/server";
import {ChatGroq} from "@langchain/groq";
import {StateGraph, Annotation} from "@langchain/langgraph";
import {HumanMessage, AIMessage, BaseMessage} from "@langchain/core/messages";
import {supabase} from "@/lib/supabase/client";
import {z} from "zod";

const SearchIntentRepo = z.object({
    query: z.string().describe("Query for repository search example language:Typescript, stars:>=2, licence:mit"),
    message: z.string().describe("Message from LLM"),
    limit: z.number().nullable().describe("Number of results requested by the user (e.g. 'only 3 repos', 'top 10'). Null if unspecified. This is NOT a star filter."),
})

const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
    }),
    intent: Annotation<string>({
        reducer: (_x, y) => y,
        default: () => "conversation",
    }),
    searchResult: Annotation<{
        query: string;
        message: string;
        limit: number | null;
    } | null>({
        reducer: (_x, y) => y,
        default: () => null,
    }),
    username: Annotation<string>({
        reducer: (_x, y) => y,
        default: () => "",
    }),
    githubToken: Annotation<string>({
        reducer: (_x, y) => y,
        default: () => "",
    }),
});

const model = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
});

const SearchRepoStructuredModel = model.withStructuredOutput(SearchIntentRepo);

async function classify(state: typeof StateAnnotation.State) {
    const lastMessage = state.messages.at(-1)?.content?.toString() ?? "";
    const response = await model.invoke([
        {
            role: "system",
            content: `
  classify the user input query. just return single string.
  - "list-repo": user wants to search or find github repositories (e.g. "find react repos", "search go projects").
  - "conversation": user is just chatting (hi, hello, general questions).
  - "start-repo": user wants deep insight into a specific repository.
  `,
        },
        {role: "user", content: lastMessage},
    ]);

    const intent = (response.content?.toString() ?? "conversation")
        .trim()
        .toLowerCase()
        .replace(/[^a-z\-]/g, "");

    return {intent};
}

async function callModel(state: typeof StateAnnotation.State) {
    const response = await model.invoke(state.messages);
    return {messages: [response]};
}

function stripQueryPreamble(raw: string): string {
    let q = raw.trim();
    const lower = q.toLowerCase();
    const prefixes = ["ai github query", "github query", "here is", "here's", "query:"];
    for (const p of prefixes) {
        if (lower.startsWith(p)) {
            q = q.slice(p.length).replace(/^[\s:.\-]+/, "");
            lower.replace(p, "");
            break;
        }
    }
    return q.trim();
}

const OR_MERGE_KEYS = new Set([
    "language",
    "topic",
    "license",
    "user",
    "org",
    "label",
]);

function mergeDuplicateQualifiers(raw: string): string {
    const tokens = raw.match(/\([^)]*\)|"[^"]*"|\S+/g) ?? [];
    const groups = new Map<string, string[]>();
    const order: string[] = [];

    for (const tok of tokens) {
        const m = tok.match(/^\(?([a-zA-Z_]+):/);
        if (m) {
            const key = m[1].toLowerCase();
            if (!groups.has(key)) order.push(key);
            groups.set(key, [...(groups.get(key) ?? []), tok]);
        } else {
            const key = `__lit_${order.length}`;
            order.push(key);
            groups.set(key, [tok]);
        }
    }

    const out: string[] = [];
    for (const key of order) {
        const toks = groups.get(key)!;
        if (key.startsWith("__lit_")) {
            out.push(...toks);
        } else if (toks.length > 1 && OR_MERGE_KEYS.has(key)) {
            out.push(`(${toks.join(" OR ")})`);
        } else {
            out.push(...toks);
        }
    }

    return out.join(" ");
}

async function searchRepo(state: typeof StateAnnotation.State) {
    const priorQuery = state.searchResult?.query ?? null;
    const GithubUrl = new URL("https://api.github.com/search/repositories");

    const humanTurns = state.messages
        .filter((m) => m instanceof HumanMessage)
        .map((m) => m.content?.toString() ?? "")
        .filter(Boolean);

    const context = humanTurns
        .map((t, i) => `User turn ${i + 1}: ${t}`)
        .join("\n");

    const systemContent = `
  You convert the user's natural language into a SINGLE GitHub repository search query.
  Use GitHub search syntax: language:typescript, stars:>=100, forks:>=10,
  license:mit, topic:ai, created:>2023-01-01, pushed:>2024-01-01, user:vercel, etc.
  The user may refine the search across multiple turns.
  ${priorQuery}
  
  RULES:
  - The "query" field MUST contain ONLY the GitHub search syntax (e.g. language:typescript stars:>=10).
    No preamble, no "AI Github Query", no explanatory text.
  - The "message" field is a short friendly sentence summarizing the search.
  - A request for a NUMBER OF RESULTS ("only 3 repos", "top 10", "limit to 5", "show me 20")
    is NOT a star filter. Put that number in the "limit" field and DO NOT emit stars:N for it.
    "stars" only applies to a popularity/rating request (e.g. "repos with 10 stars").
  `;

    const result = await SearchRepoStructuredModel.invoke([
        {role: "system", content: systemContent},
        {role: "user", content: context},
    ]);

    const cleanQuery = stripQueryPreamble(result.query);
    const finalQuery = mergeDuplicateQualifiers(cleanQuery);

    const scope = state.username ? ` user:${state.username}` : "";
    GithubUrl.searchParams.set("q", `${finalQuery}${scope}`);
    if (result.limit) {
        GithubUrl.searchParams.set("per_page", String(Math.min(result.limit, 100)));
    }

    const response = await fetch(GithubUrl, {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${state.githubToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (!response.ok) {
        throw new Error(
            `GitHub API error ${response.status}: ${await response.text()}`,
        );
    }

    const data = await response.json();


    console.log("AI Github Query", finalQuery);
    console.log("Github Data", data)

    return {
        searchResult: {query: finalQuery, message: result.message, limit: result.limit},
        messages: [new AIMessage(result.message)],
    };
}

function routeIntent(state: typeof StateAnnotation.State): string {
    if (state.intent === "list-repo") return "searchRepo";
    return "agent";
}

const workflow = new StateGraph(StateAnnotation)
    .addNode("classify", classify)
    .addNode("agent", callModel)
    .addNode("searchRepo", searchRepo)
    .addEdge("__start__", "classify")
    .addConditionalEdges("classify", routeIntent, {
        searchRepo: "searchRepo",
        agent: "agent",
    })
    .addEdge("agent", "__end__")
    .addEdge("searchRepo", "__end__");

const app = workflow.compile();

export async function POST(request: NextRequest) {
    try {

        const body = await request.json();
        const {message, sessionId, user, token} = body;
        const username: string = user?.user_metadata?.user_name ?? "";

        if (process.env.NODE_ENV === "development") {
            console.log("GitHub Access Token:", token);
        }

        if (!message) {
            return NextResponse.json({error: "Message is required"}, {status: 400});
        }

        let session_id = sessionId;

        if (!session_id) {
            const {data: newSession, error: sessionError} = await supabase
                .from("session")
                .insert({
                    user_id: user.id,
                    title: message.slice(0, 50),
                })
                .select("id")
                .single();

            if (sessionError || !newSession) {
                return NextResponse.json({error: "Failed to create session"}, {status: 500});
            }
            session_id = newSession.id;
        } else {
            const {data: existingSession} = await supabase
                .from("session")
                .select("id")
                .eq("id", session_id)
                .eq("user_id", user.id)
                .single();

            if (!existingSession) {
                return NextResponse.json({error: "Session not found"}, {status: 404});
            }
        }

        const {data: history, error: historyError} = await supabase
            .from("chat")
            .select("role, content")
            .eq("session_id", session_id)
            .order("created_at", {ascending: true});

        if (historyError) {
            return NextResponse.json({error: "Failed to fetch history"}, {status: 500});
        }

        const messages: BaseMessage[] = (history || []).map((msg) => {
            if (msg.role === "user") {
                return new HumanMessage(msg.content);
            } else {
                return new AIMessage(msg.content);
            }
        });

        messages.push(new HumanMessage(message));

        const result = await app.invoke({messages, username, githubToken: token});
        const aiResponse = result.messages.at(-1)?.content as string;
        const searchQuery = result.searchResult?.query ?? null;

        const {error: insertError} = await supabase.from("chat").insert([
            {
                session_id,
                role: "user",
                content: message,
            },
            {
                session_id,
                role: "assistant",
                content: aiResponse,
            },
        ]);

        if (insertError) {
            return NextResponse.json({error: "Failed to save messages"}, {status: 500});
        }

        return NextResponse.json({
            message: aiResponse,
            sessionId: session_id,
            query: searchQuery,
            limit: result.searchResult?.limit ?? null,
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}