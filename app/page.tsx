"use client";

import { Button } from "@heroui/react";
import { ThemeSwitch } from "@/components/custom/switch.theme";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { handleConnectGmail } from "@/handlers/gmail.connect";
import { useEmailStore } from "@/stores/emails.inbox";

function Page() {
    const [userData, setUserData] = useState<any>(null);
    const { emails, loadingEmails, emailError, fetchEmails } = useEmailStore();

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserData(user);
            }
        }
        fetchUser();
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button onPress={handleConnectGmail} color="primary">
                        Connect Gmail
                    </Button>
                    <Button
                        onPress={() => fetchEmails()}
                        isLoading={loadingEmails}
                        color="secondary"
                        variant="flat"
                    >
                        Fetch Emails
                    </Button>
                </div>
                <ThemeSwitch />
            </div>

            {/* Email List Render */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Unread Emails</h2>

                {emailError && (
                    <p className="text-sm text-danger">{emailError}</p>
                )}

                {emails.length > 0 ? (
                    <div className="space-y-3">
                        {emails.map((email) => (
                            <div
                                key={email.id}
                                className="p-4 border border-default-200 rounded-xl bg-content1 shadow-sm space-y-1"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-medium">{email.subject}</h3>
                                    <span className="text-xs text-default-400">{email.date}</span>
                                </div>
                                <p className="text-xs text-default-500">From: {email.from}</p>
                                <p className="text-sm text-default-700 line-clamp-2">{email.snippet}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loadingEmails && (
                        <p className="text-sm text-default-400">
                            No emails fetched yet. Click &quot;Fetch Emails&quot; to load messages.
                        </p>
                    )
                )}
            </div>

            {/* Raw Email JSON Preview */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-default-500">Raw Email JSON</h3>
                <pre className="p-4 bg-default-100 rounded-lg text-xs overflow-x-auto max-h-60">
                    {JSON.stringify(emails, null, 2)}
                </pre>
            </div>

            {/* User Data Preview */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-default-500">User Session</h3>
                <pre className="p-4 bg-default-100 rounded-lg text-xs overflow-x-auto max-h-60">
                    {JSON.stringify(userData, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default Page;