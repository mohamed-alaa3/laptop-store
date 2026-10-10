import { Types, type SortOrder } from "mongoose";
import { Product, type ProductLean } from "../models/Product.model";
import type { SearchQueryInput } from "../schemas/product.schema";

export interface SearchResult {
  items: ProductLean[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  source: "mongodb";
}

export const mongodbSearchService = {
  async search(query: SearchQueryInput): Promise<SearchResult> {
    const baseFilter: Record<string, unknown> = {};

    if (query.category) {
      baseFilter["category"] = new Types.ObjectId(query.category);
    }
    if (query.condition) {
      baseFilter["condition"] = query.condition;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice !== undefined) priceFilter["$gte"] = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter["$lte"] = query.maxPrice;
      baseFilter["price"] = priceFilter;
    }

    // Strategy 1: Try MongoDB full-text search (uses the text index)
    let items: ProductLean[] = [];
    let total = 0;

    try {
      const textFilter = {
        ...baseFilter,
        $text: { $search: query.q },
      };

      const sortMap = buildSortMap(query.sort, true);
      const skip = (query.page - 1) * query.limit;

      const [textItems, textCount] = await Promise.all([
        Product.find(textFilter, { score: { $meta: "textScore" } })
          .sort(sortMap)
          .skip(skip)
          .limit(query.limit)
          .lean<ProductLean[]>(),
        Product.countDocuments(textFilter),
      ]);

      items = textItems;
      total = textCount;
    } catch (error) {
      // Text search can fail if the text index doesn't exist yet
      // Fall through to regex search
      console.warn("MongoDB text search failed, falling back to regex:", error);
    }

    // Strategy 2: If text search returned nothing, try regex fallback
    if (items.length === 0) {
      const regex = new RegExp(escapeRegex(query.q), "i");

      const regexFilter = {
        ...baseFilter,
        $or: [
          { "name.en": regex },
          { "name.ar": regex },
          { brand: regex },
          { "description.en": regex },
          { "description.ar": regex },
          { tags: regex },
          { "specifications.name.en": regex },
          { "specifications.name.ar": regex },
          { "specifications.value.en": regex },
          { "specifications.value.ar": regex },
        ],
      };

      const sortMap = buildSortMap(query.sort, false);
      const skip = (query.page - 1) * query.limit;

      const [regexItems, regexCount] = await Promise.all([
        Product.find(regexFilter)
          .sort(sortMap)
          .skip(skip)
          .limit(query.limit)
          .lean<ProductLean[]>(),
        Product.countDocuments(regexFilter),
      ]);

      items = regexItems;
      total = regexCount;
    }

    return {
      items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
      source: "mongodb",
    };
  },
};

/**
 * Build a Mongoose sort object.
 * If useTextScore is true, sorts by relevance first.
 */
function buildSortMap(
  sort: SearchQueryInput["sort"],
  useTextScore: boolean,
): Record<string, SortOrder> {
  if (sort === "relevance" && useTextScore) {
    // Mongoose accepts `{ $meta: 'textScore' }` for sorting by relevance
    return { score: { $meta: "textScore" } as unknown as SortOrder };
  }

  switch (sort) {
    case "newest":
      return { createdAt: -1 };
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    default:
      return { createdAt: -1 };
  }
}

/**
 * Escape special regex characters in user input.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
