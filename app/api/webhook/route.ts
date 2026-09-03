// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Trigger only when a PR is newly opened
        if (body.action === "opened" && body.pull_request) {
            const owner = body.repository.owner.login;
            const repo = body.repository.name;
            const issue_number = body.pull_request.number;

            // Authenticate with your GitHub App/User Token
            const octokit = new Octokit({
                auth: process.env.GITHUB_BOT_TOKEN,
            });

            // Post the PR Comment
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number,
                body: "### Security Check Bot 🛡️\n\nHi! Automated security scan in progress...",
            });
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
    }
}