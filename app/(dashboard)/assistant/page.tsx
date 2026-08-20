"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Typography } from "@heroui/react";
import { LinkTwo, ArrowUp, Search, List } from "@mynaui/icons-react";
import { ThinkingOrb } from "thinking-orbs";
import { supabase } from "@/lib/supabase/client";
import { createSession } from "@/lib/db/chat";
import { RepoSelector } from "@/components/custom/repo.minor";
import { useGithubRepoStore } from "@/stores/github.repos";

export default function Page() {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const router = useRouter();
  const selectedRepoId = useGithubRepoStore((s) => s.selectedRepoId);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea?.scrollHeight}px`;
    }
  }, [value]);

  const handleSend = async () => {
    if (!value || !value.trim()) return;

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        console.error("No authenticated user to create session", userErr);
        return;
      }

      const userId = userData.user.id;
      const title = value.slice(0, 60) || "New chat";

      // Create a fresh, empty session and navigate to it.
      const sessionId = await createSession(userId, title);
      if (!sessionId) {
        console.error("Failed to create session");
        return;
      }

      const params = new URLSearchParams();
      if (selectedRepoId) params.set("repo", selectedRepoId);
      params.set("message", encodeURIComponent(value));

      router.push(`/assistant/${sessionId}?${params.toString()}`);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  return (
    <div className="relative w-full min-h-[80svh] flex flex-col gap-3 items-center justify-center p-4 pt-32">
      <Button size={"sm"} className={"absolute top-0 left-0"}>
        <Search />
        Search Sessions
      </Button>
      <div
        className={"flex flex-col items-center font-semibold justify-center"}
      >
        <ThinkingOrb state="breathing" size={64} speed={0.5} />
        <Typography.Paragraph>Hi! How Can I Help You</Typography.Paragraph>
      </div>

      <Card className={"min-w-2xl"}>
        <Card.Header className="flex flex-col h-auto">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            className="w-full text-sm resize-none overflow-hidden outline-none bg-transparent"
          />
        </Card.Header>
        <Card.Footer>
          <div className="w-full flex items-center justify-between">
            <RepoSelector />

            <Button isIconOnly size="lg" onClick={handleSend}>
              <ArrowUp />
            </Button>
          </div>
        </Card.Footer>
      </Card>
      <div
        className={
          "grid grid-cols-2 justify-start w-2xl gap-2 *:cursor-pointer"
        }
      >
        <Card>
          <Card.Content className="flex flex-col h-auto text-sm">
            Create me the automation for send email to user when it say about my
            services
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="flex flex-col h-auto text-sm">
            Give the emails that asks for collaboration with me!
          </Card.Content>
        </Card>
      </div>
      <div className={"w-2xl flex items-center justify-between"}>
        <Typography.Paragraph className={"font-semibold text-left"}>
          Chats
        </Typography.Paragraph>
        <Button size={"sm"} variant={"ghost"}>
          <List />
          More Chats
        </Button>
      </div>
      <div
        className={
          "grid grid-cols-1 justify-start w-2xl gap-2 *:cursor-pointer"
        }
      >
        <Card>
          <Card.Header>
            <Card.Title>Find your collaborator emails</Card.Title>
            <Card.Description>
              A person who want to collaborate on your marketing agency. It
              mentioned the revenue expected $1.5 Billion
            </Card.Description>
          </Card.Header>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>Find your collaborator emails</Card.Title>
            <Card.Description>
              A person who want to collaborate on your marketing agency. It
              mentioned the revenue expected $1.5 Billion
            </Card.Description>
          </Card.Header>
        </Card>
        <Button size={"sm"} variant={"ghost"}>
          <List />
          More Chats
        </Button>
      </div>
    </div>
  );
}
