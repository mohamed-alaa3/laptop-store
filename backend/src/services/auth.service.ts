import jwt from "jsonwebtoken";
import { Admin, type IAdmin } from "../models/Admin.model";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface AdminTokenPayload {
  id: string;
  role: "admin";
}

export interface LoginResult {
  token: string;
  admin: {
    id: string;
    username: string;
    email: string;
  };
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResult> {
    const normalized = identifier.toLowerCase().trim();

    // Find admin by username OR email
    const admin = await Admin.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    }).select("+passwordHash");

    if (!admin) {
      // Same message for both cases — prevents user enumeration
      throw ApiError.unauthorized("Invalid credentials");
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const token = this.signToken(admin);

    return {
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
      },
    };
  },

  signToken(admin: IAdmin): string {
    const payload: AdminTokenPayload = {
      id: admin._id.toString(),
      role: "admin",
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },

  verifyToken(token: string): AdminTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;

      if (!decoded.id || decoded.role !== "admin") {
        throw ApiError.unauthorized("Invalid token payload");
      }

      return decoded;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized("Invalid or expired token");
    }
  },
};
