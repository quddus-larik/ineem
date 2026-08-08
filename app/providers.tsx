"use client"

// app/providers.tsx
import { ThemeProvider } from "next-themes";
import { ProgressProvider } from "@bprogress/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
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
