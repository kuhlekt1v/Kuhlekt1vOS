import { Command, type ExecuteParams } from "../command";
import {
  formatDate,
  formatError,
  formatTable,
  parseIsoDate,
} from "../_utils/terminal.utils";
import { ANSI } from "@prozilla-os/shared";
import { getRepos } from "../_utils/github.util";
import type { Repo } from "../models/repo";

export const list = new Command()
  .setManual({
    purpose: "List repositories available to authenticated user.",
    description:
      "Displays a list of repositories or other resources associated with your GitHub account.\nRequires successful authentication using 'auth [PAT]' before use.",
    options: {
      "--private, -pr": "Show only private repositories",
      "--public, -pu": "Show only public repositories",
      "--order, -o": "Order by fields (created, updated, private)",
      "--search, -s":
        "Search by name, regex (/pattern/), or date (>YYYY-MM-DD, <YYYY-MM-DD)",
    },
    usage:
      "list [options]\n" +
      "list --private\n" +
      "list --public\n" +
      "list --order created,updated,private\n" +
      "list --search example\n" +
      "list --search /pattern/\n" +
      "list --search >2024-06-01\n" +
      "list --private --order updated,created --search repo",
    prerequisites: "auth [PAT]",
  })
  .addOption({ short: "pr", long: "private", isInput: false })
  .addOption({ short: "pu", long: "public", isInput: false })
  .addOption({ short: "o", long: "order", isInput: true })

  .addOption({ short: "s", long: "search", isInput: true })
  .setExecute(async function (this: Command, args, params) {
    const { options = [], inputs = {} } = params as ExecuteParams;
    try {
      const repos = await getRepos();

      let response = applyFilters(repos, options, this);
      response = applyOrdering(response, inputs);
      response = applySearch(response, inputs);

      return formatTable(response, {
        private: (value) => (value ? "Yes" : `${ANSI.fg.red}No${ANSI.reset}`),
        createdAt: (d) => formatDate(d),
        updatedAt: (d) => formatDate(d),
      });
    } catch (error: any) {
      return formatError(error);
    }
  });

function applyFilters(
  repos: any[],
  options: string[],
  command: Command
): any[] {
  const isPrivate = options.some((opt) => {
    const def = command.getOption(opt);
    return def && def.long === "private";
  });
  const isPublic = options.some((opt) => {
    const def = command.getOption(opt);
    return def && def.long === "public";
  });

  if (!(isPrivate && isPublic)) {
    if (isPrivate) return repos.filter((r: any) => r.private);
    if (isPublic) return repos.filter((r: any) => !r.private);
  }
  return repos;
}

function applyOrdering(repos: Repo[], inputs: Record<string, string>): Repo[] {
  let orderFields: string[] = [];
  const orderInput = inputs["o"] || inputs["order"];
  if (orderInput) {
    orderFields = orderInput.split(",").map((f: string) => f.trim());
    for (let i = orderFields.length - 1; i >= 0; i--) {
      const field = orderFields[i];
      if (field === "created") {
        repos = repos.sort(
          (a, b) => parseIsoDate(b.createdAt) - parseIsoDate(a.createdAt)
        );
      } else if (field === "updated") {
        repos = repos.sort(
          (a, b) => parseIsoDate(b.updatedAt) - parseIsoDate(a.updatedAt)
        );
      } else if (field === "private") {
        repos = repos.sort((a, b) => Number(b.private) - Number(a.private));
      }
    }
  }
  return repos;
}

function applySearch(repos: Repo[], inputs: Record<string, string>): Repo[] {
  const searchInput = inputs["s"] || inputs["search"];
  if (!searchInput) return repos;

  // Regex search by name
  if (searchInput.startsWith("/") && searchInput.endsWith("/")) {
    const pattern = searchInput.slice(1, -1);
    const regex = new RegExp(pattern, "i");
    return repos.filter((repo) => regex.test(repo.name));
  }

  // Date search: >YYYY-MM-DD or <YYYY-MM-DD
  if (searchInput.startsWith(">")) {
    const date = new Date(searchInput.slice(1));
    return repos.filter((repo) => {
      const createdAt = repo.createdAt ?? "";
      const updatedAt = repo.updatedAt ?? "";
      return new Date(createdAt) > date || new Date(updatedAt) > date;
    });
  }
  if (searchInput.startsWith("<")) {
    const date = new Date(searchInput.slice(1));
    return repos.filter((repo) => {
      const createdAt = repo.createdAt ?? "";
      const updatedAt = repo.updatedAt ?? "";
      return new Date(createdAt) < date || new Date(updatedAt) < date;
    });
  }

  // Substring search by name (case-insensitive)
  return repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchInput.toLowerCase())
  );
}
