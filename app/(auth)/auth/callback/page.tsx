"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Page() {
    const router = useRouter();
    const [status, setStatus] = useState("Connecting GitHub...");

    useEffect(() => {
        async function syncUserData() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    router.replace("/");
                    return;
                }

                const { user, provider_token, provider_refresh_token } = session;

                const { data, error } = await supabase
                    .from("users")
                    .upsert(
                        {
                            id: user.id,
                            github_access_token: provider_token,
                            github_refresh_token: provider_refresh_token,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "id" }
                    )
                    .select()
                    .single();

                if (error) {
                    console.error("Database sync failed:", error.message);
                    setStatus("Failed to sync GitHub account.");
                    return;
                }

                console.log("User record updated:", data);
                router.replace("/");
            } catch (err) {
                console.error("Unexpected error:", err);
                router.replace("/");
            }
        }

        syncUserData();
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-gray-500">{status}</p>
        </main>
    );
}