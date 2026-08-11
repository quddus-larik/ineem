"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, Button, Typography, Surface, Description } from "@heroui/react";
import { LinkTwo, ArrowUp, Search, List } from "@mynaui/icons-react";
import { ThinkingOrb } from "thinking-orbs";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const a_id = params?.a_id || "";

  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const incoming = searchParams?.get("m") || null;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    // if message provided via query param, send it to api
    if (incoming && a_id) {
      const msg = decodeURIComponent(incoming);
      // add user message to UI
      setMessages((s) => [...s, { role: "user", content: msg }]);

      const send = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/v1/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg, sessionId: a_id }),
          });
          const data = await res.json();
          // show JSON response in UI as string
          setMessages((s) => [...s, { role: "assistant", content: JSON.stringify(data) }]);
        } catch (e: any) {
          setMessages((s) => [...s, { role: "assistant", content: JSON.stringify({ error: e?.message || String(e) }) }]);
        } finally {
          setLoading(false);
        }
      };

      send();
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!value || !value.trim() || !a_id) return;
    const msg = value.trim();
    setMessages((s) => [...s, { role: "user", content: msg }]);
    setValue("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId: a_id }),
      });
      const data = await res.json();
      setMessages((s) => [...s, { role: "assistant", content: JSON.stringify(data) }]);
    } catch (e: any) {
      setMessages((s) => [...s, { role: "assistant", content: JSON.stringify({ error: e?.message || String(e) }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[80svh] w-full overflow-hidden bg-background">
      {/* Fixed Non-Collapsible Sidebar */}
      <aside className="w-64 border-r border-divider flex flex-col p-4 gap-4 shrink-0 bg-content1/50">
        Chats
        <div className="flex-1 overflow-y-auto">
          {/* Sidebar session links or history go here */}
          <Typography.Paragraph className="text-xs text-default-400 px-2">
            Recent Chats
          </Typography.Paragraph>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col items-end justify-start px-32 pt-5 space-y-3">
          {messages.length === 0 ? (
            <Card
              variant={"secondary"}
              className={
                "p-2 px-3 rounded-xl max-w-lg shadow-sm ring-1 ring-muted/80"
              }
            >
              <Card.Content>
                <Typography.Paragraph className={"line-clamp-3 text-sm"}>
                  Hello How are you can i help you
                </Typography.Paragraph>
              </Card.Content>
            </Card>
          ) : (
            messages.map((m, idx) => (
              <Card
                key={idx}
                variant={m.role === "assistant" ? "secondary" : undefined}
                className={
                  "p-2 px-3 rounded-xl max-w-lg shadow-sm ring-1 ring-muted/80"
                }
              >
                <Card.Content>
                  <Typography.Paragraph className={"text-sm"}>
                    {m.content}
                  </Typography.Paragraph>
                </Card.Content>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Fixed Card Wrapper */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
          <Surface
            variant={"default"}
            className={"rounded-3xl w-full max-w-2xl"}
          >
            <div className={"flex gap-2 px-4 py-2 items-center"}>
              <ThinkingOrb state={"composing"} speed={2} size={20} />
              <Description>Searching</Description>
            </div>
            <Card className="w-full max-w-2xl shadow-lg border border-divider">
              <Card.Header className="flex flex-col h-auto">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full text-sm resize-none overflow-hidden outline-none bg-transparent max-h-44"
                />
              </Card.Header>
              <Card.Footer className="">
                <div className="w-full flex items-center justify-between">
                  <Button isIconOnly size="sm">
                    <LinkTwo />
                  </Button>

                  <Button isIconOnly size="sm" onClick={handleSend} disabled={loading}>
                    <ArrowUp />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Surface>
        </div>
      </main>
    </div>
  );
}
