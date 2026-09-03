import {NextRequest, NextResponse} from "next/server";
import {HumanMessage, AIMessage, BaseMessage} from "@langchain/core/messages";
import {supabase} from "@/lib/supabase/client";
import {createAgent} from "@/test/agent";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {message, sessionId, user, token} = body;

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
            .select("role, content, repos")
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

        const agent = createAgent(token);
        const result = await agent.invoke({messages});
        const aiResponse = result.messages.at(-1)?.content as string;

        const toolMessages = result.messages.filter(
            (msg: any) => msg.constructor?.name === "ToolMessage" || msg.type === "tool"
        );
        const repos = toolMessages.flatMap((msg: any) => {
            try {
                const parsed = JSON.parse(msg.content);
                return parsed.repos ?? [];
            } catch {
                return [];
            }
        });

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
                repos: repos.length > 0 ? repos : null,
            },
        ]);

        if (insertError) {
            return NextResponse.json({error: "Failed to save messages"}, {status: 500});
        }

        return NextResponse.json({
            message: aiResponse,
            sessionId: session_id,
            repos: repos.length > 0 ? repos : undefined,
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}