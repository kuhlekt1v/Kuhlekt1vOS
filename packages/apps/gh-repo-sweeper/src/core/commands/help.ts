import { ANSI } from "@prozilla-os/shared";
import { formatError } from "../_utils/terminal.utils";
import { Command } from "../command";
import { CommandsManager } from "../commands";

export const help = new Command()
  .setRequireArgs(false)
  .setManual({
    purpose: "Show available commands and their descriptions.",
    usage: "help [command]",
    description:
      "Displays a list of all available commands.\nFor a specific command, shows its manual including purpose, usage, and options.\nUse help [command] to view details about a particular command.",
  })
  .setExecute(function (this: Command, args) {
    if (args?.length === 0) {
      return CommandsManager.COMMANDS.map((command) => {
        if (command.manual?.purpose) {
          return `${command.name} - ${ANSI.fg.green}${ANSI.decoration.dim}${command.manual.purpose}${ANSI.reset}`;
        } else {
          return command.name;
        }
      })
        .sort()
        .join("\n");
    }

    const commandName = (args as string[])[0].toLowerCase();
    const command = CommandsManager.find(commandName);

    if (!command) return formatError(`${commandName}: Command not found`);

    if (!command.manual?.purpose)
      return formatError(`${commandName}: No manual found`);

    return command.manual.purpose;
  });
