"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function GithubCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting your GitHub account...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallbackGithub() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error(
            sessionError?.message || "No active authentication session found."
          );
        }

        const refreshToken = session.provider_token;
        const accessToken = session.access_token;

        if (refreshToken) {
          const { error: dbError } = await supabase
            .from("users")
            .upsert(
              {
                id: session.user.id,
                email: session.user.email,
                github_refresh_token: refreshToken,
                updated_at: new Date().toISOString(),
                github_access_token: accessToken,
              },
              { onConflict: "id" }
            );

          if (dbError) throw dbError;

          setStatus("GitHub connected successfully! Redirecting...");
        } else {
          setStatus("Session synced. Redirecting...");
        }


      } catch (err: unknown) {
        console.error("Error processing GitHub OAuth callback:", err);
        setError(err.message || "Failed to process GitHub connection.");

        setTimeout(() => {
          router.push("/error?error=github_connection_failed");
        }, 2500);
      }
    }

    handleCallbackGithub();
    redirect("/");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      {error ? (
        <p className="text-destructive font-medium">{error}</p>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground animate-pulse font-medium">
            {status}
          </p>
        </div>
      )}
    </div>
  );
}


