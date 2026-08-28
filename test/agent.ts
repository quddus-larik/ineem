import { Octokit } from "@octokit/rest";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

const octokit = new Octokit({
    auth: "{token}",
});

const searchMyReposTool = new DynamicStructuredTool({
    name: "search_my_repos",
    description: "Search repositories with filters like language, stars, forks or push time.",
    schema: z.object({
        language: z.string().optional().describe("Language filter, e.g., typescript"),
        stars: z.number().optional().describe("Exact or minimum number of stars"),
        forks: z.number().optional().describe("Exact or minimum number of forks"),
        updatedWithinHours: z.number().optional().describe("Filter repos pushed within last N hours"),
        name: z.string().optional().describe("Name filter, e.g., collaric, repo name").default(""),
    }),
    func: async ({ language, stars, forks, updatedWithinHours, name }) => {
        try {
            const { data: user } = await octokit.rest.users.getAuthenticated();
            const username = user.login;

            const queryParts = [];

            queryParts.push(`user:${username}`);

            if (language) queryParts.push(`language:${language}`);
            if (stars !== undefined) queryParts.push(`stars:>=${stars}`);
            if (forks !== undefined) queryParts.push(`forks:>=${forks}`);


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
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                pushed_at: repo.pushed_at,
                url: repo.html_url,
            }));

            return JSON.stringify(repos);
        } catch (error: any) {
            return JSON.stringify({ error: `GitHub API Error: ${error.message}` });
        }
    },
});

const llm = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    apiKey: "{key}",
});

const agent = createReactAgent({
    llm,
    tools: [searchMyReposTool],
    prompt: "You have access to a GitHub repository search tool. When users ask about their repositories, you MUST use the search_my_repos tool to find the answer. If they mention a programming language, pass it as the 'language' parameter. If they mention a repository name, pass it as the 'name' parameter. Do not answer from your own knowledge.",
});

async function main() {
    const response = await agent.invoke({
        messages: [
            {
                role: "user",
                content: "Is any repos exists in my github named collaric?",
            },
        ],
    });

    const toolMessages = response.messages.filter(
        (msg: any) => msg.constructor?.name === "ToolMessage" || msg.type === "tool"
    );

    const repositories = toolMessages.flatMap((msg: any) => {
        try {
            return JSON.parse(msg.content);
        } catch {
            return [];
        }
    });

    const aiMessage = response.messages.find(
        (msg: any) => msg.constructor?.name === "AIMessage" && !msg.tool_calls?.length
    );

    const result = {
        type: "search_owner_repos" as const,
        repositories,
        ai_response: aiMessage?.content || "No AI response generated",
    };

    console.log(JSON.stringify(result, null, 2));
    return result;
}

main().catch(console.error);