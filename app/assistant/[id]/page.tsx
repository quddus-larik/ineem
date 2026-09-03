"use client";

import {useState, useRef, useEffect} from "react";
import {useParams} from "next/navigation";
import {Button, Surface, ScrollShadow, Chip, Card} from "@heroui/react";
import {Send, Star, Globe} from "@mynaui/icons-react";
import {supabase} from "@/lib/supabase/client";

interface Message {
    role: "user" | "assistant";
    content: string;
    repos?: {
        name: string;
        full_name: string;
        description: string | null;
        stars: number;
        forks: number;
        language: string | null;
        pushed_at: string;
        url: string;
    }[];
}

export default function Home() {
    const params = useParams();
    const id = typeof params?.id === "string" ? params.id : undefined;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userData, setUserData] = useState<{ id?: string } | null>(null);
    const [userSession, setUserSession] = useState<string>("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        (async () => {
            const {data: {user}, error} = await supabase.auth.getUser();
            if (!error) {
                setUserData(user);
            }
            const {
                data: {session},
                error: sessionIdError
            } = await supabase.auth.getSession();
            console.log("user session", session);
            if (!sessionIdError && session?.provider_token) {
                setUserSession(session.provider_token);
            }
        })()
    }, []);

    useEffect(() => {
        console.log("user session updated", userSession);
    }, [userSession]);

    useEffect(() => {
        if (!id) return;
        setSessionId(id);

        (async () => {
            const {data: session} = await supabase
                .from("session")
                .select("id")
                .eq("id", id)
                .single();

            if (!session) return;

            const {data: history} = await supabase
                .from("chat")
                .select("role, content, repos")
                .eq("session_id", id)
                .order("created_at", {ascending: true});

            if (history) {
                setMessages(
                    history.map((msg) => ({
                        role: msg.role as Message["role"],
                        content: msg.content,
                        repos: msg.repos ?? undefined,
                    }))
                );
            }
        })();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setIsLoading(true);

        setMessages((prev) => [...prev, {role: "user", content: userMessage}]);

        try {
            const res = await fetch("/api/v1/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: userMessage, sessionId, user: userData, token: userSession}),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send message");
            }

            setMessages((prev) => [...prev, {role: "assistant", content: data.message, repos: data.repos}]);
            if (data.sessionId) setSessionId(data.sessionId);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {role: "assistant", content: "Something went wrong. Please try again."},
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
        }
    };

    return (
        <div className="w-full flex-1 flex flex-col overflow-hidden h-svh">
            {/* Chats Area */}
            <ScrollShadow className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <Surface
                            variant={msg.role === "user" ? "tertiary" : "transparent"}
                            className={`p-2 rounded-xl text-sm leading-relaxed ${msg.role == "user" ? "max-w-[80%]" : "w-full"}`}
                        >
                            {msg.content}
                        </Surface>
                        {
                            (msg.repos) && (
                                <div className={"flex gap-1 flex-wrap"}>
                                    {
                                        (msg.repos.length > 0) && (
                                            msg.repos.map((itm, idx) => (
                                                <Chip size={"sm"} key={itm.id}>{itm.name}</Chip>
                                            ))
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </ScrollShadow>

            {/* Input Area */}
            <div className="p-4 w-full max-w-3xl mx-auto">
                <Surface className="flex items-end rounded-2xl border p-2 transition-colors flex-col gap-2">
            <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Message AI..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-sm focus:outline-none max-h-48"
                style={{height: "auto"}}
            />
                    <Button
                        isIconOnly
                        size="sm"
                        onClick={handleSubmit}
                        isDisabled={!input.trim() || isLoading}
                        className="ms-auto"
                    >
                        <Send/>
                    </Button>
                </Surface>
            </div>
        </div>
    );
}
