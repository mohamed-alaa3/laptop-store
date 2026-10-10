import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../../core/services/language';
import type { ProductFormData } from '../product-form';
import type { Product } from '../../../../../core/models/product.model';
@Component({
  selector: 'app-offers-section',
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
          {{ language.language() === 'ar' ? 'العروض' : 'Offers' }}
        </h2>
      </header>

      <div class="p-5 space-y-4">
        <!-- Enable offer -->
        <label
          class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
          [style.background-color]="form().offerEnabled ? 'var(--accent-soft)' : 'var(--surface)'"
          [style.border-color]="form().offerEnabled ? 'var(--accent)' : 'var(--border)'"
        >
          <input
            type="checkbox"
            [ngModel]="form().offerEnabled"
            (ngModelChange)="emit('offerEnabled', $event)"
            class="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <div>
            <p class="text-sm font-semibold text-[var(--text-primary)]">
              {{ language.language() === 'ar' ? 'تفعيل عرض' : 'Enable Offer' }}
            </p>
            <p class="text-xs text-[var(--text-muted)] mt-0.5">
              {{
                language.language() === 'ar'
                  ? 'أضف خصم أو هدية مجانية'
                  : 'Add a discount or free gift'
              }}
            </p>
          </div>
        </label>

        @if (form().offerEnabled) {
          <!-- Offer type toggle -->
          <div>
            <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {{ language.language() === 'ar' ? 'نوع العرض' : 'Offer Type' }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="emit('offerType', 'discount')"
                class="h-12 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2"
                [style.background-color]="
                  form().offerType === 'discount' ? 'var(--accent-soft)' : 'var(--surface)'
                "
                [style.color]="
                  form().offerType === 'discount' ? 'var(--accent)' : 'var(--text-secondary)'
                "
                [style.border-color]="
                  form().offerType === 'discount' ? 'var(--accent)' : 'var(--border)'
                "
              >
                {{ language.language() === 'ar' ? 'خصم' : 'Discount' }}
              </button>

              <button
                type="button"
                (click)="emit('offerType', 'free-gift')"
                class="h-12 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2"
                [style.background-color]="
                  form().offerType === 'free-gift' ? 'var(--accent-soft)' : 'var(--surface)'
                "
                [style.color]="
                  form().offerType === 'free-gift' ? 'var(--accent)' : 'var(--text-secondary)'
                "
                [style.border-color]="
                  form().offerType === 'free-gift' ? 'var(--accent)' : 'var(--border)'
                "
              >
                🎁 {{ language.language() === 'ar' ? 'هدية مجانية' : 'Free Gift' }}
              </button>
            </div>
          </div>

          <!-- Discount settings -->
          @if (form().offerType === 'discount') {
            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border"
              style="background-color: var(--surface); border-color: var(--border)"
            >
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {{ language.language() === 'ar' ? 'نوع الخصم' : 'Discount Type' }}
                </label>
                <select
                  [ngModel]="form().discountType"
                  (ngModelChange)="emit('discountType', $event)"
                  class="w-full h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                >
                  <option value="percentage">
                    {{ language.language() === 'ar' ? 'نسبة مئوية %' : 'Percentage %' }}
                  </option>
                  <option value="fixed">
                    {{ language.language() === 'ar' ? 'مبلغ ثابت (EGP)' : 'Fixed Amount (EGP)' }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {{ language.language() === 'ar' ? 'قيمة الخصم' : 'Discount Value' }}
                </label>
                <input
                  type="number"
                  min="0"
                  [ngModel]="form().discountValue"
                  (ngModelChange)="emit('discountValue', $event ? +$event : null)"
                  [placeholder]="form().discountType === 'percentage' ? '15' : '5000'"
                  class="w-full h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                />
              </div>

              <!-- Preview -->
              @if (form().discountValue !== null && form().discountValue! > 0) {
                <div
                  class="md:col-span-2 p-3 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-sm font-medium"
                >
                  @if (form().discountType === 'percentage') {
                    -{{ form().discountValue }}%
                  } @else {
                    -{{ form().discountValue!.toLocaleString() }} EGP
                  }
                </div>
              }
            </div>
          }

          <!-- Free Gift settings -->
          @if (form().offerType === 'free-gift') {
            <div
              class="space-y-4 p-4 rounded-xl border"
              style="background-color: var(--surface); border-color: var(--border)"
            >
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {{ language.language() === 'ar' ? 'معرف المنتج الهدية' : 'Gift Product ID' }}
                  <span class="text-xs text-[var(--text-muted)] font-normal">
                    ({{ language.language() === 'ar' ? 'اختياري' : 'optional' }})
                  </span>
                </label>
                <select
                  [ngModel]="form().giftProductId"
                  (ngModelChange)="emit('giftProductId', $event)"
                  class="w-full h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                >
                  <option value="">
                    {{ language.language() === 'ar' ? 'اختر منتج الهدية' : 'Select gift product' }}
                  </option>
                  @for (p of products(); track p._id) {
                    <option [value]="p._id">
                      {{ language.language() === 'ar' ? p.name.ar : p.name.en }} — {{ p.brand }}
                    </option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {{ language.language() === 'ar' ? 'كمية الهدية' : 'Gift Quantity' }}
                </label>
                <input
                  type="number"
                  min="1"
                  [ngModel]="form().giftQuantity"
                  (ngModelChange)="emit('giftQuantity', $event ? +$event : null)"
                  placeholder="1"
                  class="w-full h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                />
              </div>
            </div>
          }

          <!-- Offer message -->
          <div>
            <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {{ language.language() === 'ar' ? 'رسالة العرض' : 'Offer Message' }}
              <span class="text-xs text-[var(--text-muted)] font-normal">
                ({{ language.language() === 'ar' ? 'اختياري' : 'optional' }})
              </span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                [ngModel]="form().offerMessageEn"
                (ngModelChange)="emit('offerMessageEn', $event)"
                placeholder="Buy this and get a gaming mouse FREE"
                dir="ltr"
                class="w-full h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                [style.background-color]="'var(--surface)'"
                [style.color]="'var(--text-primary)'"
                [style.border-color]="'var(--border)'"
              />
              <input
                type="text"
                [ngModel]="form().offerMessageAr"
                (ngModelChange)="emit('offerMessageAr', $event)"
                placeholder="اشتري ده واحصل على ماوس جيمنج مجاناً"
                dir="rtl"
                class="w-full h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                [style.background-color]="'var(--surface)'"
                [style.color]="'var(--text-primary)'"
                [style.border-color]="'var(--border)'"
              />
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class OffersSection {
  readonly language = inject(LanguageService);
  readonly products = input<Product[]>([]);
  readonly form = input.required<ProductFormData>();
  readonly update = output<{ key: keyof ProductFormData; value: unknown }>();

  emit(key: keyof ProductFormData, value: unknown): void {
    this.update.emit({ key, value });
  }
}
