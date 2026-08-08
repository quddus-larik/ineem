import { supabase } from "@/lib/supabase/client"; // Or use client if in component
import type { Provider } from "@supabase/supabase-js";
import { toast } from "@heroui/react";
import { redirect } from "next/navigation";

export async function SignInWithOAuth(provider: Provider = "google") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `https://collaric.vercel.app/auth/callback`, // Add to Supabase URL config
      queryParams: {
        access_type: "offline",
        prompt: "consent", // Forces fresh login for full scopes
      },
    },
  });

  if (error) {
    console.error("OAuth error:", error);
    throw error; // Handle via toast/useState
  }

  return data;
}

// Usage in component (React/Next.js)
export const handleGoogleSignIn = async () => {
  try {
    await SignInWithOAuth("google");
  } catch (error) {
    // Show error toast
  }
};

export const handleXSignIn = async () => {
  try {
    await SignInWithOAuth("x");
  } catch (error) {
    // Show error toast
  }
};

export const handleGithubSignIn = async () => {
  try {
    await SignInWithOAuth("github");
  } catch (error) {
    // Show error toast
  }
};

export const handleLogOut = async () => {
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (!error) {
      toast.success("Logged out successfully.");
      redirect("/");
    }
  } catch (error) {
    console.error("Logout failed:", error);
    toast.danger("Logout failed. Please try again.");
  }
};
