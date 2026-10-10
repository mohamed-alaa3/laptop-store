import { Component, input, inject, computed, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge } from '../badge/badge';
import { PriceDisplay } from '../price-display/price-display';
import { LanguageService } from '../../../core/services/language';
import type { Product } from '../../../core/models/product.model';
import { WishlistService } from '../../../core/services/wishlist';
import { CompareService } from '../../../core/services/compare';
import { ToastService } from '../../../core/services/toast';
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Badge, PriceDisplay],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly wishlistActive = input<boolean>(false);
  readonly compareActive = input<boolean>(false);

  readonly wishlistToggle = output<Product>();
  readonly compareToggle = output<Product>();

  readonly language = inject(LanguageService);

  // Animation triggers
  readonly heartAnimating = signal(false);
  readonly compareAnimating = signal(false);
  private readonly wishlistService = inject(WishlistService);
  private readonly compareService = inject(CompareService);
  private readonly toastService = inject(ToastService);

  readonly productName = computed(() => {
    const p = this.product();
    return this.language.language() === 'ar' ? p.name.ar : p.name.en;
  });

  readonly hasDiscount = computed(() => {
    const p = this.product();
    return p.oldPrice !== undefined && p.oldPrice > p.price;
  });
  readonly isInWishlist = computed(() => this.wishlistService.has(this.product()._id));

  readonly isInCompare = computed(() => this.compareService.has(this.product()._id));

  readonly discountPercent = computed(() => {
    const p = this.product();
    if (!this.hasDiscount() || !p.oldPrice) return 0;
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  });

  readonly hasFreeGift = computed(() => {
    const p = this.product();
    return p.offer?.isActive === true && p.offer?.type === 'free-gift';
  });

  readonly isLowStock = computed(() => {
    const p = this.product();
    return p.stock > 0 && p.stock <= 3;
  });

  readonly isOutOfStock = computed(() => this.product().stock === 0);

  readonly mainImage = computed(() => {
    const p = this.product();
    const main = p.images.find((img) => img.isMain);
    return main?.url ?? p.images[0]?.url ?? null;
  });

  readonly shortSpecs = computed(() => {
    const p = this.product();
    return p.specifications.slice(0, 2);
  });

  getSpecName(spec: { name: { en: string; ar: string } }): string {
    return this.language.language() === 'ar' ? spec.name.ar : spec.name.en;
  }

  getSpecValue(spec: { value: { en: string; ar: string } }): string {
    return this.language.language() === 'ar' ? spec.value.ar : spec.value.en;
  }

  onWishlistClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Trigger heart animation
    this.heartAnimating.set(true);
    setTimeout(() => this.heartAnimating.set(false), 500);

    const result = this.wishlistService.toggle(this.product()._id);
    if (result === 'added') {
      this.toastService.success(this.language.t('productDetails.addedToWishlist'));
    } else {
      this.toastService.info(this.language.t('productDetails.removedFromWishlist'));
    }
    this.wishlistToggle.emit(this.product());
  }

  onCompareClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Trigger compare animation
    this.compareAnimating.set(true);
    setTimeout(() => this.compareAnimating.set(false), 400);

    const result = this.compareService.toggle(this.product()._id);
    if (result === 'added') {
      this.toastService.success(this.language.t('productDetails.addedToCompare'));
    } else if (result === 'removed') {
      this.toastService.info(this.language.t('productDetails.removedFromCompare'));
    } else if (result === 'full') {
      this.toastService.error(this.language.t('productDetails.compareFull'));
    }
    this.compareToggle.emit(this.product());
  }
}
