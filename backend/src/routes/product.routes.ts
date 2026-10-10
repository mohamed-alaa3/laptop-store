import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const productRoutes = Router();

// Public routes
productRoutes.get("/", productController.list);
productRoutes.get("/slug/:slug", productController.getBySlug);
productRoutes.get("/:id", productController.getById);

// Protected routes (admin only)
productRoutes.post("/", requireAuth, productController.create);
productRoutes.put("/:id", requireAuth, productController.update);
productRoutes.delete("/:id", requireAuth, productController.remove);
