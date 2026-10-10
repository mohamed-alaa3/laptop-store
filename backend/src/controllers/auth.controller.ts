import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/ApiResponse";
import { loginSchema } from "../schemas/auth.schema";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = loginSchema.parse(req.body);

      const result = await authService.login(username, password);

      sendSuccess(res, result, "Logged in successfully");
    } catch (error) {
      next(error);
    }
  },
};
