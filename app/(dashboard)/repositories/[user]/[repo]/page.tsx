"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Chip, Separator, Tabs } from "@heroui/react";
import { TextHeader } from "@/components/custom/heading.minor";
import { getRepoDetails } from "@/lib/github/utils";
import { useState } from "react";

export default function Page() {
  const params = useParams();
  const user = decodeURIComponent(params.user as string);
  const repo = decodeURIComponent(params.repo as string);

  const [repoDetails, setRepoDetails] = useState({ pullRequests: [] });

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

  return (
    <div className={"flex flex-col gap-3 pt-6"}>
      <TextHeader
        title={decodeURI(repo)}
        description={"any  any any"}
        label={"NextJS"}
      />
      <Tabs className="w-full max-w-5xl">
        <Tabs.ListContainer>
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
            <Tabs.Tab id="security">
              Security Checks
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="deps">
              Deps Bot
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id={"code"}>..</Tabs.Panel>
        <Tabs.Panel id={"prs"} className={"w-full"}>
          <div className={"w-full flex flex-col gap-2"}>
            {repoDetails.pullRequests.map((pullRequest) => (
              <Card key={pullRequest.id} className={"hover-ring"}>
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
                        style={{ backgroundColor: `#${label.color}` }}
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
