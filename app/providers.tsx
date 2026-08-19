"use client"

// app/providers.tsx
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { ProgressProvider } from "@bprogress/next/app";
import { useGithubRepoStore } from "@/stores/github.repos";

export function Providers({ children }: { children: React.ReactNode }) {
  const fetchRepos = useGithubRepoStore((s) => s.fetchRepos);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <ProgressProvider
        height="4px"
        color="#5465ff"
        options={{ showSpinner: false }}
      >
        {children}
      </ProgressProvider>
    </ThemeProvider>
  );
}
