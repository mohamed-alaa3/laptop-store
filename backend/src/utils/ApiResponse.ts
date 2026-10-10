import type { Response } from "express";

interface SuccessPayload<T> {
  success: true;
  data: T;
  message?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedPayload<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response {
  const payload: SuccessPayload<T> = { success: true, data };
  if (message) payload.message = message;
  return res.status(statusCode).json(payload);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  statusCode = 200,
): Response {
  const payload: PaginatedPayload<T> = { success: true, data, pagination };
  return res.status(statusCode).json(payload);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = "Created successfully",
): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
