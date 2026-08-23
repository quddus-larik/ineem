import { supabase } from "@/lib/supabase/client";

export interface GithubRepo {
  id: string;
  name: string;
  title: string;
  key: string;
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

export async function getRepos(
  token: Promise<string | undefined>,
): Promise<GithubRepo[]> {
  const resolvedToken = await token;

  if (!resolvedToken) {
    throw new Error("No GitHub token provided");
  }

  const query = `
    query {
      viewer {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            id
            name
            owner {
              login
            }
            description
            visibility
            pushedAt
            isFork
            pullRequests(states: MERGED) {
              totalCount
            }
            refs(refPrefix: "refs/heads/") {
              totalCount
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolvedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }

  const { data, errors } = await res.json();

  if (errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(errors)}`);
  }

  return data.viewer.repositories.nodes.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    title: repo.name,
    key: `${repo.owner.login}/${repo.name}`,
    description: repo.description,
    updated_at: repo.pushedAt,
    language: repo.languages.nodes[0]?.name ?? null,
    languages: repo.languages.nodes.map((l: any) => l.name),
    visibility: repo.visibility,
    merge_count: repo.pullRequests.totalCount,
    branches_count: repo.refs.totalCount,
    commit_count: repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
    forked_external: repo.isFork,
  }));
}

export interface GithubLabel {
  name: string;
  color: string;
}

export interface GithubPullRequest {
  number: number;
  title: string;
  state: string;
  url: string;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  author: { login: string } | null;
  comments: { totalCount: number };
  labels: { nodes: GithubLabel[] };
}

export interface GithubIssue {
  number: number;
  title: string;
  state: string;
  stateReason: string | null;
  url: string;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  author: { login: string } | null;
  comments: { totalCount: number };
  labels: { nodes: GithubLabel[] };
}

export interface GithubFileNode {
  path: string;
  mode: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
  url: string;
}

export interface GithubRepoDetails {
  pullRequests: GithubPullRequest[];
  issues: GithubIssue[];
  fileTree: GithubFileNode[];
}

export async function getRepoDetails(user: string, repo: string): Promise<GithubRepoDetails> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.provider_token) {
    throw new Error("No GitHub token provided");
  }

  const token = session.provider_token;

  const query = `
    query ($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        defaultBranchRef {
          target {
            oid
          }
        }
        pullRequests(first: 50, states: [OPEN, MERGED, CLOSED]) {
          totalCount
          nodes {
            id
            number
            title
            state
            url
            body
            createdAt
            updatedAt
            closedAt
            mergedAt
            additions
            deletions
            changedFiles
            author {
              login
            }
            comments {
              totalCount
            }
            labels(first: 10) {
              nodes {
                name
                color
              }
            }
          }
        }
        issues(first: 50, states: [OPEN, CLOSED]) {
          totalCount
          nodes {
            number
            title
            state
            stateReason
            url
            body
            createdAt
            updatedAt
            closedAt
            author {
              login
            }
            comments {
              totalCount
            }
            labels(first: 10) {
              nodes {
                name
                color
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { owner: user, name: repo },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }

  const { data, errors } = await res.json();

  if (errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(errors)}`);
  }

  const repoData = data.repository;
  const oid = repoData.defaultBranchRef?.target?.oid;

  let fileTree: GithubFileNode[] = [];
  if (oid) {
    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${user}/${repo}/git/trees/${oid}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (treeRes.ok) {
        const treeJson = await treeRes.json();
        fileTree = treeJson.tree ?? [];
      } else {
        console.error("Failed to fetch file tree:", treeRes.status);
      }
    } catch (err) {
      console.error("Failed to fetch file tree:", err);
    }
  }

  const result: GithubRepoDetails = {
    pullRequests: repoData.pullRequests.nodes,
    issues: repoData.issues.nodes,
    fileTree,
  };

  console.log("Pull Requests:", result.pullRequests);
  console.log("Issues:", result.issues);
  console.log("File Tree:", result.fileTree);

  return result;
}
