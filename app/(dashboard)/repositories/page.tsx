"use client";

import { Table, Label, Description } from "@heroui/react";
import { useGithubRepoStore } from "@/stores/github.repos";

export default function Page() {
  const { repos, loadingRepos, repoError } = useGithubRepoStore();

  if (loadingRepos) {
    return <div>Loading...</div>;
  }

  if (repoError) {
    return <div>Error: {repoError}</div>;
  }

  return (
    <div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Team members">
            <Table.Header>
              <Table.Column>Name</Table.Column>
              <Table.Column>Last Update</Table.Column>
              <Table.Column>Language</Table.Column>
              <Table.Column>Visibility</Table.Column>
            </Table.Header>
            <Table.Body>
              {repos.map((repo) => (
                <Table.Row key={repo.id}>
                  <Table.Cell>
                    <div>
                      <Label>{repo.name}</Label>
                      <Description className={"line-clamp-2 w-md"}>{repo.description}</Description>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{repo.updated_at}</Table.Cell>
                  <Table.Cell>{repo.language}</Table.Cell>
                  <Table.Cell>{repo.visibility}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
