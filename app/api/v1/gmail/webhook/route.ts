import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const secret = process.env.WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const { userId, sender, subject, body } = payload;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
