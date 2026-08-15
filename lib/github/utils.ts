export async function getRepos(
  token: Promise<string | undefined>,
): Promise<any[]> {
  const resolvedToken = await token;

  if (!resolvedToken) {
    throw new Error("No GitHub token provided");
  }

  const res = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${resolvedToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}
