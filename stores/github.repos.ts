import { create } from "zustand";
import { getRepos } from "@/lib/github/utils";
import { supabase } from "@/lib/supabase/client";

export interface GithubRepo {
  id: string;
  name: string;
  title: string;
  description: string | null;
  updated_at: string;
  language: string | null;
  languages: string[];
  visibility: string;
  merge_count: number;
  branches_count: number;
  commit_count: number;
  forked_external: boolean;
}

interface GithubRepoStore {
  repos: GithubRepo[];
  loadingRepos: boolean;
  repoError: string | null;
  selectedRepoId: string | null;
  fetchRepos: () => Promise<void>;
  setSelectedRepo: (id: string | null) => void;
}

export const useGithubRepoStore = create<GithubRepoStore>((set) => ({
  repos: [],
  loadingRepos: false,
  repoError: null,
  selectedRepoId: null,

  fetchRepos: async () => {
    set({ loadingRepos: true, repoError: null });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session) {
        throw new Error("No authenticated user found");
      }

      const repos = await getRepos(
        Promise.resolve(session?.provider_token ?? undefined)
      );

      set({ repos });
    } catch (err: any) {
      console.error("Failed to fetch GitHub repos:", err);
      set({ repoError: err.message || "Failed to load repositories" });
    } finally {
      set({ loadingRepos: false });
    }
  },

  setSelectedRepo: (id) => set({ selectedRepoId: id }),
}));
