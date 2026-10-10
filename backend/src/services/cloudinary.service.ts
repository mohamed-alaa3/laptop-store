import { cloudinary, isCloudinaryReady } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export interface UploadedImage {
  url: string;
  publicId: string;
}

const FOLDER = "computer-store/products";

export const cloudinaryService = {
  /**
   * Upload a single image buffer to Cloudinary.
   */
  async uploadImage(
    buffer: Buffer,
    originalName?: string,
  ): Promise<UploadedImage> {
    if (!isCloudinaryReady()) {
      throw ApiError.internal("Cloudinary is not configured");
    }

    return new Promise<UploadedImage>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: FOLDER,
          resource_type: "image",
          // Auto-optimize: convert to WebP/AVIF when supported
          transformation: [{ quality: "auto:good", fetch_format: "auto" }],
          // Use original name as a hint (Cloudinary adds a random suffix)
          public_id: originalName ? sanitizePublicId(originalName) : undefined,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            logger.error("Cloudinary upload failed:", error);
            reject(
              ApiError.internal(
                error?.message ?? "Image upload failed. Please try again.",
              ),
            );
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Upload multiple images in parallel, preserving order.
   */
  async uploadMany(
    files: Array<{ buffer: Buffer; originalname: string }>,
  ): Promise<UploadedImage[]> {
    return Promise.all(
      files.map((file) => this.uploadImage(file.buffer, file.originalname)),
    );
  },

  /**
   * Delete a single image by its public ID.
   * Fails silently (logs warning) if the image doesn't exist.
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!isCloudinaryReady()) {
      logger.warn(`⚠️  Skipping Cloudinary delete for: ${publicId}`);
      return;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });

      if (result.result === "not found") {
        logger.warn(`⚠️  Image not found in Cloudinary: ${publicId}`);
      } else {
        logger.info(`🗑️  Deleted from Cloudinary: ${publicId}`);
      }
    } catch (error) {
      // Don't throw — Cloudinary deletion failure shouldn't break the app
      logger.error(`Failed to delete Cloudinary image ${publicId}:`, error);
    }
  },

  /**
   * Delete multiple images in parallel.
   */
  async deleteMany(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;
    await Promise.all(publicIds.map((id) => this.deleteImage(id)));
  },
};

/**
 * Convert a filename to a Cloudinary-safe public_id.
 */
function sanitizePublicId(name: string): string {
  return name
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[^a-zA-Z0-9-_]/g, "-") // keep safe chars
    .replace(/-+/g, "-")
    .substring(0, 80); // limit length
}
