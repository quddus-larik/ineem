"use client";

import { useEffect, useState } from "react";
import { getRepos } from "@/lib/github/utils";
import { Card, Table, Label, Description } from "@heroui/react";
import { supabase } from "@/lib/supabase/client";
import { getRelativeDates } from "@/lib/utils";

export default function Page() {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        const repos = await getRepos(session?.provider_token);
        setRepositories(repos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch repositories"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
              {repositories.map((repo) => (
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
