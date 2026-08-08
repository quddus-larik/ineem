"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function GmailCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Connecting your Gmail account...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function handleCallbackGmail() {
            try {
                // 1. Fetch current user session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    throw new Error(sessionError?.message || "No active authentication session found.");
                }

                // 2. Extract provider refresh token if returned by Google OAuth
                const refreshToken = session.provider_refresh_token;

                if (refreshToken) {
                    const { error: dbError } = await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            email: session.user.email,
                            gmail_refresh_token: refreshToken,
                            updated_at: new Date().toISOString(),
                        }, {
                            onConflict: 'id'
                        });

                    if (dbError) throw dbError;

                    setStatus("Gmail connected successfully! Redirecting...");
                } else {
                    // If returning user already connected or refresh token wasn't re-issued
                    setStatus("Session synced. Redirecting...");
                }

                // 3. Redirect back to dashboard settings page
                setTimeout(() => {
                    router.push("/");
                }, 1200);

            } catch (err: any) {
                console.error("Error processing Gmail OAuth callback:", err);
                setError(err.message || "Failed to process Gmail connection.");

                setTimeout(() => {
                    router.push("/error?error=gmail_connection_failed");
                }, 2500);
            }
        }

        handleCallbackGmail();
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