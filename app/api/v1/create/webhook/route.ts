import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function POST(request: NextRequest) {
    try {
        const { owner, repo, providerToken } = await request.json();

        if (!providerToken) {
            return NextResponse.json({ error: "Missing GitHub token" }, { status: 401 });
        }

        const octokit = new Octokit({ auth: providerToken });


        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`;

        await octokit.rest.repos.createWebhook({
            owner,
            repo,
            config: {
                url: webhookUrl,
                content_type: "json",
                secret: process.env.WEBHOOK_SECRET, // Secret used to verify incoming requests
            },
            events: ["pull_request"],
            active: true,
        });

        return NextResponse.json({ success: true, message: "Webhook attached successfully" }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}