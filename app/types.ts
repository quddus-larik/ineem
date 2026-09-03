export interface Repo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    pushed_at: string;
    html_url: string;
    private: boolean;
    owner: {
        login: string;
    };
    node_id: string;
}

export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    forkCount: number;
    stargazerCount: number;
    isPrivate: boolean;
    pullRequests: { totalCount: number };
    owner: {
        login: string;
    };
    node_id: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    repos?: Repo[];
}

export interface SessionUser {
    id?: string;
}
