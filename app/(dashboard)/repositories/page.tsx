"use client";

import { Table, Label, Description, Card, Chip, Separator, Input } from "@heroui/react";
import { GitCommit, Lock, LockOpen } from "@mynaui/icons-react";
import { useGithubRepoStore } from "@/stores/github.repos";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const { repos, loadingRepos, repoError } = useGithubRepoStore();

  if (loadingRepos) {
    return <div>Loading...</div>;
  }

  if (repoError) {
    redirect("/");
  }

  return (
    <div className={"pt-6 flex flex-col gap-3"}>
      <div>
        <p className={"text-2xl font-semibold"}>Repositories</p>
        <Input type={"text"} />
      </div>
      <div className={"grid grid-cols-4 gap-2"}>
        {repos.length > 0 &&
          repos.map((itm, idx) => (
            <Link
              key={`${itm.id}-${idx + 1}`}
              href={`/repositories/${itm.key}`}
            >
              <Card className={"hover-ring"}>
                <Card.Header>
                  <Card.Title>{itm.title}</Card.Title>
                  <Card.Description className={"line-clamp-1"}>
                    {itm.description ?? "--"}
                  </Card.Description>
                </Card.Header>
                <Card.Footer>
                  <div className={"flex items-center gap-2"}>
                    {itm.visibility == "PUBLIC" ? <LockOpen size={16} /> : <Lock size={16} />}
                    {
                      itm.language && (
                        <Chip color={"accent"} variant={"soft"} size={"sm"}>
                          {itm.language}
                        </Chip>
                      )
                    }
                    <Separator orientation={"vertical"} />
                    <Chip color={"accent"} variant={"secondary"} size={"sm"}>
                      <GitCommit size={15} />{" "}
                      <Chip.Label>{itm.commit_count}</Chip.Label>
                    </Chip>
                  </div>
                </Card.Footer>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
