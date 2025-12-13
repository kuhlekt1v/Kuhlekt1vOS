import { Octokit } from "octokit";
import { formatError } from "../_utils/terminal.utils";
import { Command } from "../command";
import { ANSI } from "@prozilla-os/shared";

export const auth = new Command()
  .setRequireArgs(true)
  .setManual({
    purpose: "Authenticate to GitHub API using a Personal Access Token.",
    usage: "auth [PAT]",
    description:
      "Authenticates your session against the GitHub API. You can\nuse 'demo' as a PAT to run in demonstration mode with a mock\nrepository. Authentication is required before performing any\nother actions.",
  })
  .setExecute(async (args) => {
    if (!args || args.length === 0) return formatError("PAT required.");
    const pat = args[0];

    try {
      if (pat.toLowerCase() === "demo") {
        sessionStorage.setItem("demo_mode", "true");
        sessionStorage.setItem("github_pat", "demo");
        sessionStorage.setItem("github_owner_login", "demo-user"); // or any demo owner
        return `${ANSI.fg.green}Demo mode enabled. All commands will use demo data.${ANSI.reset}`;
      } else {
        const octokit = new Octokit({ auth: pat });
        const {
          data: { login },
        } = await octokit.rest.users.getAuthenticated();
        sessionStorage.setItem("demo_mode", "false");
        sessionStorage.setItem("github_owner_login", login);
        sessionStorage.setItem("github_pat", pat);

        return `${ANSI.fg.green}Succesfully authenticated as ${login}!`;
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || String(error);

      return formatError("Authentication failed: " + msg);
    }
  });
