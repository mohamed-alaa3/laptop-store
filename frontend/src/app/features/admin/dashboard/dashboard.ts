import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../core/services/product';
import { CategoryService } from '../../../core/services/category';
import { LanguageService } from '../../../core/services/language';
import { ApiService } from '../../../core/services/api.service';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import type { Product } from '../../../core/models/product.model';
import type { ApiPaginatedResponse } from '../../../core/models/api-response.model';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStock: number;
  featured: number;
  onSale: number;
}

const initialStats: DashboardStats = {
  totalProducts: 0,
  totalCategories: 0,
  lowStock: 0,
  featured: 0,
  onSale: 0,
};

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, Skeleton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly api = inject(ApiService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  readonly language = inject(LanguageService);

  readonly stats = signal<DashboardStats>(initialStats);
  readonly recentProducts = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly statCards = computed(() => {
    const s = this.stats();
    return [
      {
        key: 'totalProducts',
        value: s.totalProducts,
        labelEn: 'Total Products',
        labelAr: 'إجمالي المنتجات',
        icon: 'box',
        color: '#0066FF',
        link: '/admin/products',
      },
      {
        key: 'totalCategories',
        value: s.totalCategories,
        labelEn: 'Categories',
        labelAr: 'الفئات',
        icon: 'grid',
        color: '#7C3AED',
        link: '/admin/categories',
      },
      {
        key: 'lowStock',
        value: s.lowStock,
        labelEn: 'Low Stock',
        labelAr: 'مخزون منخفض',
        icon: 'alert',
        color: '#F59E0B',
        link: '/admin/products',
      },
      {
        key: 'featured',
        value: s.featured,
        labelEn: 'Featured',
        labelAr: 'مميزة',
        icon: 'star',
        color: '#10B981',
        link: '/admin/products',
      },
      {
        key: 'onSale',
        value: s.onSale,
        labelEn: 'On Sale',
        labelAr: 'عليها خصم',
        icon: 'tag',
        color: '#EC4899',
        link: '/admin/products',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  private async loadStats(): Promise<void> {
    this.loading.set(true);

    try {
      const [allProducts, categories, featuredRes, onSaleRes] = await Promise.all([
        firstValueFrom(this.api.get<ApiPaginatedResponse<Product>>('/products', { limit: 100 })),
        (async () => {
          await this.categoryService.loadAll();
          return this.categoryService.categories();
        })(),
        firstValueFrom(
          this.api.get<ApiPaginatedResponse<Product>>('/products', {
            limit: 1,
            featured: true,
          }),
        ),
        firstValueFrom(
          this.api.get<ApiPaginatedResponse<Product>>('/products', {
            limit: 1,
            onSale: true,
          }),
        ),
      ]);

      const lowStockCount = allProducts.data.filter((p) => p.stock > 0 && p.stock <= 3).length;

      // Recent 5 (already have, just sort by createdAt)
      const recent = [...allProducts.data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      this.stats.set({
        totalProducts: allProducts.pagination.total,
        totalCategories: categories.length,
        lowStock: lowStockCount,
        featured: featuredRes.pagination.total,
        onSale: onSaleRes.pagination.total,
      });

      this.recentProducts.set(recent);
    } finally {
      this.loading.set(false);
    }
  }

  getProductName(product: Product): string {
    return this.language.language() === 'ar' ? product.name.ar : product.name.en;
  }
}
