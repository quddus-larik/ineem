import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server"

export async function GET() {
  const { data, error } = await supabase.auth.getSession();

  return NextResponse.json(data);
}