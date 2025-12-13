import { ANSI } from "@prozilla-os/shared";

export function formatError(error: string): string {
  return `${ANSI.fg.red}${error}${ANSI.reset}`;
}

export function removeAnsi(string: string): string {
  // eslint-disable-next-line no-control-regex
  return string.replace(/\u001b\[([0-9]+)m/gm, "");
}

export function padAnsi(str: string, len: number) {
  const visibleLength = removeAnsi(str).length;
  const padLength = Math.max(0, len - visibleLength);
  return str + " ".repeat(padLength);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function parseIsoDate(dateStr: string | null): number {
  return dateStr ? new Date(dateStr).getTime() : 0;
}

type Formatter<T> = {
  [K in keyof T]?: (value: T[K]) => string;
};

export function formatTable<T extends Record<string, any>>(
  rows: T[],
  formatters: Formatter<T> = {},
) {
  if (rows.length === 0) return "";

  const keys = Object.keys(rows[0]) as (keyof T)[];

  const widths: Record<keyof T, number> = {} as any;

  // Compute max width for each column
  for (const key of keys) {
    const headerLen = String(key).length;

    const values = rows.map((row) => {
      const raw = row[key];
      const formatted = formatters[key] ? formatters[key]!(raw) : String(raw);
      return removeAnsi(formatted);
    });

    widths[key] = Math.max(headerLen, ...values.map((v) => v.length));
  }

  const pad = (value: string, width: number) => padAnsi(value, width);

  // Header
  const header =
    "| " + keys.map((key) => pad(String(key), widths[key])).join(" | ") + " |";

  const divider =
    "|-" + keys.map((key) => "-".repeat(widths[key])).join("-|-") + "-|";

  // Rows
  const lines = rows.map((row) => {
    return (
      "| " +
      keys
        .map((key) => {
          const raw = row[key];
          const formatted = formatters[key]
            ? formatters[key]!(raw)
            : String(raw);
          return pad(formatted, widths[key]);
        })
        .join(" | ") +
      " |"
    );
  });

  return [header, divider, ...lines].join("\n");
}
