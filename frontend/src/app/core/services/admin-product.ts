import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { Product, ProductQuery } from '../models/product.model';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly api = inject(ApiService);

  async list(query: ProductQuery = {}): Promise<{
    items: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await firstValueFrom(
      this.api.get<ApiPaginatedResponse<Product>>(
        '/products',
        query as Record<string, string | number | boolean>,
      ),
    );
    return {
      items: response.data,
      pagination: response.pagination,
    };
  }

  async getById(id: string): Promise<Product> {
    const response = await firstValueFrom(
      this.api.get<ApiSuccessResponse<Product>>(`/products/${id}`),
    );
    return response.data;
  }

  async create(payload: Record<string, unknown>): Promise<Product> {
    const response = await firstValueFrom(
      this.api.post<ApiSuccessResponse<Product>>('/products', payload),
    );
    return response.data;
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Product> {
    const response = await firstValueFrom(
      this.api.put<ApiSuccessResponse<Product>>(`/products/${id}`, payload),
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete<void>(`/products/${id}`));
  }
}
