import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to?: string;
  date: string;
  body?: string;
  isReply?: boolean;
  isUserSender?: boolean;
  sequencePosition?: number;
}

interface AIEmailStore {
  emails: EmailMessage[];
  fetchEmails: (query?: string, maxResults?: number) => Promise<void>;
}

export const useAIEmailStore = create<AIEmailStore>((set) => ({
  emails: [],

  fetchEmails: async (query = "", maxResults = 15) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "gmail-connector",
        {
          body: {
            action: "list_messages",
            query,
            maxResults,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      set({ emails: data?.messages || [] });
    } catch (err) {
      console.error("Failed to fetch emails for AI SDK:", err);
      set({ emails: [] });
    }
  },
}));
