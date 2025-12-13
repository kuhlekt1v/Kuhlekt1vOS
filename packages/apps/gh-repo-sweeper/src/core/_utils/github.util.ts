import { Octokit } from "octokit";
import type { Repo } from "../models/repo";
import demoRepos from "../../demo/demo-repos.json";
function getGithubClient(): Octokit {
  const githubPat = sessionStorage.getItem("github_pat");
  const githubOwner = sessionStorage.getItem("github_owner_login");
  if (!githubPat || !githubOwner) {
    throw Error("You must authenticate first using 'auth [PAT]'.");
  }

  return new Octokit({ auth: githubPat });
}

export async function getRepos() {
  if (demoMode()) return demoRepos;

  const octokit = getGithubClient();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    _: Date.now(),
  });

  if (!data.length) throw Error("No repositories found");

  let repos: Repo[] = data
    .filter(
      (repo) =>
        repo.owner?.login === sessionStorage.getItem("github_owner_login")
    )
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      private: repo.private,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    }));

  return repos;
}

export async function deleteRepos(toDelete: Repo[]): Promise<string> {
  if (demoMode()) {
    // Remove repos from the demoRepos array in memory.
    for (const repo of toDelete) {
      const idx = demoRepos.findIndex(
        (r) => r.id === repo.id || r.name === repo.name
      );
      if (idx !== -1) demoRepos.splice(idx, 1);
    }
    return `${toDelete.length} repositories deleted (demo mode).`;
  }

  const octokit = getGithubClient();
  const githubOwner = sessionStorage.getItem("github_owner_login");
  if (!githubOwner) {
    throw new Error("GitHub owner not set. Please authenticate first.");
  }

  for (const repo of toDelete) {
    await octokit.rest.repos.delete({
      owner: githubOwner,
      repo: repo.name,
    });
  }
  return `${toDelete.length} repositories deleted.`;
}

function demoMode(): boolean {
  return sessionStorage.getItem("demo_mode") === "true";
}
