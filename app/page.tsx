"use client";

import {supabase} from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { handleLoginGithub } from "@/handlers/github.oauth";

export default function Page(){
    useEffect(() => {
        (async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log(session)
            const { data: { user } } = await supabase.auth.getUser();
            console.log(user)
        })()
    }, []);

    const onGithubLogin = async () => {
        try {
            await handleLoginGithub();
        } catch (error) {
            console.error("GitHub login failed:", error);
        }
    };

    return(
        <>
            Hello
            <button onClick={onGithubLogin}>Login with GitHub</button>
        </>
    )
}