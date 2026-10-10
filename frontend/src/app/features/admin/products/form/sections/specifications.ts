import { Component, input, output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../../core/services/language';
import type { Specification } from '../../../../../core/models/product.model';

@Component({
  selector: 'app-specifications-section',
  imports: [FormsModule],
  template: `
    <section
      class="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden"
    >
      <header class="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
          </svg>
          {{ language.language() === 'ar' ? 'المواصفات' : 'Specifications' }}
          <span class="text-xs font-normal text-[var(--text-muted)] ms-1">
            ({{ specifications().length }})
          </span>
        </h2>

        <button
          type="button"
          (click)="addRow()"
          class="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors focus-ring"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          {{ language.language() === 'ar' ? 'إضافة مواصفة' : 'Add Specification' }}
        </button>
      </header>

      <div class="p-5">
        @if (specifications().length === 0) {
          <div class="text-center py-8">
            <p class="text-sm text-[var(--text-muted)]">
              {{
                language.language() === 'ar'
                  ? 'لا توجد مواصفات بعد. اضغط "إضافة مواصفة" للبدء.'
                  : 'No specifications yet. Click "Add Specification" to start.'
              }}
            </p>
          </div>
        } @else {
          <div class="space-y-3">
            <!-- Header row (desktop) -->
            <div
              class="hidden md:grid grid-cols-12 gap-3 px-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
            >
              <div class="col-span-5">
                {{ language.language() === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)' }}
              </div>
              <div class="col-span-5">
                {{ language.language() === 'ar' ? 'القيمة (إنجليزي)' : 'Value (EN)' }}
              </div>
              <div class="col-span-2"></div>
            </div>

            @for (spec of specifications(); track $index; let i = $index) {
              <div
                class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <!-- Name EN -->
                <input
                  type="text"
                  [ngModel]="spec.name.en"
                  (ngModelChange)="updateSpec(i, 'name', 'en', $event)"
                  [placeholder]="language.language() === 'ar' ? 'المعالج' : 'Processor'"
                  dir="ltr"
                  class="md:col-span-5 h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                />

                <!-- Value EN -->
                <input
                  type="text"
                  [ngModel]="spec.value.en"
                  (ngModelChange)="updateSpec(i, 'value', 'en', $event)"
                  [placeholder]="language.language() === 'ar' ? 'Intel i7' : 'Intel i7'"
                  dir="ltr"
                  class="md:col-span-5 h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                />

                <!-- Delete -->
                <div class="md:col-span-2 flex items-center gap-1 md:justify-end">
                  <button
                    type="button"
                    (click)="removeRow(i)"
                    class="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--badge-sale-fg)] hover:bg-[var(--badge-sale-bg)] transition-colors focus-ring"
                    [title]="language.language() === 'ar' ? 'حذف' : 'Delete'"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <!-- Arabic name + value (below on mobile, hidden fields) -->
                <input
                  type="text"
                  [ngModel]="spec.name.ar"
                  (ngModelChange)="updateSpec(i, 'name', 'ar', $event)"
                  [placeholder]="language.language() === 'ar' ? 'المعالج (عربي)' : 'Arabic name'"
                  dir="rtl"
                  class="md:col-span-6 h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                />

                <input
                  type="text"
                  [ngModel]="spec.value.ar"
                  (ngModelChange)="updateSpec(i, 'value', 'ar', $event)"
                  [placeholder]="language.language() === 'ar' ? 'القيمة (عربي)' : 'Arabic value'"
                  dir="rtl"
                  class="md:col-span-6 h-10 px-3 rounded-lg border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  [style.background-color]="'var(--bg-elevated)'"
                  [style.color]="'var(--text-primary)'"
                  [style.border-color]="'var(--border)'"
                />
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SpecificationsSection {
  readonly language = inject(LanguageService);

  readonly specifications = input.required<Specification[]>();
  readonly update = output<Specification[]>();

  addRow(): void {
    this.update.emit([
      ...this.specifications(),
      {
        name: { en: '', ar: '' },
        value: { en: '', ar: '' },
      },
    ]);
  }

  removeRow(index: number): void {
    this.update.emit(this.specifications().filter((_, i) => i !== index));
  }

  updateSpec(index: number, field: 'name' | 'value', lang: 'en' | 'ar', value: string): void {
    const updated = this.specifications().map((spec, i) => {
      if (i !== index) return spec;
      return {
        ...spec,
        [field]: { ...spec[field], [lang]: value },
      };
    });
    this.update.emit(updated);
  }
}
