import { supabase } from "@/lib/supabase/client";

export async function handleConnectGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback/connect/github`,
      scopes: "repo read:user notifications",
    },
  });

  if (error) {
    console.error("GitHub OAuth error:", error);
    throw error;
  }

  return data;
}
