import type { Request, Response, NextFunction } from "express";
import { searchService } from "../services/search.service";
import { sendPaginated } from "../utils/ApiResponse";
import { searchQuerySchema } from "../schemas/product.schema";

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = searchQuerySchema.parse(req.query);
      const result = await searchService.search(query);

      sendPaginated(res, result.items, result.pagination);
    } catch (error) {
      next(error);
    }
  },
};
