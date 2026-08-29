import {NextResponse} from "next/server";
import {graphql} from "@octokit/graphql";

export async function GET(req: Request) {
    const authHeader = req.headers.get("Authorization");

    const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    if (!accessToken) {
        return NextResponse.json(
            {message: "GitHub access token not found"},
            {status: 401}
        );
    }

    const client = graphql.defaults({
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });

    try {
        const result = await client(`
      query {
  viewer {
    repositories(first: 100, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], orderBy: { field: UPDATED_AT, direction: DESC }) {
      nodes {
        id
        name
        nameWithOwner
        description
        url
        isPrivate
        primaryLanguage {
          name
        }
        # Total count of forks
        forkCount
        # Total count of stars (stargazers)
        stargazerCount
        # List of branches (refs targeting heads)
        refs(first: 1, refPrefix: "refs/heads/") {
          totalCount
        }
        # List of open pull requests
        pullRequests(states: OPEN) {
          totalCount
        }
      }
    }
  }
}

    `);

        const repositories =
            (result as any).viewer.repositories.nodes ?? [];

        return NextResponse.json({repositories});
    } catch (error: any) {
        return NextResponse.json(
            {message: "Failed to fetch repositories", error: error.message},
            {status: 500}
        );
    }
}
