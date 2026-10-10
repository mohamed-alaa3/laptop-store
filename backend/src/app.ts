import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { routes } from "./routes";

export function createApp(): Application {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );

  // Parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Logging
  if (env.isDev) {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Routes
  app.use("/api", routes);

  // 404 + errors (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
