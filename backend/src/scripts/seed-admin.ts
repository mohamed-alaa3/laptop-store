import dns from "node:dns";

// Workaround for Node.js Windows DNS resolver bug (querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import { env } from "../config/env";
import { Admin } from "../models/Admin.model";
import { logger } from "../utils/logger";

async function seedAdmin(): Promise<void> {
  try {
    // Validate required env vars
    if (!env.ADMIN_USERNAME || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      logger.error(
        "❌ Missing ADMIN_USERNAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env",
      );
      process.exit(1);
    }

    if (env.ADMIN_PASSWORD.length < 8) {
      logger.error("❌ ADMIN_PASSWORD must be at least 8 characters");
      process.exit(1);
    }

    logger.info("🔌 Connecting to MongoDB...");
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ Connected");

    const existingAdmin = await Admin.findOne({
      $or: [
        { username: env.ADMIN_USERNAME.toLowerCase() },
        { email: env.ADMIN_EMAIL.toLowerCase() },
      ],
    });

    if (existingAdmin) {
      logger.warn("⚠️  Admin already exists:");
      logger.warn(`   Username: ${existingAdmin.username}`);
      logger.warn(`   Email: ${existingAdmin.email}`);
      logger.info("ℹ️  To reset password, delete the admin manually first.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const passwordHash = await Admin.hashPassword(env.ADMIN_PASSWORD);

    const admin = await Admin.create({
      username: env.ADMIN_USERNAME.toLowerCase(),
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
    });

    logger.info("✅ Admin created successfully:");
    logger.info(`   Username: ${admin.username}`);
    logger.info(`   Email: ${admin.email}`);
    logger.info("🔐 Store these credentials safely!");

    await mongoose.disconnect();
    logger.info("👋 Done");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Failed to seed admin:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void seedAdmin();
