import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

interface ErrorResponse {
  success: false;
  message: string;
  details?: unknown;
  stack?: string;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.flatten().fieldErrors;
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 5MB per image.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files. Maximum is 10 images per request.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Unexpected file field: "${err.field}". Use field name "images".`;
    } else if (err.code === "LIMIT_PART_COUNT") {
      message = "Too many parts in the request.";
    } else if (err.code === "LIMIT_FIELD_KEY") {
      message = "Field name too long.";
    } else if (err.code === "LIMIT_FIELD_VALUE") {
      message = "Field value too long.";
    } else if (err.code === "LIMIT_FIELD_COUNT") {
      message = "Too many fields in the request.";
    } else {
      message = `Upload error: ${err.message}`;
    }
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Database validation failed";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message]),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Mongo duplicate key
  const mongoErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    statusCode = 409;
    const field = Object.keys(mongoErr.keyValue)[0];
    message = `${field} already exists`;
  }

  if (statusCode >= 500) {
    logger.error("Unhandled error:", err);
  }

  const payload: ErrorResponse = { success: false, message };
  if (details) payload.details = details;
  if (env.isDev && err instanceof Error && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
