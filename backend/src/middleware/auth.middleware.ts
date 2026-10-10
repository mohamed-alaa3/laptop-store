import type { Request, Response, NextFunction } from "express";
import { authService, type AdminTokenPayload } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";

// Extend Express Request to include `admin`
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized("Missing Authorization header");
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw ApiError.unauthorized(
        "Invalid Authorization header format. Use: Bearer <token>",
      );
    }

    const token = parts[1];
    const payload = authService.verifyToken(token);

    req.admin = payload;

    next();
  } catch (error) {
    next(error);
  }
}
