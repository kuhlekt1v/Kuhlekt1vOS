import { formatError } from "../_utils/terminal.utils";
import { Command, type ExecuteParams } from "../command";
import { deleteRepos, getRepos } from "../_utils/github.util";
import type { Repo } from "../models/repo";
import { ANSI } from "@prozilla-os/shared";

export const deleteCommand = new Command()
  .setName("delete")
  .setRequireArgs(true)
  .setManual({
    purpose: "Delete repositories by id or name.",
    usage:
      "delete [ids|names]\n" +
      "delete 12345 67890\n" +
      "delete repo-one repo-two",
    description:
      "Deletes one or more repositories by id or name. You must supply either a list of ids or a list of names (not both). Before deletion, you will be shown a list of repositories to be deleted and prompted to confirm. Type 'yes' to proceed. This action is irreversible.",
    options: {},
  })
  .setExecute(async function (this: Command, args = [], params) {
    const { confirmCallback } = params as ExecuteParams;
    try {
      const isIdList = args.every((a) => /^\d+$/.test(a));
      const isNameList = args.every((a) => !/^\d+$/.test(a));

      if (!(isIdList || isNameList)) {
        return formatError("Supply either all ids or all names, not a mix.");
      }

      const repos = await getRepos();

      let toDelete: Repo[] = [];
      if (isIdList) {
        toDelete = repos.filter((r: any) => args.includes(String(r.id)));
      } else {
        toDelete = repos.filter((r: any) => args.includes(r.name));
      }

      if (!toDelete.length) {
        throw Error("No matching repositories found to delete.");
      }

      if (confirmCallback) {
        confirmCallback({
          message: "Type 'yes' to confirm, 'n' or 'esc' to cancel.",
          onConfirm: async (input: string) => {
            const normalized = input.trim().toLowerCase();
            let result: string;
            if (normalized === "yes") {
              try {
                result = await deleteRepos(toDelete);
              } catch (err: any) {
                result = `Error: ${err.message}`;
              }
            } else if (normalized === "n" || normalized === "esc") {
              result = "Delete cancelled.";
            } else {
              result = `${ANSI.fg.red}Invalid input. Type 'yes', 'n', or 'esc'.${ANSI.reset}`;
            }
            params!.promptOutput?.(result);
          },
        });
        return { blank: true };
      }
    } catch (error: any) {
      return formatError(error);
    }
  });
