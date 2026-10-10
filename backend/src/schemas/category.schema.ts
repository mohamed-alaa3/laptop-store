import { z } from "zod";

const localizedStringSchema = z.object({
  en: z.string().trim().min(1, "English value is required"),
  ar: z.string().trim().min(1, "Arabic value is required"),
});

const specTemplateSchema = z.object({
  nameEn: z.string().trim().min(1, "English name is required"),
  nameAr: z.string().trim().min(1, "Arabic name is required"),
});

export const createCategorySchema = z.object({
  name: localizedStringSchema,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and dashes",
    )
    .optional(),
  description: localizedStringSchema.optional(),
  icon: z.string().trim().optional(),
  specificationTemplate: z.array(specTemplateSchema).default([]),
  order: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
