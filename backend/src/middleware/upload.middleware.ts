import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { ApiError } from "../utils/ApiError";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, AVIF`,
      ),
    );
  }
};

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // max 10 images per request
  },
  fileFilter,
}).array("images", 10);
