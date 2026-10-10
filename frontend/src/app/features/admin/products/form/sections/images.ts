import { Component, input, output, inject } from '@angular/core';
import { LanguageService } from '../../../../../core/services/language';
import { ImageUploader } from '../../../../../shared/components/image-uploader/image-uploader';
import type { ProductImage } from '../../../../../core/models/product.model';

@Component({
  selector: 'app-images-section',
  imports: [ImageUploader],
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
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          {{ language.language() === 'ar' ? 'الصور' : 'Images' }}
          <span class="text-xs font-normal text-[var(--text-muted)] ms-1">
            ({{ images().length }})
          </span>
        </h2>
      </header>

      <div class="p-5">
        <app-image-uploader [images]="images()" (imagesChange)="imagesChange.emit($event)" />
      </div>
    </section>
  `,
})
export class ImagesSection {
  readonly language = inject(LanguageService);

  readonly images = input.required<ProductImage[]>();
  readonly imagesChange = output<ProductImage[]>();
}
