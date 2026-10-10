import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../../core/services/language';
import type { ProductFormData } from '../product-form';

@Component({
  selector: 'app-pricing-stock-section',
  imports: [FormsModule],
  template: `
    <section
      class="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden"
    >
      <header class="px-5 py-4 border-b border-[var(--border)]">
        <h2 class="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
            />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
          {{ language.language() === 'ar' ? 'السعر والمخزون' : 'Pricing & Stock' }}
        </h2>
      </header>

      <div class="p-5 space-y-4">
        <!-- Price + Old Price + Stock -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="price" class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {{ language.language() === 'ar' ? 'السعر (EGP)' : 'Price (EGP)' }}
              <span class="text-[var(--danger)]">*</span>
            </label>
            <input
              id="price"
              type="number"
              min="0"
              [ngModel]="form().price"
              (ngModelChange)="emit('price', +$event)"
              placeholder="45000"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            />
          </div>

          <div>
            <label
              for="oldPrice"
              class="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              {{ language.language() === 'ar' ? 'السعر القديم' : 'Old Price' }}
              <span class="text-xs text-[var(--text-muted)] font-normal">
                ({{ language.language() === 'ar' ? 'اختياري' : 'optional' }})
              </span>
            </label>
            <input
              id="oldPrice"
              type="number"
              min="0"
              [ngModel]="form().oldPrice"
              (ngModelChange)="emit('oldPrice', $event ? +$event : null)"
              placeholder="52000"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            />
          </div>

          <div>
            <label for="stock" class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {{ language.language() === 'ar' ? 'المخزون' : 'Stock' }}
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              [ngModel]="form().stock"
              (ngModelChange)="emit('stock', +$event)"
              placeholder="10"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            />
          </div>
        </div>

        <!-- Flags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <label
            class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
            [style.background-color]="form().featured ? 'var(--accent-soft)' : 'var(--surface)'"
            [style.border-color]="form().featured ? 'var(--accent)' : 'var(--border)'"
          >
            <input
              type="checkbox"
              [ngModel]="form().featured"
              (ngModelChange)="emit('featured', $event)"
              class="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">
                {{ language.language() === 'ar' ? 'منتج مميز' : 'Featured Product' }}
              </p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">
                {{ language.language() === 'ar' ? 'يظهر في الصفحة الرئيسية' : 'Shows on homepage' }}
              </p>
            </div>
          </label>

          <label
            class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
            [style.background-color]="form().newArrival ? 'var(--accent-soft)' : 'var(--surface)'"
            [style.border-color]="form().newArrival ? 'var(--accent)' : 'var(--border)'"
          >
            <input
              type="checkbox"
              [ngModel]="form().newArrival"
              (ngModelChange)="emit('newArrival', $event)"
              class="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">
                {{ language.language() === 'ar' ? 'وصل حديثاً' : 'New Arrival' }}
              </p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">
                {{
                  language.language() === 'ar'
                    ? 'يظهر في قسم الوصول الحديث'
                    : 'Shows in new arrivals'
                }}
              </p>
            </div>
          </label>
        </div>

        <!-- Tags -->
        <div>
          <label for="tags" class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {{ language.language() === 'ar' ? 'الوسوم' : 'Tags' }}
            <span class="text-xs text-[var(--text-muted)] font-normal">
              ({{ language.language() === 'ar' ? 'مفصولة بفاصلة' : 'comma-separated' }})
            </span>
          </label>
          <input
            id="tags"
            type="text"
            [ngModel]="form().tags"
            (ngModelChange)="emit('tags', $event)"
            placeholder="gaming, laptop, rtx"
            class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
            [style.background-color]="'var(--surface)'"
            [style.color]="'var(--text-primary)'"
            [style.border-color]="'var(--border)'"
          />
        </div>
      </div>
    </section>
  `,
})
export class PricingStockSection {
  readonly language = inject(LanguageService);

  readonly form = input.required<ProductFormData>();
  readonly update = output<{ key: keyof ProductFormData; value: unknown }>();

  emit(key: keyof ProductFormData, value: unknown): void {
    this.update.emit({ key, value });
  }
}
