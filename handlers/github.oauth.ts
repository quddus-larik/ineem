import { supabase } from "@/lib/supabase/client";

export async function handleLoginGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo user:email",
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}