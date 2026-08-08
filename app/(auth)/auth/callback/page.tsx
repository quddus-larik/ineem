"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/sign-in");
        return;
      }

      // Check if user exists in users table
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!userData) {
        // New user - redirect to onboarding with user data
        const params = new URLSearchParams({
          email: session.user.email || "",
          first_name: session.user.user_metadata?.first_name || "",
          last_name: session.user.user_metadata?.last_name || "",
          id: session.user.id,
        });
        router.push(`/onboarding?${params.toString()}`);
      } else {
        // Existing user - redirect to dashboard
        router.push("/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Signing you in...</p>
    </div>
  );
}
