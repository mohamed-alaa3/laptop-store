import { Types } from "mongoose";
import { Product, type ProductLean } from "../models/Product.model";
import { Category } from "../models/Category.model";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../schemas/product.schema";
import { cloudinaryService } from "./cloudinary.service";
export interface PaginatedProducts {
  items: ProductLean[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productService = {
  async list(query: ProductQueryInput): Promise<PaginatedProducts> {
    const filter: Record<string, unknown> = {};

    if (query.category) {
      filter["category"] = new Types.ObjectId(query.category);
    }
    if (query.brand) {
      filter["brand"] = { $regex: new RegExp(query.brand, "i") };
    }
    if (query.condition) {
      filter["condition"] = query.condition;
    }
    if (query.featured !== undefined) {
      filter["featured"] = query.featured;
    }
    if (query.newArrival !== undefined) {
      filter["newArrival"] = query.newArrival;
    }
    if (query.onSale) {
      filter["$expr"] = { $gt: ["$oldPrice", "$price"] };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice !== undefined) priceFilter["$gte"] = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter["$lte"] = query.maxPrice;
      filter["price"] = priceFilter;
    }
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter["$or"] = [
        { "name.en": searchRegex },
        { "name.ar": searchRegex },
        { brand: searchRegex },
        { tags: searchRegex },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "name-asc": { "name.en": 1 },
      "name-desc": { "name.en": -1 },
    };

    const sort = sortMap[query.sort] ?? { createdAt: -1 };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean<ProductLean[]>(),
      Product.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getById(id: string): Promise<ProductLean> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid product ID");
    }

    const product = await Product.findById(id).lean<ProductLean>();

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    return product;
  },

  async getBySlug(slug: string): Promise<ProductLean> {
    const product = await Product.findOne({ slug }).lean<ProductLean>();

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    return product;
  },

  async create(input: CreateProductInput): Promise<ProductLean> {
    // Validate category exists
    const category = await Category.findById(input.category);
    if (!category) {
      throw ApiError.badRequest("Category does not exist");
    }

    const slug = input.slug ?? slugify(input.name.en);

    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      throw ApiError.conflict(`Product with slug "${slug}" already exists`);
    }

    // Validate giftProduct if offer is free-gift
    if (input.offer?.type === "free-gift" && input.offer.giftProduct) {
      const giftExists = await Product.findById(input.offer.giftProduct);
      if (!giftExists) {
        throw ApiError.badRequest("Gift product does not exist");
      }
    }

    const product = await Product.create({
      ...input,
      slug,
      category: new Types.ObjectId(input.category),
      offer: input.offer
        ? {
            ...input.offer,
            giftProduct: input.offer.giftProduct
              ? new Types.ObjectId(input.offer.giftProduct)
              : undefined,
          }
        : undefined,
    });

    return product.toObject() as unknown as ProductLean;
  },

  async update(id: string, input: UpdateProductInput): Promise<ProductLean> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid product ID");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    // Validate category if being changed
    if (input.category) {
      const category = await Category.findById(input.category);
      if (!category) {
        throw ApiError.badRequest("Category does not exist");
      }
      product.category = new Types.ObjectId(input.category);
    }

    // Slug handling
    if (input.slug && input.slug !== product.slug) {
      const existing = await Product.findOne({ slug: input.slug });
      if (existing) {
        throw ApiError.conflict(
          `Product with slug "${input.slug}" already exists`,
        );
      }
      product.slug = input.slug;
    } else if (input.name?.en && !input.slug) {
      const newSlug = slugify(input.name.en);
      if (newSlug !== product.slug) {
        const existing = await Product.findOne({ slug: newSlug });
        if (existing) {
          throw ApiError.conflict(
            `Product with slug "${newSlug}" already exists`,
          );
        }
        product.slug = newSlug;
      }
    }

    // Apply other fields
    if (input.name) product.name = input.name;
    if (input.brand) product.brand = input.brand;
    if (input.condition) product.condition = input.condition;
    if (input.price !== undefined) product.price = input.price;
    if (input.oldPrice !== undefined) product.oldPrice = input.oldPrice;
    if (input.stock !== undefined) product.stock = input.stock;
    if (input.description) product.description = input.description;
        if (input.images) {
          // Find images that were removed
          const oldPublicIds = new Set(
            product.images.map((img) => img.publicId),
          );
          const newPublicIds = new Set(input.images.map((img) => img.publicId));
          const removedIds = [...oldPublicIds].filter(
            (id) => !newPublicIds.has(id),
          );

          if (removedIds.length > 0) {
            await cloudinaryService.deleteMany(removedIds);
          }

          product.images = input.images;
        }
    if (input.specifications) product.specifications = input.specifications;
    if (input.featured !== undefined) product.featured = input.featured;
    if (input.newArrival !== undefined) product.newArrival = input.newArrival;
    if (input.tags) product.tags = input.tags;

    if (input.offer !== undefined) {
      if (input.offer === null) {
        product.offer = undefined;
      } else {
        product.offer = {
          ...input.offer,
          giftProduct: input.offer.giftProduct
            ? new Types.ObjectId(input.offer.giftProduct)
            : undefined,
        };
      }
    }

    await product.save();
    return product.toObject() as unknown as ProductLean;
  },

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid product ID");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    // Delete images from Cloudinary (fails silently if any fail)
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map((img) => img.publicId);
      await cloudinaryService.deleteMany(publicIds);
    }

    await product.deleteOne();
  },
};
