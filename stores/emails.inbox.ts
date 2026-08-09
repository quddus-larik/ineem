import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

export interface EmailMessage {
    id: string;
    threadId: string;
    snippet: string;
    subject: string;
    from: string;
    date: string;
    body?: string;
}

interface EmailStore {
    emails: EmailMessage[];
    selectedEmailId: string | null;
    selectedEmail: EmailMessage | null;
    loadingEmails: boolean;
    loadingSingleEmail: boolean;
    emailError: string | null;
    fetchEmails: (query?: string, maxResults?: number) => Promise<void>;
    setViewMail: (id: string | null) => Promise<void>;
    clearViewMail: () => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
    emails: [],
    selectedEmailId: null,
    selectedEmail: null,
    loadingEmails: false,
    loadingSingleEmail: false,
    emailError: null,

    fetchEmails: async (query = "after:2026/08/07 before:2026/08/10", maxResults = 30) => {
        set({ loadingEmails: true, emailError: null });

        try {
            const { data, error } = await supabase.functions.invoke("gmail-connector", {
                body: {
                    action: "list_messages",
                    query,
                    maxResults,
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            const fetchedEmails: EmailMessage[] = data?.messages || [];
            set({ emails: fetchedEmails });

            const currentSelectedId = get().selectedEmailId;
            if (currentSelectedId) {
                const found = fetchedEmails.find((e) => e.id === currentSelectedId) || null;
                set({ selectedEmail: found });
            }
        } catch (err: any) {
            console.error("Failed to fetch emails:", err);
            set({ emailError: err.message || "Failed to load emails" });
        } finally {
            set({ loadingEmails: false });
        }
    },

    setViewMail: async (id: string | null) => {
        if (!id) {
            set({ selectedEmailId: null, selectedEmail: null });
            return;
        }

        const existingEmail = get().emails.find((email) => email.id === id) || null;

        // Set immediate selection so UI updates quickly with local preview data
        set({
            selectedEmailId: id,
            selectedEmail: existingEmail,
            loadingSingleEmail: true,
        });

        try {
            // Fetch the full email message (including body) from the Edge Function
            const { data, error } = await supabase.functions.invoke("gmail-connector", {
                body: {
                    action: "get_message",
                    id,
                },
            });

            if (error) throw error;

            if (data?.message) {
                set({
                    selectedEmail: {
                        ...existingEmail,
                        ...data.message,
                        body: data.message.body || data.message.snippet || existingEmail?.snippet,
                    },
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch full email body:", err);
        } finally {
            set({ loadingSingleEmail: false });
        }
    },

    clearViewMail: () => {
        set({ selectedEmailId: null, selectedEmail: null });
    },
}));