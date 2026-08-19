
import { supabase } from "@/lib/supabase/client";


export async function getGithubToken(userId: string): Promise<string> {
  if (!userId) {
    throw new Error("Missing user ID");
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to load GitHub credentials: ${error.message}`);
  }

  if (!user) {
    throw new Error("User not found");
  }

  return user.github_access_token;
}
