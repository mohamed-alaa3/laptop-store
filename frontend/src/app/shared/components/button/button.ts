import { Component, input, output, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <svg
          class="icon-spin"
          [attr.width]="iconSize()"
          [attr.height]="iconSize()"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647Z"
          />
        </svg>
      }

      <ng-content />

      @if (loading()) {
        <span class="sr-only">Loading...</span>
      }
    </button>
  `,
  host: {
    class: 'inline-block',
  },
})
export class Button {
  private readonly platformId = inject(PLATFORM_ID);

  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  readonly clicked = output<MouseEvent>();

  readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 14;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  });

  readonly classes = computed(() => {
    const base = [
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'rounded-full',
      'font-medium',
      'transition-all',
      'duration-200',
      'overflow-hidden',
      'select-none',
      'focus-ring',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
      'whitespace-nowrap',
      'active:scale-[0.97]',
    ];

    const sizeClasses: Record<ButtonSize, string[]> = {
      sm: ['text-xs', 'px-3.5', 'h-8'],
      md: ['text-sm', 'px-5', 'h-10'],
      lg: ['text-base', 'px-7', 'h-12'],
    };

    const variantClasses: Record<ButtonVariant, string[]> = {
      primary: [
        'bg-[var(--accent)]',
        'text-[var(--accent-foreground)]',
        'hover:bg-[var(--accent-hover)]',
        'shadow-sm',
        'hover:shadow-md',
        'hover:shadow-[var(--accent)]/20',
      ],
      secondary: [
        'bg-[var(--bg-elevated)]',
        'text-[var(--text-primary)]',
        'border',
        'border-[var(--border)]',
        'hover:border-[var(--accent)]',
        'hover:text-[var(--accent)]',
      ],
      ghost: [
        'bg-transparent',
        'text-[var(--text-secondary)]',
        'hover:bg-[var(--surface)]',
        'hover:text-[var(--text-primary)]',
      ],
      danger: [
        'bg-[var(--danger)]',
        'text-white',
        'hover:brightness-110',
        'shadow-sm',
        'hover:shadow-md',
        'hover:shadow-[var(--danger)]/25',
      ],
      whatsapp: [
        'bg-[var(--whatsapp)]',
        'text-white',
        'hover:bg-[var(--whatsapp-hover)]',
        'shadow-sm',
        'hover:shadow-md',
        'hover:shadow-[var(--whatsapp)]/25',
      ],
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return [
      ...base,
      ...sizeClasses[this.size()],
      ...variantClasses[this.variant()],
      widthClass,
    ].join(' ');
  });

  onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.spawnRipple(event);
    this.clicked.emit(event);
  }

  private spawnRipple(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.className = 'ripple-effect';

    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }
}
