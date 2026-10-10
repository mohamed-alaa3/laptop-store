import { Component, input, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-page-loader',
  imports: [],
  template: `
    <div class="page-loader">
      <!-- Animated logo mark -->
      <div class="page-loader-logo">
        <div
          class="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
          style="background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)"
        >
          <!-- Pulsing ring -->
          <div
            class="absolute inset-0 rounded-2xl border-2 border-[var(--accent)]"
            style="animation: pulseRing 2s ease-out infinite"
          ></div>

          <!-- Mouse icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="14" height="20" x="5" y="2" rx="7" />
            <path d="M12 6v4" />
          </svg>
        </div>
      </div>

      <!-- Text -->
      @if (message()) {
        <p class="text-sm font-medium text-[var(--text-secondary)]">
          {{ message() }}
        </p>
      } @else {
        <p class="text-sm font-medium text-[var(--text-secondary)]">
          {{ language.t('common.loading') }}
        </p>
      }

      <!-- Progress bar -->
      <div class="page-loader-bar"></div>
    </div>
  `,
})
export class PageLoader {
  readonly language = inject(LanguageService);
  readonly message = input<string>('');
}
