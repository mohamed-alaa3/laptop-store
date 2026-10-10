import { Router } from "express";
import { uploadController } from "../controllers/upload.controller";
import { uploadImages } from "../middleware/upload.middleware";
import { requireAuth } from "../middleware/auth.middleware";

export const uploadRoutes = Router();

// All upload routes require admin auth
uploadRoutes.post(
  "/images",
  requireAuth,
  uploadImages,
  uploadController.uploadImages,
);

// Use query param: DELETE /api/upload/images?publicId=computer-store/products/foo
uploadRoutes.delete("/images", requireAuth, uploadController.deleteImage);
