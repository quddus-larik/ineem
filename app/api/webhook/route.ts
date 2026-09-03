// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import crypto from "crypto";

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;

    const sigBuf = Buffer.from(signature);
    const digBuf = Buffer.from(digest);

    if (sigBuf.length !== digBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, digBuf);
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-hub-signature-256");

        const webhookSecret = process.env.WEBHOOK_SECRET || process.env.GITHUB_WEBHOOK_SECRET;

        if (!webhookSecret || !verifySignature(rawBody, signature, webhookSecret)) {
            return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);

        // Handle initial GitHub ping
        if (body.zen || body.hook) {
            return NextResponse.json({ msg: "pong" }, { status: 200 });
        }

        const appId = process.env.GITHUB_APP_ID;
        const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

        if (!appId || !privateKey) {
            return NextResponse.json({ error: "GitHub App credentials not configured" }, { status: 500 });
        }

        const installationId = body.installation?.id;

        // 1. Handle GitHub App Installation Events
        if (body.action === "created" && body.installation) {
            console.log(`App installed successfully! Installation ID: ${installationId}`);
            console.log(`Installed on account: ${body.installation.account.login}`);
            return NextResponse.json({ received: true, action: "installed" }, { status: 200 });
        }

        if (body.action === "deleted" && body.installation) {
            console.log(`App uninstalled. Installation ID: ${installationId}`);
            return NextResponse.json({ received: true, action: "uninstalled" }, { status: 200 });
        }

        // 2. Handle PR Events (opened & reopened)
        if (["opened", "reopened"].includes(body.action) && body.pull_request) {
            if (!installationId) {
                return NextResponse.json({ error: "Missing installation ID in payload" }, { status: 400 });
            }

            const owner = body.repository.owner.login;
            const repo = body.repository.name;
            const issue_number = body.pull_request.number;

            // Authenticate dynamically as the GitHub App installation ([bot])
            const octokit = new Octokit({
                authStrategy: createAppAuth,
                auth: {
                    appId,
                    privateKey: privateKey.replace(/\\n/g, "\n"),
                    installationId,
                },
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