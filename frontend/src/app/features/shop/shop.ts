import { Component, inject, signal, computed, type OnInit, type OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProductService } from '../../core/services/product';
import { CategoryService } from '../../core/services/category';
import { LanguageService } from '../../core/services/language';
import type { Product, ProductQuery, ProductSort } from '../../core/models/product.model';
import { SortDropdown } from './components/sort-dropdown/sort-dropdown';
import { FiltersSidebar } from './components/filters-sidebar/filters-sidebar';
import { Pagination } from './components/pagination/pagination';
import { ProductSkeleton } from '../../shared/components/product-skeleton/product-skeleton';
@Component({
  selector: 'app-shop',
  imports: [ProductCard, EmptyState, SortDropdown, FiltersSidebar, Pagination, ProductSkeleton],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly language = inject(LanguageService);

  private readonly destroy$ = new Subject<void>();

  // ─── State ──────────────────────────────────────────────
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pagination = signal({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  readonly isMobileFiltersOpen = signal(false);
  readonly currentQuery = signal<ProductQuery>({});

  // ─── Computed ───────────────────────────────────────────
  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.products().length === 0,
  );

  readonly activeFiltersCount = computed(() => {
    const q = this.currentQuery();
    let count = 0;
    if (q.category) count++;
    if (q.brand) count++;
    if (q.condition) count++;
    if (q.minPrice !== undefined || q.maxPrice !== undefined) count++;
    if (q.featured) count++;
    if (q.newArrival) count++;
    if (q.onSale) count++;
    return count;
  });

  readonly showingRange = computed(() => {
    const p = this.pagination();
    if (p.total === 0) return null;
    const from = (p.page - 1) * p.limit + 1;
    const to = Math.min(p.page * p.limit, p.total);
    return { from, to, total: p.total };
  });

  // ─── Lifecycle ──────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    void this.categoryService.loadAll();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const query = this.parseQueryParams(params);
      this.currentQuery.set(query);
      void this.loadProducts(query);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data loading ───────────────────────────────────────
  async loadProducts(query: ProductQuery): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.productService.loadProducts(query);
      this.products.set(this.productService.products());
      this.pagination.set(this.productService.pagination());
      this.error.set(this.productService.error());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      this.loading.set(false);
    }
  }

  // ─── Event handlers ─────────────────────────────────────
  getCurrentSort(): ProductSort {
    return this.currentQuery().sort ?? 'newest';
  }

  onSortChange(sort: ProductSort): void {
    this.updateQuery({ sort });
  }

  onFiltersChange(partial: Record<string, unknown>): void {
    this.updateQuery(partial as Partial<ProductQuery>);
    this.closeMobileFilters();
  }

  onPageChange(page: number): void {
    this.updateQuery({ page }, { preservePage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersOpen.update((v) => !v);
  }

  closeMobileFilters(): void {
    this.isMobileFiltersOpen.set(false);
  }

  clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  getPageTitle(): string {
    const q = this.currentQuery();
    if (q.search) {
      return `${this.language.t('shop.title')} · "${q.search}"`;
    }
    return this.language.t('shop.title');
  }

  // ─── URL parsing / updating ─────────────────────────────
  private parseQueryParams(params: Record<string, string>): ProductQuery {
    const query: ProductQuery = {};

    if (params['category']) query.category = params['category'];
    if (params['brand']) query.brand = params['brand'];
    if (params['condition']) {
      const cond = params['condition'];
      if (cond === 'new' || cond === 'imported') {
        query.condition = cond;
      }
    }
    if (params['minPrice']) {
      const v = Number(params['minPrice']);
      if (!isNaN(v) && v >= 0) query.minPrice = v;
    }
    if (params['maxPrice']) {
      const v = Number(params['maxPrice']);
      if (!isNaN(v) && v >= 0) query.maxPrice = v;
    }
    if (params['featured'] === 'true') query.featured = true;
    if (params['newArrival'] === 'true') query.newArrival = true;
    if (params['onSale'] === 'true') query.onSale = true;
    if (params['search']) query.search = params['search'];

    const sort = params['sort'];
    const validSorts: ProductSort[] = [
      'newest',
      'oldest',
      'price-asc',
      'price-desc',
      'name-asc',
      'name-desc',
    ];
    query.sort =
      sort && validSorts.includes(sort as ProductSort) ? (sort as ProductSort) : 'newest';

    const page = Number(params['page']);
    query.page = !isNaN(page) && page > 0 ? page : 1;
    query.limit = 12;

    return query;
  }

  private updateQuery(
    partial: Partial<ProductQuery>,
    options: { preservePage?: boolean } = {},
  ): void {
    const current = this.currentQuery();
    const page = options.preservePage ? (partial.page ?? current.page ?? 1) : (partial.page ?? 1);

    const merged = { ...current, ...partial, page };

    const queryParams: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined || value === null || value === '') continue;
      if (key === 'sort' && value === 'newest') continue;
      if (key === 'page' && value === 1) continue;
      if (key === 'limit') continue;
      queryParams[key] = value as string | number | boolean;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
    });
  }
}
