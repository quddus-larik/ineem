import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const GMAIL_EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gmail-connector`;

export async function GET(req: NextRequest) {
  try {

    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        {
          error: "Missing Authorization header",
        },
        {
          status: 401,
        },
      );
    }

    if (!authorization.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        {
          error: "Invalid Authorization header",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } = req.nextUrl;

    const action = searchParams.get("action") || "list_messages";

    const query = searchParams.get("query") || "";

    const maxResults = Number(searchParams.get("maxResults")) || 15;

    const pageToken = searchParams.get("pageToken") || undefined;

    const threadId = searchParams.get("threadId") || undefined;

    const messageId = searchParams.get("id") || undefined;

    const payload: Record<string, unknown> = {
      action,
      query,
      maxResults,
    };

    if (pageToken) {
      payload.pageToken = pageToken;
    }

    if (threadId) {
      payload.threadId = threadId;
    }

    if (messageId) {
      payload.id = messageId;
    }

    // ------------------------------------------------------------
    // Call Supabase Edge Function
    // ------------------------------------------------------------

    const edgeResponse = await fetch(GMAIL_EDGE_FUNCTION_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        // IMPORTANT:
        // Forward the user's Supabase JWT
        Authorization: authorization,

        // Supabase Edge Functions also accept the project anon key
        apikey: SUPABASE_ANON_KEY,
      },

      body: JSON.stringify(payload),

      // Don't cache Gmail data
      cache: "no-store",
    });

    const contentType = edgeResponse.headers.get("content-type") || "";

    let edgeData: unknown;

    if (contentType.includes("application/json")) {
      edgeData = await edgeResponse.json();
    } else {
      const text = await edgeResponse.text();

      edgeData = {
        error: text,
      };
    }

    if (!edgeResponse.ok) {
      console.error(
        "Gmail Edge Function error:",
        edgeResponse.status,
        edgeData,
      );

      return NextResponse.json(edgeData, {
        status: edgeResponse.status,
      });
    }


    return NextResponse.json(edgeData, {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Gmail API route error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}
