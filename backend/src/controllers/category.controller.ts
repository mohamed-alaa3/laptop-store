import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/ApiResponse";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";

export const categoryController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.list();
      sendSuccess(res, categories);
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
      const category = await categoryService.getById(req.params.id);
      sendSuccess(res, category);
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
      const category = await categoryService.getBySlug(req.params.slug);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createCategorySchema.parse(req.body);
      const category = await categoryService.create(input);
      sendCreated(res, category, "Category created successfully");
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = updateCategorySchema.parse(req.body);
      const category = await categoryService.update(req.params.id, input);
      sendSuccess(res, category, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoryService.remove(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
};
