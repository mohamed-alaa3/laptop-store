import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-price-display',
  imports: [],
  template: `
    <div [class]="wrapperClasses()">
      @if (hasDiscount()) {
        <span class="text-[var(--text-muted)] line-through" [class]="oldPriceClasses()">
          {{ formatPrice(oldPrice()!) }}
        </span>
        <span [class]="priceClasses()">{{ formatPrice(price()) }}</span>
        <span [class]="discountBadgeClasses()">-{{ discountPercent() }}%</span>
      } @else {
        <span [class]="priceClasses()">{{ formatPrice(price()) }}</span>
      }
    </div>
  `,
  host: {
    class: 'inline-flex',
  },
})
export class PriceDisplay {
  readonly price = input.required<number>();
  readonly oldPrice = input<number | undefined>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly currency = input<string>('EGP');
  readonly showDiscountBadge = input<boolean>(true);

  readonly hasDiscount = computed(() => {
    const old = this.oldPrice();
    return old !== undefined && old !== null && old > this.price();
  });

  readonly discountPercent = computed(() => {
    const old = this.oldPrice();
    if (!this.hasDiscount() || !old) return 0;
    return Math.round(((old - this.price()) / old) * 100);
  });

  readonly wrapperClasses = computed(() => {
    const base = ['inline-flex', 'items-baseline', 'gap-2', 'flex-wrap'];
    return base.join(' ');
  });

  readonly priceClasses = computed(() => {
    const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'text-base font-semibold',
      md: 'text-lg font-bold',
      lg: 'text-2xl font-bold',
    };
    return `${sizeMap[this.size()]} text-[var(--text-primary)]`;
  });

  readonly oldPriceClasses = computed(() => {
    const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };
    return sizeMap[this.size()];
  });

  readonly discountBadgeClasses = computed(() => {
    const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'text-[10px] px-1.5 py-0.5',
      md: 'text-xs px-2 py-0.5',
      lg: 'text-sm px-2.5 py-1',
    };
    return `${sizeMap[this.size()]} rounded-full bg-[var(--badge-sale-bg)] text-[var(--badge-sale-fg)] font-semibold`;
  });

  formatPrice(value: number): string {
    return `${new Intl.NumberFormat('en-EG').format(value)} ${this.currency()}`;
  }
}
