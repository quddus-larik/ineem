import { supabase } from "@/lib/supabase/client"
export async function handleConnectGmail() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Redirect back to your app setting page or dashboard
            redirectTo: `${window.location.origin}/auth/callback/connect/gmail`,
            scopes: 'https://www.googleapis.com/auth/gmail.readonly',
            queryParams: {
                access_type: "offline",
                prompt: 'consent',       // Forces Google to show the consent screen
            },
        },
    })
}