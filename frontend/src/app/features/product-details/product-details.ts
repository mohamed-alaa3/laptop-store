import { Component, inject, signal, computed, type OnInit, type OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Gallery } from './components/gallery/gallery';
import { SpecsTable } from './components/specs-table/specs-table';
import { RelatedProducts } from './components/related-products/related-products';
import { Badge } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { PriceDisplay } from '../../shared/components/price-display/price-display';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ProductService } from '../../core/services/product';
import { LanguageService } from '../../core/services/language';
import { WishlistService } from '../../core/services/wishlist';
import { CompareService } from '../../core/services/compare';
import { ToastService } from '../../core/services/toast';
import { environment } from '../../../environments/environment';
import type { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-details',
  imports: [
    Gallery,
    SpecsTable,
    RelatedProducts,
    Badge,
    Button,
    PriceDisplay,
    Skeleton,
    RouterLink,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly wishlistService = inject(WishlistService);
  private readonly compareService = inject(CompareService);
  private readonly toastService = inject(ToastService);
  readonly language = inject(LanguageService);

  private readonly destroy$ = new Subject<void>();

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  readonly relatedProducts = signal<Product[]>([]);
  readonly loadingRelated = signal(false);

  // ─── Computed ───────────────────────────────────────────
  readonly productName = computed(() => {
    const p = this.product();
    if (!p) return '';
    return this.language.language() === 'ar' ? p.name.ar : p.name.en;
  });

  readonly productDescription = computed(() => {
    const p = this.product();
    if (!p) return '';
    return this.language.language() === 'ar' ? p.description.ar : p.description.en;
  });

  readonly hasDiscount = computed(() => {
    const p = this.product();
    if (!p) return false;
    return p.oldPrice !== undefined && p.oldPrice > p.price;
  });

  readonly isOutOfStock = computed(() => (this.product()?.stock ?? 0) === 0);

  readonly isLowStock = computed(() => {
    const stock = this.product()?.stock ?? 0;
    return stock > 0 && stock <= 3;
  });

  readonly hasFreeGift = computed(() => {
    const p = this.product();
    return p?.offer?.isActive === true && p.offer.type === 'free-gift';
  });

  readonly whatsappLink = computed(() => {
    const name = this.productName();
    if (!name) return `https://wa.me/${environment.whatsappNumber}`;

    const message =
      this.language.language() === 'ar'
        ? `السلام عليكم، أريد معرفة تفاصيل أكثر عن ${name}.`
        : `Hello, I would like to know more details about ${name}.`;

    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(message)}`;
  });

  // ─── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        void this.loadProduct(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadProduct(slug: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    this.product.set(null);
    this.relatedProducts.set([]);

    try {
      const product = await this.productService.getBySlug(slug);

      if (!product) {
        this.notFound.set(true);
        return;
      }

      this.product.set(product);

      void this.loadRelated(product.category, product._id);
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadRelated(categoryId: string, excludeId: string): Promise<void> {
    this.loadingRelated.set(true);
    try {
      const related = await this.productService.loadRelated(categoryId, excludeId, 4);
      this.relatedProducts.set(related);
    } finally {
      this.loadingRelated.set(false);
    }
  }

  // ─── Actions ────────────────────────────────────────────
  openWhatsApp(): void {
    window.open(this.whatsappLink(), '_blank', 'noopener,noreferrer');
  }

  goBack(): void {
    void this.router.navigate(['/shop']);
  }

  // ─── Wishlist & Compare ─────────────────────────────────
  isInWishlist(): boolean {
    const p = this.product();
    return p ? this.wishlistService.has(p._id) : false;
  }

  isInCompare(): boolean {
    const p = this.product();
    return p ? this.compareService.has(p._id) : false;
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    const result = this.wishlistService.toggle(p._id);
    if (result === 'added') {
      this.toastService.success(this.language.t('productDetails.addedToWishlist'));
    } else {
      this.toastService.info(this.language.t('productDetails.removedFromWishlist'));
    }
  }

  toggleCompare(): void {
    const p = this.product();
    if (!p) return;
    const result = this.compareService.toggle(p._id);
    if (result === 'added') {
      this.toastService.success(this.language.t('productDetails.addedToCompare'));
    } else if (result === 'removed') {
      this.toastService.info(this.language.t('productDetails.removedFromCompare'));
    } else if (result === 'full') {
      this.toastService.error(this.language.t('productDetails.compareFull'));
    }
  }
}
