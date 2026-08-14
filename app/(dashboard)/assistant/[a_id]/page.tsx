"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, Button, Typography, Surface, Description } from "@heroui/react";
import { LinkTwo, ArrowUp, Search } from "@mynaui/icons-react";
import { ThinkingOrb } from "thinking-orbs";
import { supabase } from "@/lib/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
  type?: "conversation" | "find-email" | "error";
  query?: string;
  maxResults?: number;
  actions?: string;
  emails?: any[];
};

type ApiResponse =
  | {
      type: "conversation";
      response: string;
    }
  | {
      type: "find-email";
      query: string;
      maxResults: number;
      actions: string;
    }
  | {
      error: string;
    };

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();

  const a_id = String(params?.a_id || "");
  const incoming = searchParams?.get("m") || null;

  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const incomingSentRef = useRef(false);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 176)}px`;
  }, [value]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /**
   * Send message to AI.
   *
   * IMPORTANT:
   * This function does NOT insert anything into Supabase.
   * Messages only exist in React state until the page is refreshed.
   */
  const sendMessage = async (msg: string) => {
    if (!msg.trim() || !a_id || loading) {
      return;
    }

    const message = msg.trim();

    /**
     * Add user message locally only.
     */
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      /**
       * Get current Supabase session only for authentication.
       *
       * This does NOT write anything to the database.
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token || !session.user?.id) {
        throw new Error("You are not authenticated.");
      }

      /**
       * Send message to your AI API.
       */
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message,

          /**
           * Keep your existing API contract.
           */
          sessionId: session.user.id,
        }),
      });

      const data: ApiResponse & { emails?: any } = await res.json();

      if (!res.ok) {
        throw new Error(
          "error" in data ? (data as any).error : "Something went wrong",
        );
      }

      /**
       * Normal AI conversation response.
       */
      if (data.type === "conversation") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "conversation",
            content: data.response,
          },
        ]);

        return;
      }

      /**
       * Email search response.
       */
      if (data.type === "find-email") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "find-email",
            content: data.query,
            query: data.query,
            maxResults: data.maxResults,
            actions: data.actions,
            emails: (data as any).emails || undefined,
          },
        ]);

        return;
      }

      /**
       * Unexpected API response.
       */
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "error",
          content: "Unexpected response from server.",
        },
      ]);
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "error",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle incoming message from URL.
   */
  useEffect(() => {
    if (!incoming || !a_id || incomingSentRef.current) {
      return;
    }

    incomingSentRef.current = true;

    const msg = decodeURIComponent(incoming);

    sendMessage(msg);
  }, [incoming, a_id]);

  /**
   * READ ONLY:
   *
   * Load previously stored messages.
   *
   * There is NO insert/update/delete here.
   */
  useEffect(() => {
    if (!a_id) return;

    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("chat")
          .select("role, content, created_at")
          .eq("session_id", a_id)
          .order("created_at", { ascending: true })
          .limit(500);

        if (error) {
          console.error("Failed to load chat history:", error);
          return;
        }

        if (!data) return;

        const mapped = data.map((row: any) => {
          const role = row.role === "user" ? "user" : "assistant";

          const contentField = row.content;

          let text = "";

          if (typeof contentField === "string") {
            text = contentField;
          } else if (contentField && typeof contentField === "object") {
            if (typeof contentField.text === "string") {
              text = contentField.text;
            } else {
              try {
                text = JSON.stringify(contentField.text ?? contentField);
              } catch {
                text = String(contentField.text ?? contentField);
              }
            }
          }

          return {
            role,
            content: text,
          } as Message;
        });

        setMessages(mapped);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    loadHistory();
  }, [a_id]);

  const handleSend = async () => {
    if (!value.trim() || loading) {
      return;
    }

    const msg = value.trim();

    setValue("");

    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSend();
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
        </div>
      </aside>

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pb-44 pt-6 md:px-8 lg:px-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            {messages.map((item, index) => {
              if (item.role === "user") {
                return (
                  <div key={index} className="flex justify-end">
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

              if (item.type === "find-email" && item.emails.messages.length > 0) {
                console.log(item);
                return (
                  <div key={index} className="flex justify-start">

                    <Surface
                      variant="secondary"
                      className="w-4xl rounded-2xl p-4 flex flex-row gap-1 overflow-x-auto"
                    >
                      {
                        item.emails.messages.map((itm, index) => (
                          <Card key={itm.id}>
                            <Card.Header className={"*:line-clamp-1"}>
                              <Card.Title>{itm.subject}</Card.Title>
                              <Card.Description>{itm.from}</Card.Description>
                            </Card.Header>
                            <Card.Content>
                              <Description className={"line-clamp-1"}>{itm.snippet}</Description>
                            </Card.Content>
                          </Card>
                        ))
                      }
                    </Surface>
                  </div>
                );
              }

              if (item.type === "error") {
                return (
                  <div key={index} className="flex justify-start">
                    <Surface
                      variant="secondary"
                      className="max-w-[85%] rounded-2xl border border-danger/20 px-4 py-3"
                    >
                      <p className="text-sm text-danger">{item.content}</p>
                    </Surface>
                  </div>
                );
              }

              return (
                <div key={index} className="flex justify-start">
                  <div className="max-w-[85%] px-1 py-1">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <Surface variant="secondary" className="rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ThinkingOrb state="composing" speed={1} size={20} />
                    <Description>Thinking...</Description>
                  </div>
                </Surface>
              </div>
            )}

            {messages.length == 0 && (
              <div className="flex justify-end items-center gap-2">
                <ThinkingOrb state={"connecting"} size={20} />

                <Description>Wait for previous messages...</Description>
              </div>
            )}

            <div ref={messagesEndRef} />
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
                <Card.Header className="h-auto">
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    disabled={loading}
                    className="max-h-44 w-full resize-none overflow-y-auto bg-transparent text-sm leading-6 outline-none placeholder:text-default-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Card.Header>

                <Card.Footer className="p-0">
                  <div className="flex w-full items-center justify-between">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="tertiary"
                      aria-label="Attach file"
                      disabled={loading}
                    >
                      <LinkTwo size={18} />
                    </Button>

                    <Button
                      isIconOnly
                      size="sm"
                      onClick={handleSend}
                      disabled={loading || !value.trim()}
                      aria-label="Send message"
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
