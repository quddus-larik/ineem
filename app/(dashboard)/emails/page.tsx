"use client";
import { Surface, Typography, Label, Chip, Avatar, Description, Separator, Pagination } from "@heroui/react";
import { useEmailStore } from "@/stores/emails.inbox";
import { Paperclip } from "@mynaui/icons-react";
import { useEffect } from "react";
import { EmailSidebar } from "@/components/custom/email-sidebar";

export default function Page() {
  const {
    emails,
    loadingEmails,
    emailError,
    fetchEmails,
    setViewMail,
    selectedEmail,
    selectedEmailId
  } = useEmailStore();

  useEffect(() => {
    (async function() {
      await fetchEmails("", 100);
    })();


  }, []);
  console.log("emails", emails);

  async function getGravatarUrl(email: string): string {
    const cleanEmail = email.trim().toLowerCase();

    // Hash email with MD5
    const encoder = new TextEncoder();
    const data = encoder.encode(cleanEmail);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data); // or MD5

    // Alternatively, use a lightweight md5 library or fallback:
    // const hash = md5(cleanEmail);

    // Fallback image parameter 'd' generates initials if email isn't registered
    const fallbackUrl = encodeURIComponent(
      `https://ui-avatars.com/api/${getSenderName(cleanEmail)}/128/7c3aed/ffffff`
    );

    return `https://www.gravatar.com/avatar/${hash}?d=${fallbackUrl}`;
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return fallback string if invalid date

    // Formats into: "08 Aug, 2026"
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  // 1. Returns ONLY the clean email address (without < >)
  function getCleanEmail(senderString?: string): string {
    if (!senderString) return "";
    const match = senderString.match(/<([^>]+)>/);
    return match ? match[1] : senderString.trim();
  }

// 2. Returns ONLY the name (removes the email address entirely)
  function getSenderName(senderString?: string): string {
    if (!senderString) return "Unknown";
    const name = senderString.replace(/<[^>]*>/g, "").trim();
    return name || getCleanEmail(senderString);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-row gap-2">
      <EmailSidebar />
      <section className="min-w-0 flex-1 overflow-auto">
        <Surface
          variant="default"
          className={"w-full flex  flex-row items-start gap-2 rounded-2xl p-2"}
        >
          <Surface className="flex w-72 h-[80svh] flex-col items-start gap-2 rounded-2xl p-2">
            <Surface
              variant="transparent"
              className="flex w-full flex-col gap-1 rounded-xl p-0 shrink-0"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-semibold">Inbox</h3>
                <Chip variant="primary" color="accent">
                  8 Unread
                </Chip>
              </div>

              <Label>1280 messages</Label>
            </Surface>

            {/* Added `flex-1 min-h-0` to allow dynamic scrolling */}
            <div className="flex w-full flex-1 min-h-0 flex-col gap-1 overflow-y-auto">
              {emails?.map((email, idx: number) => (
                <Surface
                  key={`-ids-${email.id}-${idx}`}
                  onClick={() => setViewMail(email.id)}
                  className={`w-full rounded-xl p-1 flex gap-1 shrink-0 cursor-pointer transition-colors ${
                    selectedEmailId === email.id ? "bg-accent-soft/50" : ""
                  }`}
                >
                  <Avatar size={"sm"} variant={"soft"} color={"accent"}>
                    {/*<Avatar.Image src={getGravatarUrl(getCleanEmail(email.from))} />*/}
                    <Avatar.Fallback>
                      {(email.from || email.sender)?.[0] || "AE"}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex-col">
                    <div className={"flex flex-col"}>
                      <Label className={"font-semibold"}>
                        {getSenderName(email.from)}
                      </Label>
                      <Description className={"text-accent"}>
                        {getCleanEmail(email.from)}
                      </Description>
                    </div>
                    <Description className={"line-clamp-2"}>
                      {email.snippet || "Go to the office..."}
                    </Description>
                    <div
                      className={
                        "w-full flex justify-between items-center mt-1"
                      }
                    >
                      <span>
                        <Chip variant={"soft"} color={"accent"} size={"sm"}>
                          <Paperclip className={"size-3"} />
                          03
                        </Chip>
                      </span>
                      <span>
                        <Description>
                          {formatDate(email.date) || "03 March, 2024"}
                        </Description>
                      </span>
                    </div>
                  </div>
                </Surface>
              ))}
            </div>
            <Pagination className="w-full">
              <Pagination.Summary className={"text-xs"}>
                {1} to {50} of {890}
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous>
                    <Pagination.PreviousIcon />
                    <span>Prev</span>
                  </Pagination.Previous>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Next>
                    <span>Next</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </Surface>
          {/* Show Mail */}
          <Surface className="flex flex-1 min-h-[80svh] flex-col gap-4 rounded-2xl p-6 overflow-y-auto">
            {selectedEmail ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <Avatar size="md" variant="soft" color="accent">
                      <Avatar.Fallback>
                        {(selectedEmail.from || selectedEmail.sender)?.[0] ||
                          "U"}
                      </Avatar.Fallback>
                    </Avatar>
                    <div>
                      <h2 className="text-base font-bold">
                        {selectedEmail.subject || "No Subject"}
                      </h2>
                      <Label className="text-sm">
                        From:{" "}
                        {getCleanEmail(selectedEmail.from) || "Unknown Sender"}
                      </Label>
                    </div>
                  </div>
                  <Description className={"mt-2"}>
                    {formatDate(selectedEmail.date)}
                  </Description>
                </div>
                <Separator />
                <div className="prose dark:prose-invert max-w-none pt-2">
                  {selectedEmail.body ? (
                    <iframe
                      srcDoc={`<base target="_blank">${selectedEmail.body}`}
                      className="w-full h-[60svh] border-none rounded-xl"
                      title="Email Body"
                      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    />
                  ) : (
                    <Typography.Paragraph>
                      {selectedEmail.snippet}
                    </Typography.Paragraph>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 h-full items-center justify-center">
                <Description>Select an email to read its content</Description>
              </div>
            )}
          </Surface>
        </Surface>
      </section>
    </div>
  );
}
