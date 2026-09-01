"use client"

import {useParams} from "next/navigation";
import {supabase} from "@/lib/supabase/client";
import {useEffect, useState} from "react";
import {Card, Chip} from "@heroui/react";
import {GitBranch, GitMerge, GitPullRequest, Star, Lock, LockOpen, Globe} from "@mynaui/icons-react";


export default function Page() {
    const {owner, repo} = useParams();
    console.log(owner, repo);

    const [repos, setRepos] = useState([]);

    useEffect(() => {
        (async () => {
            const {data: {session}} = await supabase.auth.getSession();

            const token: string | undefined = session?.provider_token ?? undefined;

            if (!token) {
                throw new Error("GitHub provider token is unavailable");
            }

            const res: Response = await fetch(`/api/v1/github?owner=${owner}&repo=${repo}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`);
            }

            const data = await res.json();
            console.log(data);
            setRepos(data.repositories);
        })();
    }, []);

    return (
        <div className={"flex flex-col gap-2 bg-background-tertiary w-full p-6 min-h-svh"}>
            <div>
                <h1 className={"flex flex-col gap-1 text-2xl font-semibold"}>{repo}</h1>
                <p>description of repo</p>
            </div>
            <div className={"grid grid-cols-4 gap-2"}>

            </div>
        </div>
    )
}