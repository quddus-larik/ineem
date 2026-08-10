"use client";
import {
  Surface,
  Typography,
  Label,
  Chip,
  Avatar,
  Description,
  Separator,
  Pagination,
  Spinner
} from "@heroui/react";
import { useEmailStore } from "@/stores/emails.inbox";
import { Paperclip, MessageReply } from "@mynaui/icons-react";
import { useEffect } from "react";
import { EmailSidebar } from "@/components/custom/email-sidebar";

export default function Page() {
  const {
    emails,
    loadingEmails,
    fetchEmails,
    setViewMail,
    selectedEmail,
    selectedEmailId,
    selectedThreadMessages,
    loadingThread,
    currentPage,
    hasMore,
    goToNextPage,
    goToPrevPage
  } = useEmailStore();

  useEffect(() => {
    (async function() {
      await fetchEmails();
    })();
  }, []);

  function formatDate(dateString?: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function getCleanEmail(senderString?: string): string {
    if (!senderString) return "";
    const match = senderString.match(/<([^>]+)>/);
    return match ? match[1] : senderString.trim();
  }

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
          className="w-full flex flex-row items-start gap-2 rounded-2xl p-2"
        >
          {/* Email List Panel */}
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

              <Label>300 messages</Label>
            </Surface>

            <div className="flex w-full flex-1 min-h-0 flex-col gap-1 overflow-y-auto">
              {emails?.map((email, idx: number) => (
                <Surface
                  key={`-ids-${email.id}-${idx}`}
                  onClick={() => setViewMail(email.id)}
                  className={`w-full rounded-xl p-1 flex gap-1 shrink-0 cursor-pointer transition-colors ${
                    selectedEmailId === email.id ? "bg-accent-soft/50" : ""
                  }`}
                >
                  <Avatar size="sm" variant="soft" color="accent">
                    <Avatar.Fallback>
                      {(email.from || "U")?.[0] || "AE"}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex-col">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <Label className="font-semibold truncate">
                          {getSenderName(email.from)}
                        </Label>
                      </div>
                      <Description className="text-accent truncate">
                        {getCleanEmail(email.from)}
                      </Description>
                    </div>
                    <Description className="line-clamp-2">
                      {email.snippet || "No preview available..."}
                    </Description>
                    <div className="w-full flex justify-between items-center mt-1">
                      <span className={"flex gap-1 items-center"}>
                        <Chip variant="soft" color="accent" size="sm">
                          <Paperclip className="size-3" />
                          03
                        </Chip>
                        {email.isReply && (
                          <MessageReply className="size-4" />
                        )}
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
              <Pagination.Summary className="text-xs">
                {(() => {
                  const pageSize = 15;
                  const total = 300;
                  const start = (currentPage - 1) * pageSize + 1;
                  const end = Math.min(currentPage * pageSize, total);
                  return `${start} to ${end} of ${total}`;
                })()}
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={currentPage <= 1 || loadingEmails}
                    onPress={goToPrevPage}
                  >
                    <Pagination.PreviousIcon />
                    <span>Prev</span>
                  </Pagination.Previous>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={!hasMore || loadingEmails}
                    onPress={goToNextPage}
                  >
                    <span>Next</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </Surface>

          {/* Email Thread / Detail View */}
          <Surface className="flex flex-1 min-h-[80svh] flex-col gap-4 rounded-2xl p-6 overflow-y-auto">
            {selectedEmail ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {selectedEmail.subject || "No Subject"}
                    </h2>
                    {selectedThreadMessages.length > 1 && (
                      <Chip variant="soft" color="accent">
                        {selectedThreadMessages.length} Messages in Thread
                      </Chip>
                    )}
                  </div>
                </div>

                <Separator />

                {loadingThread ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-2">
                    <Spinner
                      className="animate-[spin_0.4s_linear_infinite]"
                      size="md"
                      color="accent"
                    />
                    <Typography.Paragraph>
                      Loading message thread...
                    </Typography.Paragraph>
                  </div>
                ) : selectedThreadMessages.length > 0 ? (
                  /* Thread Message Chain */
                  <div className="flex flex-col gap-6 h-[60svh] overflow-y-auto">
                    {selectedThreadMessages.map((msg, index) => (
                      <Surface
                        key={msg.id}
                        className={`flex flex-col gap-3 p-4 rounded-xl border ${
                          msg.isUserSender
                            ? "bg-accent-soft/20 border-accent/30 ml-4"
                            : "bg-surface-default border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm" variant="soft" color="accent">
                              <Avatar.Fallback>
                                {getSenderName(msg.from)[0] || "U"}
                              </Avatar.Fallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold">
                                  {getSenderName(msg.from)}
                                </Label>
                                {msg.isReply && (
                                  <Chip
                                    variant="soft"
                                    color="accent"
                                    size="sm"
                                    className="text-[10px] px-1 py-0"
                                  >
                                    Reply #{index}
                                  </Chip>
                                )}
                              </div>
                              <Description className="text-xs">
                                From: {getCleanEmail(msg.from)}
                              </Description>
                            </div>
                          </div>
                          <Description className="text-xs">
                            {formatDate(msg.date)}
                          </Description>
                        </div>

                        <Separator className="my-1" />

                        {msg.body ? (
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"></head><body style="font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 4px;">${msg.body}</body></html>`}
                            className="w-full max-h-[40svh] border-none rounded-lg"
                            title={`Email Body ${msg.id}`}
                            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                          />
                        ) : (
                          <Description className="italic">
                            {msg.snippet || "No body content available."}
                          </Description>
                        )}
                      </Surface>
                    ))}
                  </div>
                ) : (
                  /* Single Email View Fallback */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" variant="soft" color="accent">
                        <Avatar.Fallback>
                          {getSenderName(selectedEmail.from)[0] || "U"}
                        </Avatar.Fallback>
                      </Avatar>
                      <div>
                        <Label className="text-sm font-semibold">
                          From:{" "}
                          {getCleanEmail(selectedEmail.from) ||
                            "Unknown Sender"}
                        </Label>
                        <Description className="text-xs">
                          {formatDate(selectedEmail.date)}
                        </Description>
                      </div>
                    </div>
                    {selectedEmail.body ? (
                      <iframe
                        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"></head><body>${selectedEmail.body}</body></html>`}
                        className="w-full h-[55svh] border-none rounded-xl"
                        title="Email Body"
                        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-4">
                        <Spinner
                          className="animate-[spin_0.4s_linear_infinite]"
                          size="md"
                          color="accent"
                        />
                        <Typography.Paragraph>
                          Getting content, please wait...
                        </Typography.Paragraph>
                      </div>
                    )}
                  </div>
                )}
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
