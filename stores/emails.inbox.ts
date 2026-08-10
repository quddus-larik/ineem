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

interface EmailStore {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  selectedEmail: EmailMessage | null;
  selectedThreadMessages: EmailMessage[];
  loadingEmails: boolean;
  loadingSingleEmail: boolean;
  loadingThread: boolean;
  emailError: string | null;
  currentPage: number;
  hasMore: boolean;
  nextPageToken: string | null;
  pageTokens: string[];
  currentQuery: string;
  pageCache: Record<number, EmailMessage[]>;

  fetchEmails: (
    query?: string,
    maxResults?: number,
    pageToken?: string,
    targetPage?: number,
  ) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  setViewMail: (id: string | null) => Promise<void>;
  clearViewMail: () => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  selectedEmailId: null,
  selectedEmail: null,
  selectedThreadMessages: [],
  loadingEmails: false,
  loadingSingleEmail: false,
  loadingThread: false,
  emailError: null,
  currentPage: 1,
  hasMore: false,
  nextPageToken: null,
  pageTokens: [],
  currentQuery: "",
  pageCache: {},

  fetchEmails: async (
    query = "",
    maxResults = 15,
    pageToken?: string,
    targetPage = 1,
  ) => {
    const { pageCache } = get();

    if (pageCache[targetPage]) {
      set({
        emails: pageCache[targetPage],
        currentPage: targetPage,
        loadingEmails: false,
      });
      return;
    }

    set({ loadingEmails: true, emailError: null, currentQuery: query });

    try {
      const body: Record<string, unknown> = {
        action: "list_messages",
        query,
        maxResults,
      };
      if (pageToken) body.pageToken = pageToken;

      const { data, error } = await supabase.functions.invoke(
        "gmail-connector",
        { body },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const fetchedEmails: EmailMessage[] = data?.messages || [];
      const newNextPageToken = data?.nextPageToken || null;

      set((state) => ({
        emails: fetchedEmails,
        currentPage: targetPage,
        hasMore: !!newNextPageToken,
        nextPageToken: newNextPageToken,
        pageCache: { ...state.pageCache, [targetPage]: fetchedEmails },
      }));

      const currentSelectedId = get().selectedEmailId;
      if (currentSelectedId) {
        const found =
          fetchedEmails.find((e) => e.id === currentSelectedId) || null;
        set({ selectedEmail: found });
      }
    } catch (err: any) {
      console.error("Failed to fetch emails:", err);
      set({ emailError: err.message || "Failed to load emails" });
    } finally {
      set({ loadingEmails: false });
    }
  },

  goToNextPage: async () => {
    const {
      nextPageToken,
      pageTokens,
      currentQuery,
      currentPage,
      fetchEmails,
    } = get();
    const nextPage = currentPage + 1;

    set({
      pageTokens: nextPageToken ? [...pageTokens, nextPageToken] : pageTokens,
    });

    await fetchEmails(currentQuery, 15, nextPageToken || undefined, nextPage);
  },

  goToPrevPage: async () => {
    const { currentPage, pageTokens, currentQuery, fetchEmails } = get();
    if (currentPage <= 1) return;

    const prevPage = currentPage - 1;
    const prevTokens = pageTokens.slice(0, -1);
    const prevToken = prevTokens[prevTokens.length - 1] || undefined;

    set({ pageTokens: prevTokens });
    await fetchEmails(currentQuery, 15, prevToken, prevPage);
  },

  setViewMail: async (id: string | null) => {
    if (!id) {
      set({
        selectedEmailId: null,
        selectedEmail: null,
        selectedThreadMessages: [],
      });
      return;
    }

    const existingEmail = get().emails.find((email) => email.id === id) || null;

    set({
      selectedEmailId: id,
      selectedEmail: existingEmail,
      selectedThreadMessages: [],
      loadingSingleEmail: true,
      loadingThread: true,
    });

    try {
      if (existingEmail?.threadId) {
        const { data: threadData, error: threadError } =
          await supabase.functions.invoke("gmail-connector", {
            body: { action: "get_thread", threadId: existingEmail.threadId },
          });

        if (!threadError && threadData?.messages?.length) {
          const threadMsgs: EmailMessage[] = threadData.messages;
          const activeMail =
            threadMsgs.find((m) => m.id === id) || threadMsgs[0];

          set({
            selectedThreadMessages: threadMsgs,
            selectedEmail: activeMail,
          });
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke(
        "gmail-connector",
        { body: { action: "get_message", id } },
      );

      if (error) throw error;

      if (data?.message) {
        const fullMsg: EmailMessage = {
          ...existingEmail,
          ...data.message,
          body:
            data.message.body || data.message.snippet || existingEmail?.snippet,
        };
        set({
          selectedEmail: fullMsg,
          selectedThreadMessages: [fullMsg],
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch full email body or thread:", err);
    } finally {
      set({ loadingSingleEmail: false, loadingThread: false });
    }
  },

  clearViewMail: () => {
    set({
      selectedEmailId: null,
      selectedEmail: null,
      selectedThreadMessages: [],
    });
  },
}));
