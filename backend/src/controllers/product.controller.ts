import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
} from "../utils/ApiResponse";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../schemas/product.schema";

export const productController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await productService.list(query);

      sendPaginated(res, result.items, result.pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const product = await productService.getById(req.params.id);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const product = await productService.getBySlug(req.params.slug);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createProductSchema.parse(req.body);
      const product = await productService.create(input);
      sendCreated(res, product, "Product created successfully");
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = updateProductSchema.parse(req.body);
      const product = await productService.update(req.params.id, input);
      sendSuccess(res, product, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.remove(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
};
