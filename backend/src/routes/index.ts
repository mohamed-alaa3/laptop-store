import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { categoryRoutes } from "./category.routes";
import { productRoutes } from "./product.routes";
import { uploadRoutes } from "./upload.routes";
import { searchRoutes } from "./search.routes";

export const routes = Router();

// Health check
routes.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    },
  });
});

// Admin auth
routes.use("/admin", authRoutes);

// Categories
routes.use("/categories", categoryRoutes);

// Products
routes.use("/products", productRoutes);

// Upload
routes.use("/upload", uploadRoutes);

// Search
routes.use("/search", searchRoutes);
