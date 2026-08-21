"use client";

import { Table, Label, Description, Card, Chip, Separator } from "@heroui/react";
import { GitCommit, Lock, LockOpen } from "@mynaui/icons-react";
import { useGithubRepoStore } from "@/stores/github.repos";
import { redirect } from "next/navigation";

export default function Page() {
  const { repos, loadingRepos, repoError } = useGithubRepoStore();

  if (loadingRepos) {
    return <div>Loading...</div>;
  }

  if (repoError) {
    redirect("/");
  }

  return (
    <div>
      <div>
        <p classNam={"text-4xl font-semibold"}>Repositories</p>
        <p className="text-base">Desc</p>
      </div>
      <div className={"grid grid-cols-4 gap-2"}>
        {repos.length > 0 &&
          repos.map((itm, idx) => (
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
                  <Chip color={"accent"} variant={"soft"} size={"sm"}>
                    {itm.language}
                  </Chip>
                  <Separator orientation={"vertical"} />
                  <Chip color={"accent"} variant={"secondary"} size={"sm"}>
                    <GitCommit size={15} />{" "}
                    <Chip.Label>{itm.commit_count}</Chip.Label>
                  </Chip>
                </div>
              </Card.Footer>
            </Card>
          ))}
      </div>
    </div>
  );
}
