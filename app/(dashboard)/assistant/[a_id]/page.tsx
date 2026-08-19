"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, Typography, Surface, Description } from "@heroui/react";
import { LinkTwo, ArrowUp } from "@mynaui/icons-react";
import { ThinkingOrb } from "thinking-orbs";
import { RepoSelector } from "@/components/custom/repo.minor";
import { useGithubRepoStore } from "@/stores/github.repos";

const mockMessages = [
  {
    role: "user" as const,
    content: "Find emails from John about the project deadline",
  },
  {
    role: "assistant" as const,
    type: "find-email" as const,
    content: "Find emails from John about the project deadline",
    query: "Find emails from John about the project deadline",
    maxResults: 5,
    actions: "",
    emails: {
      messages: [
        {
          id: "1",
          subject: "Project Deadline Update",
          from: "john@example.com",
          snippet: "Hi, I wanted to update you on the project deadline...",
        },
        {
          id: "2",
          subject: "Re: Project Timeline",
          from: "john@example.com",
          snippet: "The deadline has been moved to next Friday...",
        },
      ],
    },
  },
];

function AssistantSession() {
  const searchParams = useSearchParams();
  const repoParam = searchParams.get("repo");
  const messageParam = searchParams.get("message");
  const setSelectedRepo = useGithubRepoStore((s) => s.setSelectedRepo);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (repoParam) setSelectedRepo(repoParam);
    if (messageParam) {
      try {
        setInput(decodeURIComponent(messageParam));
      } catch {
        setInput(messageParam);
      }
    }
  }, [repoParam, messageParam, setSelectedRepo]);

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
            {mockMessages.map((item, index) => {
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
                      <RepoSelector />
                    </div>

                    <Button
                      isIconOnly
                      size="sm"
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

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AssistantSession />
    </Suspense>
  );
}
