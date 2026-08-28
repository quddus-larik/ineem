import {NextRequest, NextResponse} from "next/server";
import {ChatGroq} from "@langchain/groq";
import {StateGraph, Annotation} from "@langchain/langgraph";
import {HumanMessage, AIMessage, BaseMessage} from "@langchain/core/messages";
import {supabase} from "@/lib/supabase/client";

const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
    }),
});

const model = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
});

async function callModel(state: typeof StateAnnotation.State) {
    const response = await model.invoke(state.messages);
    return {messages: [response]};
}

const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addEdge("agent", "__end__");

const app = workflow.compile();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {message, sessionId, user} = body;

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

        const result = await app.invoke({messages});
        const aiResponse = result.messages.at(-1)?.content as string;

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
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}