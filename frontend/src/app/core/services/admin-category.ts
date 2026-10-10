import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { Category } from '../models/category.model';
import type { ApiSuccessResponse } from '../models/api-response.model';

export interface CategoryPayload {
  name: { en: string; ar: string };
  slug?: string;
  description?: { en: string; ar: string };
  icon?: string;
  specificationTemplate?: Array<{ nameEn: string; nameAr: string }>;
  order?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly api = inject(ApiService);

  async list(): Promise<Category[]> {
    const response = await firstValueFrom(
      this.api.get<ApiSuccessResponse<Category[]>>('/categories'),
    );
    return response.data;
  }

  async getById(id: string): Promise<Category> {
    const response = await firstValueFrom(
      this.api.get<ApiSuccessResponse<Category>>(`/categories/${id}`),
    );
    return response.data;
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const response = await firstValueFrom(
      this.api.post<ApiSuccessResponse<Category>>('/categories', payload),
    );
    return response.data;
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    const response = await firstValueFrom(
      this.api.put<ApiSuccessResponse<Category>>(`/categories/${id}`, payload),
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete<void>(`/categories/${id}`));
  }
}
