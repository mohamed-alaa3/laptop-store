import { Component, input, computed } from '@angular/core';

export type BadgeVariant =
  'new' | 'sale' | 'free-gift' | 'featured' | 'condition-new' | 'condition-imported' | 'custom';

export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  imports: [],
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
  host: {
    class: 'inline-flex',
  },
})
export class Badge {
  readonly variant = input<BadgeVariant>('new');
  readonly size = input<BadgeSize>('sm');

  readonly classes = computed(() => {
    const base = [
      'inline-flex',
      'items-center',
      'gap-1',
      'rounded-full',
      'font-semibold',
      'tracking-wide',
      'uppercase',
      'whitespace-nowrap',
    ];

    const sizeClasses: Record<BadgeSize, string[]> = {
      sm: ['text-[10px]', 'px-2', 'py-0.5'],
      md: ['text-xs', 'px-2.5', 'py-1'],
    };

    const variantClasses: Record<BadgeVariant, string[]> = {
      new: ['bg-[var(--badge-new-bg)]', 'text-[var(--badge-new-fg)]'],
      sale: ['bg-[var(--badge-sale-bg)]', 'text-[var(--badge-sale-fg)]'],
      'free-gift': ['bg-[var(--badge-gift-bg)]', 'text-[var(--badge-gift-fg)]'],
      featured: ['bg-[var(--badge-featured-bg)]', 'text-[var(--badge-featured-fg)]'],
      'condition-new': ['bg-[var(--badge-new-bg)]', 'text-[var(--badge-new-fg)]'],
      'condition-imported': [
        'bg-[var(--surface)]',
        'text-[var(--text-secondary)]',
        'border',
        'border-[var(--border)]',
      ],
      custom: ['bg-[var(--surface)]', 'text-[var(--text-secondary)]'],
    };

    return [...base, ...sizeClasses[this.size()], ...variantClasses[this.variant()]].join(' ');
  });
}
