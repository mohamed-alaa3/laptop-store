import { Component, inject, signal, type OnInit, type OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductSkeleton } from '../../shared/components/product-skeleton/product-skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProductService } from '../../core/services/product';
import { LanguageService } from '../../core/services/language';
import type { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-search',
  imports: [ProductCard, ProductSkeleton, EmptyState, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  readonly language = inject(LanguageService);

  private readonly destroy$ = new Subject<void>();

  readonly query = signal('');
  readonly results = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly hasSearched = signal(false);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const q = params['q'] ?? '';
      this.query.set(q);
      if (q.trim()) {
        void this.performSearch(q);
      } else {
        this.results.set([]);
        this.hasSearched.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async performSearch(q: string): Promise<void> {
    this.loading.set(true);
    this.hasSearched.set(true);
    try {
      const results = await this.productService.search({ q });
      this.results.set(results);
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchInput(value: string): void {
    this.query.set(value);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const q = this.query().trim();
    if (!q) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q },
    });
  }

  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.hasSearched.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
