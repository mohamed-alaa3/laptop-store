import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { Category } from '../models/category.model';
import type { ApiSuccessResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  private readonly _categories = signal<Category[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._categories().length);

  async loadAll(force = false): Promise<void> {
    if (!force && this._categories().length > 0) return;

    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.api.get<ApiSuccessResponse<Category[]>>('/categories'),
      );
      this._categories.set(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load categories';
      this._error.set(message);
    } finally {
      this._loading.set(false);
    }
  }

  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiSuccessResponse<Category>>(`/categories/slug/${slug}`),
      );
      return response.data;
    } catch {
      return null;
    }
  }
}
