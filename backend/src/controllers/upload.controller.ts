import type { Request, Response, NextFunction } from "express";
import { cloudinaryService } from "../services/cloudinary.service";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";

export const uploadController = {
  async uploadImages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        throw ApiError.badRequest(
          'No images provided. Use field name "images".',
        );
      }

      const uploaded = await cloudinaryService.uploadMany(
        files.map((f) => ({
          buffer: f.buffer,
          originalname: f.originalname,
        })),
      );

      sendSuccess(
        res,
        {
          images: uploaded.map((img, index) => ({
            url: img.url,
            publicId: img.publicId,
            isMain: index === 0, // first image is main by default
          })),
        },
        `${uploaded.length} image(s) uploaded successfully`,
        201,
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const publicId = req.query["publicId"] as string | undefined;

      if (!publicId) {
        throw ApiError.badRequest('Query parameter "publicId" is required');
      }

      await cloudinaryService.deleteImage(publicId);

      sendSuccess(res, { publicId }, "Image deleted");
    } catch (error) {
      next(error);
    }
  },
};
