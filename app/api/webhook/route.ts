// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import crypto from "crypto";

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;

    // Prevents timing attacks
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-hub-signature-256");
        const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

        if (!webhookSecret || !verifySignature(rawBody, signature, webhookSecret)) {
            return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);

        // Trigger only when a PR is newly opened
        if (body.action === "opened" && body.pull_request) {
            const owner = body.repository.owner.login;
            const repo = body.repository.name;
            const issue_number = body.pull_request.number;

            const octokit = new Octokit({
                auth: process.env.GITHUB_BOT_TOKEN,
            });

            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number,
                body: "### Security Check Bot 🛡️\n\nHi! Automated security scan in progress...",
            });
        }
        if (body.action === "reopened" && body.pull_request) {
            const owner = body.repository.owner.login;
            const repo = body.repository.name;
            const issue_number = body.pull_request.number;

            const octokit = new Octokit({
                auth: process.env.GITHUB_BOT_TOKEN,
            });

            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number,
                body: "### reopened PR",
            });
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to process webhook", msg: error }, { status: 500 });
    }
}