import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const categoryRoutes = Router();

// Public routes
categoryRoutes.get("/", categoryController.list);
categoryRoutes.get("/slug/:slug", categoryController.getBySlug);
categoryRoutes.get("/:id", categoryController.getById);

// Protected routes (admin only)
categoryRoutes.post("/", requireAuth, categoryController.create);
categoryRoutes.put("/:id", requireAuth, categoryController.update);
categoryRoutes.delete("/:id", requireAuth, categoryController.remove);
