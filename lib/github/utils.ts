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
