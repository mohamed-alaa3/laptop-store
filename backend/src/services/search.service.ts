import {
  mongodbSearchService,
  type SearchResult,
} from "./mongodb-search.service";
import type { SearchQueryInput } from "../schemas/product.schema";
import { logger } from "../utils/logger";

export type SearchSource = "mongodb" | "elasticsearch";

export interface UnifiedSearchResult {
  items: SearchResult["items"];
  pagination: SearchResult["pagination"];
  source: SearchSource;
}

export const searchService = {
  async search(query: SearchQueryInput): Promise<UnifiedSearchResult> {
    // Phase 6 will add Elasticsearch here.
    // For now, MongoDB is the only source.
    logger.debug(`Searching MongoDB for: "${query.q}"`);

    const result = await mongodbSearchService.search(query);

    return {
      items: result.items,
      pagination: result.pagination,
      source: "mongodb",
    };
  },
};
