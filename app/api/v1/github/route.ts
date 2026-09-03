import {NextRequest, NextResponse} from "next/server";
import {Octokit} from "@octokit/rest";

export async function GET(req: NextRequest) {
    const authHeader: string | null = req.headers.get("Authorization");
    const searchParams = req.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

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
            affiliation: "owner,collaborator,organization_member",
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

        if (owner && repo) {
            const repoData = reposResponse.find((r: any) => r.name === repo && r.owner.login === owner);
            if (!repoData) {
                return NextResponse.json(
                    {message: "Repository not found"},
                    {status: 404}
                );
            }
            return NextResponse.json({repo: repoData});
        }

        return NextResponse.json({repositories: repos});
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch repositories";
        return NextResponse.json(
            {message: "Failed to fetch repositories", error: message},
            {status: 500}
        );
    }
}
