"use client";

import { useEffect } from "react";
import { Description, Label, ListBox, Select } from "@heroui/react";
import { useGithubRepoStore } from "@/stores/github.repos";

export function RepoSelector({ disableIt = false }: { disableIt : boolean }) {
  const {
    repos,
    loadingRepos,
    fetchRepos,
    selectedRepoId,
    setSelectedRepo,
  } = useGithubRepoStore();

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const selectedRepo = repos.find((repo) => repo.id === selectedRepoId);

  return (
    <Select
      className="w-[256px]"
      placeholder="Select a repository"
      selectedKey={selectedRepoId}
      onSelectionChange={(key) => {
        setSelectedRepo(key == null ? null : String(key));
      }}
      isDisabled={disableIt}
    >
      <Select.Trigger>
        <Select.Value>
          {({ defaultChildren, isPlaceholder }) => {
            if (isPlaceholder || !selectedRepo) {
              return defaultChildren;
            }

            return (
              <span className="line-clamp-1">{selectedRepo.title}</span>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className={"w-[256px] h-[300px]"}>
        <ListBox>
          {repos.map((repo) => (
            <ListBox.Item key={repo.id} id={repo.id} textValue={repo.title}>
              <div className="flex flex-col">
                <Label className="line-clamp-1">{repo.title}</Label>
                <Description className="line-clamp-1">
                  {repo.description ?? ""}
                </Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
