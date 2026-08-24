"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Chip, Separator, Tabs, Button } from "@heroui/react";
import { TextHeader } from "@/components/custom/heading.minor";
import { getRepoDetails, type GithubRepoDetails } from "@/lib/github/utils";
import { startChatSession } from "@/handlers/assistant";
import { useState } from "react";
import { Star, GitBranch, GitCommit } from "@mynaui/icons-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const params = useParams();
  const user = decodeURIComponent(params.user as string);
  const repo = decodeURIComponent(params.repo as string);

  const router = useRouter();


  const [repoDetails, setRepoDetails] = useState<GithubRepoDetails>({
    repo: {
      id: "",
      name: "",
      title: "",
      description: null,
      stars: 0,
      forks: 0,
      branches: 0,
      pullRequestsCount: 0,
      issuesCount: 0,
    },
    pullRequests: [],
    issues: [],
    fileTree: [],
  });

  useEffect(() => {

    getRepoDetails(user, repo)
      .then((details) => {
        setRepoDetails(details);
        console.log(details);
      })
      .catch((err) => {
        console.error("Failed to load repo details:", err);
      });
  }, [user, repo]);

  const handleSendReview = (repo_id: string, pr_Id?: string, issue_id?: string) => {
    startChatSession({
      message: "review the Pr Linked to Chat",
      repo: repo_id,
      pr: pr_Id,
      issue: issue_id,
      title: "New Chat Review",
      router,
    });
  };

  return (
    <div className={"flex flex-col gap-3 pt-6"}>
      <TextHeader
        title={decodeURI(repo)}
        description={repoDetails.repo?.description ?? "--"}
        label={"NextJS"}
      />
      <div className={"w-full flex items-center gap-2"}>
        <Chip><Star size={15} /> {repoDetails.repo?.stars ?? "--"}</Chip>
        <Chip><GitBranch size={15} /> {repoDetails.repo?.branches ?? "--"}</Chip>
        <Chip><GitCommit size={15} /> 213 Commits</Chip>
      </div>
      <Tabs>
        <Tabs.ListContainer className={"max-w-2xl"}>
          <Tabs.List aria-label="Options">
            <Tabs.Tab id="code">
              File Browser
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="prs">
              Pull Requests
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="issues">
              Issues
              <Tabs.Indicator />
            </Tabs.Tab>
            {/*<Tabs.Tab id="security">*/}
            {/*  Security Checks*/}
            {/*  <Tabs.Indicator />*/}
            {/*</Tabs.Tab>*/}
            {/*<Tabs.Tab id="deps">*/}
            {/*  Deps Bot*/}
            {/*  <Tabs.Indicator />*/}
            {/*</Tabs.Tab>*/}
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id={"code"}>..</Tabs.Panel>
        <Tabs.Panel id={"prs"} className={"w-full"}>
          <div className={"w-full flex flex-col gap-1 *:rounded-none"}>
            {repoDetails.pullRequests.map((pullRequest) => (
              <Card key={pullRequest.id} className={"relative"}>
                <Button size={"sm"} className={"absolute bottom-3 right-3"}
                        onPress={() => handleSendReview(repoDetails.repo.id, pullRequest.id)}>Review</Button>
                <Card.Header>
                  <Card.Title>{pullRequest.title}</Card.Title>
                  <Card.Description className={"line-clamp-1"}>
                    {pullRequest.body ?? "--"}
                  </Card.Description>
                </Card.Header>
                <Card.Footer>
                  <div className={"flex w-full gap-2"}>
                    <Chip>{pullRequest.state}</Chip>
                    <Separator orientation={"vertical"} />
                    {pullRequest?.labels?.nodes?.map((label) => (
                      <Chip
                        key={label.name}
                      >
                        {label.name}
                      </Chip>
                    ))}

                  </div>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </Tabs.Panel>
        <Tabs.Panel id={"issues"} className={"w-full"}>
          <div className={"w-full flex flex-col gap-1 *:rounded-none"}>
            {repoDetails.issues.map((pullRequest) => (
              <Card key={pullRequest.id} className={"relative"}>
                <Button size={"sm"} className={"absolute bottom-3 right-3"}>Review</Button>
                <Card.Header>
                  <Card.Title>{pullRequest.title}</Card.Title>
                  <Card.Description className={"line-clamp-1"}>
                    {pullRequest.body ?? "--"}
                  </Card.Description>
                </Card.Header>
                <Card.Footer>
                  <div className={"flex w-full gap-2"}>
                    <Chip variant={"primary"}
                          color={pullRequest.state == "OPEN" ? "accent" : "default"}>{pullRequest.state}</Chip>
                    <Separator orientation={"vertical"} />
                    {pullRequest?.labels?.nodes?.map((label) => (
                      <Chip
                        key={label.name}
                      >
                        {label.name}
                      </Chip>
                    ))}

                  </div>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
