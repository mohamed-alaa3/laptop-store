import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../../core/services/language';
import type { ProductFormData } from '../product-form';
import type { Category } from '../../../../../core/models/category.model';

@Component({
  selector: 'app-basic-info-section',
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          {{ language.language() === 'ar' ? 'المعلومات الأساسية' : 'Basic Information' }}
        </h2>
      </header>

      <div class="p-5 space-y-4">
        <!-- Name (EN + AR) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="nameEn" class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {{ language.language() === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)' }}
              <span class="text-[var(--danger)]">*</span>
            </label>
            <input
              id="nameEn"
              type="text"
              [ngModel]="form().nameEn"
              (ngModelChange)="emit('nameEn', $event)"
              placeholder="Lenovo LOQ 15"
              dir="ltr"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            />
          </div>

          <div>
            <label for="nameAr" class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {{ language.language() === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)' }}
              <span class="text-[var(--danger)]">*</span>
            </label>
            <input
              id="nameAr"
              type="text"
              [ngModel]="form().nameAr"
              (ngModelChange)="emit('nameAr', $event)"
              placeholder="لينوفو LOQ 15"
              dir="rtl"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            />
          </div>
        </div>

        <!-- Brand + Category -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="brand" class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {{ language.language() === 'ar' ? 'الماركة' : 'Brand' }}
              <span class="text-[var(--danger)]">*</span>
            </label>
            <input
              id="brand"
              type="text"
              [ngModel]="form().brand"
              (ngModelChange)="emit('brand', $event)"
              placeholder="Lenovo"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            />
          </div>

          <div>
            <label
              for="category"
              class="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              {{ language.language() === 'ar' ? 'الفئة' : 'Category' }}
              <span class="text-[var(--danger)]">*</span>
            </label>
            <select
              id="category"
              [ngModel]="form().category"
              (ngModelChange)="emit('category', $event)"
              class="w-full h-10 px-3 rounded-xl border text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            >
              <option value="">
                {{ language.language() === 'ar' ? 'اختر فئة' : 'Select category' }}
              </option>
              @for (cat of categories(); track cat._id) {
                <option [value]="cat._id">
                  {{ language.language() === 'ar' ? cat.name.ar : cat.name.en }}
                </option>
              }
            </select>
          </div>
        </div>

        <!-- Condition -->
        <div>
          <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {{ language.language() === 'ar' ? 'الحالة' : 'Condition' }}
          </label>
          <div class="flex gap-2">
            <button
              type="button"
              (click)="emit('condition', 'new')"
              class="flex-1 h-10 rounded-xl border text-sm font-medium transition-all"
              [style.background-color]="
                form().condition === 'new' ? 'var(--accent-soft)' : 'var(--surface)'
              "
              [style.color]="form().condition === 'new' ? 'var(--accent)' : 'var(--text-secondary)'"
              [style.border-color]="form().condition === 'new' ? 'var(--accent)' : 'var(--border)'"
            >
              {{ language.language() === 'ar' ? 'جديد' : 'New' }}
            </button>
            <button
              type="button"
              (click)="emit('condition', 'imported')"
              class="flex-1 h-10 rounded-xl border text-sm font-medium transition-all"
              [style.background-color]="
                form().condition === 'imported' ? 'var(--accent-soft)' : 'var(--surface)'
              "
              [style.color]="
                form().condition === 'imported' ? 'var(--accent)' : 'var(--text-secondary)'
              "
              [style.border-color]="
                form().condition === 'imported' ? 'var(--accent)' : 'var(--border)'
              "
            >
              {{ language.language() === 'ar' ? 'استيراد' : 'Imported' }}
            </button>
          </div>
        </div>

        <!-- Description (EN + AR) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="descriptionEn"
              class="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              {{ language.language() === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)' }}
            </label>
            <textarea
              id="descriptionEn"
              rows="4"
              [ngModel]="form().descriptionEn"
              (ngModelChange)="emit('descriptionEn', $event)"
              placeholder="Powerful gaming laptop..."
              dir="ltr"
              class="w-full px-3 py-2 rounded-xl border text-sm resize-none focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            ></textarea>
          </div>

          <div>
            <label
              for="descriptionAr"
              class="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              {{ language.language() === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)' }}
            </label>
            <textarea
              id="descriptionAr"
              rows="4"
              [ngModel]="form().descriptionAr"
              (ngModelChange)="emit('descriptionAr', $event)"
              placeholder="لابتوب جيمنج قوي..."
              dir="rtl"
              class="w-full px-3 py-2 rounded-xl border text-sm resize-none focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              [style.background-color]="'var(--surface)'"
              [style.color]="'var(--text-primary)'"
              [style.border-color]="'var(--border)'"
            ></textarea>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class BasicInfoSection {
  readonly language = inject(LanguageService);

  readonly form = input.required<ProductFormData>();
  readonly categories = input.required<Category[]>();

  readonly update = output<{ key: keyof ProductFormData; value: unknown }>();

  emit(key: keyof ProductFormData, value: unknown): void {
    this.update.emit({ key, value });
  }
}
