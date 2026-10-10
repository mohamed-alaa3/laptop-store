import { Component, inject, signal, computed, effect, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../../shared/components/product-card/product-card';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { WishlistService } from '../../core/services/wishlist';
import { ProductService } from '../../core/services/product';
import { LanguageService } from '../../core/services/language';
import type { Product } from '../../core/models/product.model';
import { ProductSkeleton } from '../../shared/components/product-skeleton/product-skeleton';
@Component({
  selector: 'app-wishlist',
  imports: [ProductCard, EmptyState, ProductSkeleton],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly productService = inject(ProductService);
  readonly language = inject(LanguageService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly count = this.wishlistService.count;

  readonly isEmptyResults = computed(() => !this.loading() && this.products().length === 0);

  private initialized = false;

  constructor() {
    // Reload products whenever the wishlist IDs change.
    // Skips the very first run because ngOnInit handles initial load.
    effect(() => {
      const ids = this.wishlistService.ids();

      if (!this.initialized) {
        this.initialized = true;
        return;
      }

      void this.loadProductsForIds(ids);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    await this.loadProductsForIds(this.wishlistService.ids());
  }

  private async loadProductsForIds(ids: string[]): Promise<void> {
    // Handle empty wishlist immediately
    if (ids.length === 0) {
      this.products.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    try {
      const products = await this.productService.loadByIds(ids);
      this.products.set(products);
    } finally {
      this.loading.set(false);
    }
  }

  clearAll(): void {
    const confirmed = confirm(this.language.t('wishlist.clearConfirm'));
    if (!confirmed) return;
    this.wishlistService.clear();
    this.products.set([]);
  }
}
