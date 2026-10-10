import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../../../../core/services/admin-product';
import { CategoryService } from '../../../../core/services/category';
import { LanguageService } from '../../../../core/services/language';
import { ToastService } from '../../../../core/services/toast';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { Badge } from '../../../../shared/components/badge/badge';
import { Button } from '../../../../shared/components/button/button';
import type { Product } from '../../../../core/models/product.model';
import type { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-admin-products-list',
  imports: [RouterLink, FormsModule, Skeleton, Badge, Button],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class AdminProductsList implements OnInit {
  private readonly productService = inject(AdminProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  readonly language = inject(LanguageService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly pagination = signal({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  readonly searchQuery = signal('');
  readonly selectedCategory = signal<string>('');
  readonly selectedCondition = signal<string>('');

  readonly deleteConfirmId = signal<string | null>(null);
  readonly deleting = signal(false);

  readonly categories = this.categoryService.categories;

  readonly hasResults = computed(() => this.products().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.products().length === 0);

  async ngOnInit(): Promise<void> {
    void this.categoryService.loadAll();
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);

    try {
      const query: Record<string, string | number | boolean> = {
        limit: this.pagination().limit,
        page: this.pagination().page,
        sort: 'newest',
      };

      const search = this.searchQuery().trim();
      if (search) query['search'] = search;

      const cat = this.selectedCategory();
      if (cat) query['category'] = cat;

      const cond = this.selectedCondition();
      if (cond) query['condition'] = cond;

      const result = await this.productService.list(query);
      this.products.set(result.items);
      this.pagination.set(result.pagination);
    } catch (err) {
      this.toast.error(
        this.language.language() === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products',
      );
    } finally {
      this.loading.set(false);
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  applyFilters(): void {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    void this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedCondition.set('');
    this.applyFilters();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.applyFilters();
  }

  onConditionChange(value: string): void {
    this.selectedCondition.set(value);
    this.applyFilters();
  }

  getProductName(product: Product): string {
    return this.language.language() === 'ar' ? product.name.ar : product.name.en;
  }

  getCategoryName(categoryId: string): string {
    const cat = this.categories().find((c: Category) => c._id === categoryId);
    if (!cat) return '—';
    return this.language.language() === 'ar' ? cat.name.ar : cat.name.en;
  }

  requestDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.deleteConfirmId();
    if (!id) return;

    this.deleting.set(true);
    try {
      await this.productService.delete(id);
      this.toast.success(this.language.language() === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      this.deleteConfirmId.set(null);
      await this.loadProducts();
    } catch {
      this.toast.error(
        this.language.language() === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product',
      );
    } finally {
      this.deleting.set(false);
    }
  }
}
