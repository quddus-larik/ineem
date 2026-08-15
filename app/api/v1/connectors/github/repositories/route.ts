import { Octokit } from "octokit";
import { NextRequest, NextResponse } from "next/server";
import { getGithubToken } from "@/lib/github/token";

export async function GET(request: NextRequest) {
  const user_id = request.nextUrl.searchParams.get("user_id");
  const refreshToken = getGithubToken(user_id);

  const octokit = new Octokit({
    auth: accessToken
  });

  try {
    const { data: repos } = await octokit.request("GET /user/repos", {
      per_page: 100,
      sort: "updated"
    });

    return NextResponse.json({
      repos
    });

  } catch (error) {
    console.error("GitHub REST error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
