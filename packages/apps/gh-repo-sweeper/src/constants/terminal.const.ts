import { ANSI } from "@prozilla-os/shared";

export const USERNAME = "user";
export const HOSTNAME = "kuhlekt1v-os";
export const MAX_WIDTH = 50;

export const WELCOME_MESSAGE =
  `${ANSI.fg.cyan}=== GitHub Repo Sweeper ===${ANSI.reset}\n` +
  `\n${ANSI.decoration.dim}A lightweight utility for cleaning up your GitHub repositories.\n${ANSI.decoration.dim}You can list repositories, search by name, and optionally\n${ANSI.decoration.dim}delete repos you no longer need.${ANSI.reset}\n\n${ANSI.fg.cyan}${ANSI.decoration.dim}Type 'help' for a list of all commands.${ANSI.reset}\n`;
