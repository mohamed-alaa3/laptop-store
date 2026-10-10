import dns from "node:dns";

// Workaround for Node.js Windows DNS resolver bug (querySrv ECONNREFUSED)
// Forces Node to use public DNS servers instead of the broken system resolver.
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { configureCloudinary } from "./config/cloudinary";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  configureCloudinary();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📦 Environment: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.warn(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info("👋 Server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection:", reason);
    void shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    void shutdown("uncaughtException");
  });
}

void bootstrap();
