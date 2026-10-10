import { Router } from "express";
import { searchController } from "../controllers/search.controller";

export const searchRoutes = Router();

// Public route — no auth required
searchRoutes.get("/", searchController.search);
