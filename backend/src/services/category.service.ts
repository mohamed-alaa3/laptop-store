import { Category } from "../models/Category.model";
import { Product } from "../models/Product.model";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema";

/**
 * Shape returned by `.lean()` queries.
 * We use `Record<string, unknown>` because the exact FlattenMaps type
 * isn't exported from Mongoose in a TypeScript-friendly way.
 */
type LeanCategory = Record<string, unknown>;

export const categoryService = {
  async list(): Promise<LeanCategory[]> {
    return Category.find()
      .sort({ order: 1, createdAt: -1 })
      .lean<LeanCategory[]>();
  },

  async getById(id: string): Promise<LeanCategory> {
    const category = await Category.findById(id).lean<LeanCategory>();

    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    return category;
  },

  async getBySlug(slug: string): Promise<LeanCategory> {
    const category = await Category.findOne({ slug }).lean<LeanCategory>();

    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    return category;
  },

  async create(input: CreateCategoryInput): Promise<LeanCategory> {
    const slug = input.slug ?? slugify(input.name.en);

    const existing = await Category.findOne({ slug });
    if (existing) {
      throw ApiError.conflict(`Category with slug "${slug}" already exists`);
    }

    const category = await Category.create({
      ...input,
      slug,
    });

       return category.toObject() as unknown as LeanCategory;
  },

  async update(id: string, input: UpdateCategoryInput): Promise<LeanCategory> {
    const category = await Category.findById(id);

    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    // Slug change handling
    if (input.slug && input.slug !== category.slug) {
      const existing = await Category.findOne({ slug: input.slug });
      if (existing) {
        throw ApiError.conflict(
          `Category with slug "${input.slug}" already exists`,
        );
      }
    }

    // If name.en changed and no slug provided, regenerate slug
    if (input.name?.en && !input.slug) {
      const newSlug = slugify(input.name.en);
      if (newSlug !== category.slug) {
        const existing = await Category.findOne({ slug: newSlug });
        if (existing) {
          throw ApiError.conflict(
            `Category with slug "${newSlug}" already exists`,
          );
        }
        category.slug = newSlug;
      }
    }

    // Apply updates
    if (input.name) category.name = input.name;
    if (input.slug) category.slug = input.slug;
    if (input.description !== undefined) {
      category.description = input.description;
    }
    if (input.icon !== undefined) category.icon = input.icon;
    if (input.specificationTemplate !== undefined) {
      category.specificationTemplate = input.specificationTemplate;
    }
    if (input.order !== undefined) category.order = input.order;

    await category.save();
        return category.toObject() as unknown as LeanCategory;
  },

  async remove(id: string): Promise<void> {
    const category = await Category.findById(id);

    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    const productsCount = await Product.countDocuments({ category: id });

    if (productsCount > 0) {
      throw ApiError.conflict(
        `Cannot delete category: ${productsCount} product(s) are associated with it. ` +
          `Reassign or delete those products first.`,
      );
    }

    await category.deleteOne();
  },
};
