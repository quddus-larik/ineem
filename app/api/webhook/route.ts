// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import crypto from "crypto";

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;

    const sigBuf = Buffer.from(signature);
    const digBuf = Buffer.from(digest);

    // Buffer lengths must match before running timingSafeEqual
    if (sigBuf.length !== digBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, digBuf);
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-hub-signature-256");

        // Match the secret variable used during webhook creation
        const webhookSecret = process.env.WEBHOOK_SECRET || process.env.GITHUB_WEBHOOK_SECRET;

        if (!webhookSecret || !verifySignature(rawBody, signature, webhookSecret)) {
            return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);

        // Handle initial GitHub ping
        if (body.zen || body.hook) {
            return NextResponse.json({ msg: "pong" }, { status: 200 });
        }

        // Handle both opened and reopened PR actions
        if (["opened", "reopened"].includes(body.action) && body.pull_request) {
            const owner = body.repository.owner.login;
            const repo = body.repository.name;
            const issue_number = body.pull_request.number;

            const octokit = new Octokit({
                auth: process.env.GITHUB_BOT_TOKEN,
            });

            const commentBody =
                body.action === "opened"
                    ? "### Security Check Bot 🛡️\n\nHi! Automated security scan in progress..."
                    : "### reopened PR";

            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number,
                body: commentBody,
            });
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to process webhook";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}