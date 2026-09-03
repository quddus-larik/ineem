"use client"

import {supabase} from "@/lib/supabase/client";
import {useEffect, useState} from "react";
import {Card, Chip} from "@heroui/react";
import {GitBranch, GitMerge, GitPullRequest, Star, Lock, LockOpen, Globe} from "@mynaui/icons-react";
import Link from "next/link"
import type {Repository} from "@/app/types";


export default function Page() {

    const [repos, setRepos] = useState<Repository[]>([]);

    useEffect(() => {
        (async () => {
            const {data: {session}} = await supabase.auth.getSession();

            const token: string | undefined = session?.provider_token ?? undefined;

            if (!token) {
                throw new Error("GitHub provider token is unavailable");
            }

            const res: Response = await fetch("/api/v1/github", {
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
        <div className={"flex flex-col gap-2 bg-background-tertiary w-full p-6"}>
            <div>
                <h1 className={"flex flex-col gap-1 text-2xl font-semibold"}>Repositories</h1>
                <p>Explore and manage the repositories connected to github.</p>
            </div>
            <div className={"grid grid-cols-4 gap-2"}>
                {
                    repos.length > 0 && repos.map((repo) => (
                        <Link href={`/repositories/${repo.owner.login}/${repo.name}?rid=${repo.node_id}`} className={"w-full h-full"}>
                            <Card key={repo.id}
                                  className={"gap-1 hover:ring-2 ring-accent ring-0 transition-all min-h-32"}>
                                <Card.Header>
                                    <Card.Title>{repo.name}</Card.Title>
                                </Card.Header>
                                <Card.Content>
                                    <Card.Description
                                        className={"line-clamp-2"}>{repo.description ?? "--"}</Card.Description>
                                </Card.Content>
                                <Card.Footer className={"flex justify-between items-center"}>
                                    <div className={"flex flex-row items-center gap-1"}>
                                        <Chip>
                                            <GitBranch size={15}/>
                                            <Chip.Label>{repo.forkCount}</Chip.Label>
                                        </Chip>
                                        <Chip>
                                            <Star size={15}/>
                                            <Chip.Label>{repo.stargazerCount}</Chip.Label>
                                        </Chip>
                                        <Chip>
                                            <GitPullRequest size={15}/>
                                            <Chip.Label>{repo.pullRequests.totalCount}</Chip.Label>
                                        </Chip>
                                    </div>
                                    {repo.isPrivate ? <Lock size={15}/> : <Globe size={15}/>}
                                </Card.Footer>
                            </Card>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}