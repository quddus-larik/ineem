import { Octokit } from "@octokit/rest";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

function buildSearchTool(token: string) {
    const octokit = new Octokit({ auth: token });

    return new DynamicStructuredTool({
        name: "search_my_repos",
        description: "Search repositories with filters like language, stars, forks or push time.",
        schema: z.object({
            language: z.string().nullable().optional().describe("Language filter, e.g., typescript"),
            stars: z.number().nullable().optional().describe("Exact or minimum number of stars"),
            forks: z.number().nullable().optional().describe("Exact or minimum number of forks"),
            updatedWithinHours: z.number().nullable().optional().describe("Filter repos pushed within last N hours"),
            name: z.string().nullable().optional().describe("Name filter, e.g., collaric, repo name"),
        }),
        func: async ({ language, stars, forks, updatedWithinHours, name }) => {
            try {
                const { data: user } = await octokit.rest.users.getAuthenticated();
                const username = user.login;

                const queryParts: string[] = [];
                queryParts.push(`user:${username}`);

                if (language) queryParts.push(`language:${language}`);
                if (stars != null) queryParts.push(`stars:>=${stars}`);
                if (forks != null) queryParts.push(`forks:>=${forks}`);
                if (updatedWithinHours) {
                    const pastDate = new Date(Date.now() - updatedWithinHours * 60 * 60 * 1000);
                    queryParts.push(`pushed:>${pastDate.toISOString()}`);
                }
                if (name) queryParts.push(`${username}/${name} in:name`);

                const query = queryParts.join(" ");

                const res = await octokit.rest.search.repos({
                    q: query,
                    sort: "updated",
                    order: "desc",
                    per_page: 10,
                });

                const repos = res.data.items.map((repo) => ({
                    name: repo.name,
                    full_name: repo.full_name,
                    description: repo.description,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    language: repo.language,
                    pushed_at: repo.pushed_at,
                    url: repo.html_url,
                }));

                return JSON.stringify({ repos });
            } catch (error: any) {
                return JSON.stringify({ repos: [], error: `GitHub API Error: ${error.message}` });
            }
        },
    });
}

export function createAgent(token: string) {
    const llm = new ChatGroq({
        model: "openai/gpt-oss-20b",
        temperature: 0,
        apiKey: process.env.GROQ_API_KEY,
    });

    return createReactAgent({
        llm,
        tools: [buildSearchTool(token)],
        prompt: "You have access to a GitHub repository search tool. When users ask about their repositories, you MUST use the search_my_repos tool to find the answer. If they mention a programming language, pass it as the 'language' parameter. If they mention a repository name, pass it as the 'name' parameter. Do not answer from your own knowledge. The repository list is already displayed separately in the UI, so never list or repeat the repos in your response. Give a brief one- or two-sentence summary instead — mention how many were found, the most notable ones (by stars or recency), and any quick observations. No tables, no headings, no markdown formatting.",
    });
}
