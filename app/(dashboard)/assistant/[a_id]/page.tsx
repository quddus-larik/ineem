"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Typography, Surface, Description } from "@heroui/react";
import { LinkTwo, ArrowUp } from "@mynaui/icons-react";
import { ThinkingOrb } from "thinking-orbs";
import { RepoSelector } from "@/components/custom/repo.minor";
import { useGithubRepoStore } from "@/stores/github.repos";
import { supabase } from "@/lib/supabase/client";
import {
  listSessions,
  listMessages,
  chatText,
} from "@/lib/db/chat";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type SessionItem = {
  id: string;
  title: string;
};

function AssistantSession() {
  const params = useParams<{ a_id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const repoParam = searchParams.get("repo");
  const messageParam = searchParams.get("message");
  const setSelectedRepo = useGithubRepoStore((s) => s.setSelectedRepo);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionId = typeof params?.a_id === "string" ? params.a_id : "";

  useEffect(() => {
    if (repoParam) setSelectedRepo(repoParam);
  }, [repoParam, setSelectedRepo]);

  // Load past sessions for the sidebar.
  const loadSessions = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const rows = await listSessions(userId);
      setSessions(rows as SessionItem[]);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, []);

  // Load existing messages for the current session.
  const loadMessages = useCallback(async (sid: string) => {
    try {
      const rows = await listMessages(sid);

      const loaded: ChatMessage[] = rows.map((row) => ({
        id: row.id ?? crypto.randomUUID(),
        role: row.role as "user" | "assistant",
        content: chatText(row.content),
      }));

      setMessages(loaded);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId, loadSessions, loadMessages]);

  // Auto-start the conversation with a prefilled message if present,
  // then strip the message from the URL so it isn't re-submitted.
  const startedRef = useRef(false);
  useEffect(() => {
    if (
      !startedRef.current &&
      messageParam &&
      sessionId &&
      messages.length === 0
    ) {
      startedRef.current = true;
      const prefill = decodeURIComponent(messageParam);
      setInput(prefill);
      sendMessage(prefill);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("message");
      const qs = params.toString();
      router.replace(
        qs ? `/assistant/${sessionId}?${qs}` : `/assistant/${sessionId}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageParam, sessionId, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const value = (text ?? "").trim();
      if (!value || isStreaming) return;

      const userMsgId = crypto.randomUUID();
      const assistantMsgId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: value },
      ]);
      setIsStreaming(true);

      let currentSession = sessionId;

      // If no session id is available, create one via the API
      // (the API also persists it to the DB).
      if (!currentSession) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          currentSession = userData?.user?.id ?? "";
        } catch {
          currentSession = "";
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "" },
      ]);

      const appendAssistant = (content: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content + content }
              : m
          )
        );
      };

      try {
        const res = await fetch("/api/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: value,
            sessionId: currentSession || undefined,
            useMemory: true,
          }),
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          buffer += decoder.decode(chunk, { stream: true });

          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            const lines = block.split("\n");
            let event = "message";
            const dataLines: string[] = [];

            for (const line of lines) {
              if (line.startsWith("event:")) {
                event = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trim());
              }
            }

            if (dataLines.length === 0) continue;

            let payload: any;
            try {
              payload = JSON.parse(dataLines.join("\n"));
            } catch {
              continue;
            }

            if (event === "session" && payload?.sessionId) {
              // Persist new session id in the URL for future calls.
              if (payload.sessionId !== currentSession) {
                currentSession = payload.sessionId;
                router.replace(`/assistant/${payload.sessionId}`);
                loadSessions();
              }
            } else if (event === "token" && payload?.token) {
              appendAssistant(payload.token);
            } else if (event === "error" && payload?.error) {
              appendAssistant(`Error: ${payload.error}`);
            }
          }
        }
      } catch (error: any) {
        appendAssistant(
          `Error: ${error?.message || "Failed to reach assistant"}`
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming, router, loadSessions]
  );

  const onSend = () => {
    if (!input.trim()) return;
    const value = input;
    setInput("");
    sendMessage(value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex h-[80svh] w-full overflow-hidden bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-divider bg-content1/40">
        <div className="px-5 py-4">
          <Typography.Paragraph className="text-sm font-medium text-foreground">
            Chats
          </Typography.Paragraph>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <Typography.Paragraph className="px-2 py-2 text-xs text-default-400">
            Recent Chats
          </Typography.Paragraph>
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/assistant/${s.id}`}
              className={`mb-1 block w-full truncate rounded-lg px-2 py-2 text-left text-sm hover:bg-content2 ${
                s.id === sessionId ? "bg-content2 text-foreground" : "text-default-500"
              }`}
            >
              {s.title || "Untitled chat"}
            </Link>
          ))}
        </div>
      </aside>

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 pb-44 pt-6 md:px-8 lg:px-16"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            {messages.map((item, index) => {
              if (!item) return null;

              if (item.role === "user") {
                return (
                  <div key={item.id ?? index} className="flex justify-end">
                    <Surface
                      variant="secondary"
                      className="max-w-[85%] rounded-2xl px-4 py-3"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {item.content}
                      </p>
                    </Surface>
                  </div>
                );
              }

              return (
                <div key={item.id ?? index} className="flex justify-start">
                  <div className="max-w-[85%] px-1 py-1">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-1 py-1">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-default-400">
                    Start the conversation by sending a message.
                  </p>
                </div>
              </div>
            )}

            <div />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-0 md:px-8 bg-background w-4xl">
          <div className="mx-auto w-full max-w-3xl">
            <Surface variant={"default"} className={"rounded-3xl w-full"}>
              <div className={"flex gap-2 px-4 py-2 items-center"}>
                <ThinkingOrb state={"searching"} speed={1} size={20} />
                <Description>Searching</Description>
              </div>

              <Card className="w-full rounded-3xl border border-divider bg-content1/95 shadow-lg backdrop-blur">
                <Card.Header>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="max-h-44 w-full resize-none overflow-y-auto bg-transparent text-sm leading-6 outline-none placeholder:text-default-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Card.Header>

                <Card.Footer className="p-0">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="tertiary"
                        aria-label="Attach file"
                      >
                        <LinkTwo size={18} />
                      </Button>
                      <RepoSelector disableIt={false} />
                    </div>

                    <Button
                      isIconOnly
                      size="sm"
                      aria-label="Send message"
                      onClick={onSend}
                      isDisabled={isStreaming || !input.trim()}
                    >
                      <ArrowUp size={18} />
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Surface>

            <p className="mt-2 text-center text-[11px] text-default-400">
              Enter to send · Shift + Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AssistantSession />
    </Suspense>
  );
}
