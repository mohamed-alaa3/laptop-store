import dns from "node:dns";

/**
 * Workaround for Node.js on Windows DNS resolver bug.
 *
 * Node.js on Windows uses c-ares for DNS which has a bug that causes
 * `querySrv ECONNREFUSED` when resolving `mongodb+srv://` connection strings.
 *
 * This forces Node to use public DNS servers instead of the system resolver.
 *
 * @see https://github.com/nodejs/node/issues/54381
 */
export function applyDnsFix(): void {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch {
    // Silently ignore — some environments may not allow this.
  }
}

// Apply immediately on import
applyDnsFix();
