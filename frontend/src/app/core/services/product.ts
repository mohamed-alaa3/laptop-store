import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { Product, ProductQuery, SearchQuery } from '../models/product.model';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '../models/api-response.model';

interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: ProductState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  private readonly _state = signal<ProductState>(initialState);

  readonly products = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly pagination = computed(() => ({
    total: this._state().total,
    page: this._state().page,
    limit: this._state().limit,
    totalPages: this._state().totalPages,
  }));

  async loadProducts(query: ProductQuery = {}): Promise<void> {
    this._state.update((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>(
          '/products',
          query as Record<string, string | number | boolean>,
        ),
      );

      this._state.update((s) => ({
        ...s,
        items: response.data,
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages,
        loading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load products';
      this._state.update((s) => ({
        ...s,
        loading: false,
        error: message,
      }));
    }
  }

  async loadFeatured(limit = 8): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>('/products', {
          featured: true,
          limit,
          sort: 'newest',
        }),
      );
      return response.data;
    } catch {
      return [];
    }
  }

  async loadNewArrivals(limit = 8): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>('/products', {
          newArrival: true,
          limit,
          sort: 'newest',
        }),
      );
      return response.data;
    } catch {
      return [];
    }
  }

  async loadOnSale(limit = 8): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>('/products', {
          onSale: true,
          limit,
          sort: 'newest',
        }),
      );
      return response.data;
    } catch {
      return [];
    }
  }

  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiSuccessResponse<Product>>(`/products/slug/${slug}`),
      );
      return response.data;
    } catch {
      return null;
    }
  }
  async loadByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    try {
      // Fetch all products, then filter by ids
      // (backend doesn't have a bulk-by-ids endpoint, so we use max limit)
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>('/products', {
          limit: 100,
        }),
      );

      // Preserve order of ids
      const productMap = new Map(response.data.map((p) => [p._id, p]));
      return ids.map((id) => productMap.get(id)).filter((p): p is Product => p !== undefined);
    } catch {
      return [];
    }
  }
  async search(query: SearchQuery): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>(
          '/search',
          query as unknown as Record<string, string | number | boolean>,
        ),
      );
      return response.data;
    } catch {
      return [];
    }
  }

  async loadRelated(categoryId: string, excludeProductId: string, limit = 4): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiPaginatedResponse<Product>>('/products', {
          category: categoryId,
          limit: limit + 1,
        }),
      );
      return response.data.filter((p) => p._id !== excludeProductId).slice(0, limit);
    } catch {
      return [];
    }
  }
}
