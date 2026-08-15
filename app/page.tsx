// app/components/GithubRepos.tsx (or wherever you keep this)
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"; // adjust path to your Supabase client
import { getGithubToken } from "@/lib/github/token";
import { handleConnectGithub } from "@/handlers/github.connect";
import { Button } from "@heroui/react";

export default function GithubRepos() {
  const [repos, setRepos] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();
        console.log("User", session);

        if (userError || !user) {
          setError(userError?.message || "Not authenticated");
          setLoading(false);
          return;
        }

        const githubToken = getGithubToken(user.id);
        console.log("githubToken", githubToken);

        if (!githubToken) {
          setError("No GitHub token found for this user");
          setLoading(false);
          return;
        }

        const res = await fetch('https://api.github.com/user/repos',{
          headers: {
            Authorization: `Bearer ${session.provider_token}`
          }
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }

        const data = await res.json();
        console.log(data);

        if (!cancelled) {
          setRepos(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (<div>
    <Button onClick={() => handleConnectGithub()}>Connect</Button>
  </div>);
}