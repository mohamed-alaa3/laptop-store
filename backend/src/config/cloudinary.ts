import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { logger } from "../utils/logger";

let isConfigured = false;

export function configureCloudinary(): void {
  if (isConfigured) return;

  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    logger.warn(
      "⚠️  Cloudinary credentials missing. Image upload will be disabled.",
    );
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  isConfigured = true;
  logger.info("✅ Cloudinary configured");
}

export function isCloudinaryReady(): boolean {
  return isConfigured;
}

export { cloudinary };
