"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Email = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  isReply: boolean;
  isUserSender: boolean;
};

type EmailResponse = {
  messages?: Email[];
  nextPageToken?: string | null;
  error?: string;
};

export default function Page() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  async function loadEmails(pageToken?: string) {
    try {
      setLoading(true);
      setError(null);

      // --------------------------------------------------
      // Get authenticated Supabase session
      // --------------------------------------------------

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error("You are not authenticated.");
      }

      // --------------------------------------------------
      // Build API URL
      // --------------------------------------------------

      const params = new URLSearchParams();

      params.set("action", "list_messages");
      params.set("maxResults", "15");

      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      // --------------------------------------------------
      // Call Next.js API
      // --------------------------------------------------

      const response = await fetch(`/api/v1/emails?${params.toString()}`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },

        cache: "no-store",
      });

      const data: EmailResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load emails.");
      }

      // --------------------------------------------------
      // Update UI
      // --------------------------------------------------

      setEmails(data.messages || []);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      console.error("Email loading error:", err);

      setError(err instanceof Error ? err.message : "Failed to load emails.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    loadEmails();
  }, []);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading emails...</p>
      </main>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-lg border p-4">
          <h1 className="font-semibold">Failed to load emails</h1>

          <p className="mt-2 text-sm text-red-500">{error}</p>

          <button
            onClick={() => loadEmails()}
            className="mt-4 rounded-md border px-4 py-2"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Emails
  // --------------------------------------------------

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Emails</h1>

        <p className="text-sm text-gray-500">{emails.length} emails</p>
      </div>

      {emails.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">No emails found.</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {emails.map((email) => (
            <div key={email.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium">
                    {email.subject || "(No Subject)"}
                  </h2>

                  <p className="mt-1 truncate text-sm text-gray-600">
                    {email.from}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {email.snippet}
                  </p>
                </div>

                <div className="shrink-0 text-xs text-gray-400">
                  {email.date ? new Date(email.date).toLocaleDateString() : ""}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {email.isReply && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    Reply
                  </span>
                )}

                {email.isUserSender && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    Sent by you
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {nextPageToken && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => loadEmails(nextPageToken)}
            disabled={loading}
            className="rounded-md border px-4 py-2"
          >
            Load more
          </button>
        </div>
      )}
    </main>
  );
}
