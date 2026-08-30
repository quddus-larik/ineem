import {NextResponse} from "next/server";
import {Octokit} from "@octokit/rest";

export async function GET(req: Request) {
    const authHeader: string | null = req.headers.get("Authorization");
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    if (!accessToken) {
        return NextResponse.json(
            {message: "GitHub access token not found"},
            {status: 401}
        );
    }

    const octokit = new Octokit({auth: accessToken});

    try {
        const {data: reposResponse} = await octokit.rest.repos.listForAuthenticatedUser({
            affiliation: ["owner", "collaborator", "organization_member"],
            sort: "updated",
            direction: "desc",
            per_page: 100,
        });

        const repos = reposResponse.map((repo: any) => ({
            ...repo,
            forkCount: repo.forks_count,
            stargazerCount: repo.stargazers_count,
            isPrivate: repo.private,
            pullRequests: { totalCount: repo.open_issues_count },
        }));

        if (id) {
            const repo = repos.find((r: any) => r.id.toString() === id);
            if (!repo) {
                return NextResponse.json(
                    {message: "Repository not found"},
                    {status: 404}
                );
            }
            return NextResponse.json({repo});
        }

        return NextResponse.json({repositories: repos});
    } catch (error: any) {
        return NextResponse.json(
            {message: "Failed to fetch repositories", error: error.message},
            {status: 500}
        );
    }
}
