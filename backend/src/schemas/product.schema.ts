import { z } from "zod";

const localizedStringSchema = z.object({
  en: z.string().trim().min(1, "English value is required"),
  ar: z.string().trim().min(1, "Arabic value is required"),
});

const specificationSchema = z.object({
  name: localizedStringSchema,
  value: localizedStringSchema,
});

const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  publicId: z.string().trim().min(1, "Public ID is required"),
  isMain: z.boolean().default(false),
});

const offerSchema = z
  .object({
    isActive: z.boolean().default(false),
    type: z.enum(["discount", "free-gift"]),
    discountType: z.enum(["percentage", "fixed"]).optional(),
    discountValue: z.number().min(0).optional(),
    giftProduct: z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Invalid product ID")
      .optional(),
    giftQuantity: z.number().int().min(1).optional(),
    message: localizedStringSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "discount") {
        return (
          data.discountType !== undefined && data.discountValue !== undefined
        );
      }
      return true;
    },
    {
      message: "Discount type and value are required for discount offers",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "free-gift") {
        return (
          data.giftProduct !== undefined && data.giftQuantity !== undefined
        );
      }
      return true;
    },
    {
      message: "Gift product and quantity are required for free-gift offers",
      path: ["giftProduct"],
    },
  );

export const createProductSchema = z.object({
  name: localizedStringSchema,
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and dashes",
    )
    .optional(),
  brand: z.string().trim().min(1, "Brand is required"),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
  condition: z.enum(["new", "imported"]),
  price: z.number().min(0, "Price cannot be negative"),
  oldPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  description: localizedStringSchema,
  images: z.array(productImageSchema).default([]),
  specifications: z.array(specificationSchema).default([]),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  offer: offerSchema.optional(),
  tags: z.array(z.string().trim()).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  brand: z.string().trim().optional(),
  condition: z.enum(["new", "imported"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
  newArrival: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "price-asc",
      "price-desc",
      "name-asc",
      "name-desc",
    ])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  category: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid category ID")
    .optional(),
  condition: z.enum(["new", "imported"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(["relevance", "newest", "price-asc", "price-desc"])
    .default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type SpecificationInput = z.infer<typeof specificationSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
