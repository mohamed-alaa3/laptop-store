type LogLevel = "info" | "warn" | "error" | "debug";

const colors: Record<LogLevel, string> = {
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[35m", // magenta
};

const reset = "\x1b[0m";

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, ...args: unknown[]): void {
  const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`;
  const time = `\x1b[90m${formatTimestamp()}\x1b[0m`;
  // eslint-disable-next-line no-console
  console.log(`${time} ${prefix}`, ...args);
}

export const logger = {
  info: (...args: unknown[]) => log("info", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  error: (...args: unknown[]) => log("error", ...args),
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      log("debug", ...args);
    }
  },
};
