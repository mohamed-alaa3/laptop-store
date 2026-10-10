import { Component, inject, signal, computed, effect, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Button } from '../../shared/components/button/button';
import { PriceDisplay } from '../../shared/components/price-display/price-display';
import { CompareService } from '../../core/services/compare';
import { ProductService } from '../../core/services/product';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../core/services/toast';
import type { Product } from '../../core/models/product.model';

interface CompareRow {
  specName: string;
  values: Array<{
    productId: string;
    value: string;
    isEmpty: boolean;
  }>;
}

@Component({
  selector: 'app-compare',
  imports: [RouterLink, Skeleton, EmptyState, Button, PriceDisplay],
  templateUrl: './compare.html',
  styleUrl: './compare.css',
})
export class Compare implements OnInit {
  private readonly compareService = inject(CompareService);
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);
  readonly language = inject(LanguageService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly count = this.compareService.count;
  readonly max = this.compareService.max;

  readonly isEmptyResults = computed(() => !this.loading() && this.products().length === 0);

  private initialized = false;

  constructor() {
    effect(() => {
      const ids = this.compareService.ids();

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
    await this.loadProductsForIds(this.compareService.ids());
  }

  private async loadProductsForIds(ids: string[]): Promise<void> {
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
  getSpecName(spec: { name: { en: string; ar: string } }): string {
    return this.language.language() === 'ar' ? spec.name.ar : spec.name.en;
  }

  getSpecValue(spec: { value: { en: string; ar: string } }): string {
    return this.language.language() === 'ar' ? spec.value.ar : spec.value.en;
  }

  /**
   * Build the rows for the comparison table.
   * Collects all unique spec names across all products,
   * then builds values for each product in order.
   */
  readonly compareRows = computed<CompareRow[]>(() => {
    const items = this.products();
    if (items.length === 0) return [];

    const isAr = this.language.language() === 'ar';

    // Collect all unique spec names (English keys to deduplicate)
    const specNameMap = new Map<string, string>(); // enName -> displayName

    for (const product of items) {
      for (const spec of product.specifications) {
        const enName = spec.name.en;
        if (!specNameMap.has(enName)) {
          specNameMap.set(enName, isAr ? spec.name.ar : spec.name.en);
        }
      }
    }

    // Build rows in a consistent order
    const rows: CompareRow[] = [];

    for (const [enName, displayName] of specNameMap) {
      const values = items.map((product) => {
        const spec = product.specifications.find((s) => s.name.en === enName);

        if (!spec) {
          return {
            productId: product._id,
            value: '—',
            isEmpty: true,
          };
        }

        return {
          productId: product._id,
          value: isAr ? spec.value.ar : spec.value.en,
          isEmpty: false,
        };
      });

      rows.push({ specName: displayName, values });
    }

    return rows;
  });

  getProductName(product: Product): string {
    return this.language.language() === 'ar' ? product.name.ar : product.name.en;
  }

  getProductImage(product: Product): string | null {
    const main = product.images.find((img) => img.isMain);
    return main?.url ?? product.images[0]?.url ?? null;
  }

  removeProduct(productId: string): void {
    this.compareService.remove(productId);
    this.toastService.info(this.language.t('productDetails.removedFromCompare'));
  }

  clearAll(): void {
    const confirmed = confirm(
      this.language.language() === 'ar'
        ? 'هل أنت متأكد من مسح كل المقارنات؟'
        : 'Are you sure you want to clear all comparisons?',
    );
    if (!confirmed) return;
    this.compareService.clear();
    this.products.set([]);
  }
}
