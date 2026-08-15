import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getGithubToken } from "@/lib/github/token";

export async function GET(req: Request) {
  const { searchParams } = req.nextUrl;
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id query parameter" },
      { status: 400 }
    );
  }

  try {
    const refreshToken = await getGithubToken(user_id);

    return NextResponse.json({refreshToken});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}