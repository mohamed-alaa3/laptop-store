import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { Button } from '../../shared/components/button/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Button],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div class="text-center max-w-lg mx-auto">
        <!-- 404 animated visual -->
        <div class="relative mb-8">
          <div
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div
              class="w-40 h-40 rounded-full opacity-20 blur-[80px]"
              style="background: var(--accent)"
            ></div>
          </div>

          <h1
            class="relative text-[100px] md:text-[140px] font-black leading-none tracking-tighter"
            style="background: linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 50%, #EC4899) 100%); -webkit-background-clip: text; background-clip: text; color: transparent"
          >
            404
          </h1>
        </div>

        <!-- Title -->
        <h2 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">
          {{ language.t('errors.notFound') }}
        </h2>

        <!-- Description -->
        <p class="text-base text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          {{ language.t('errors.notFoundHint') }}
        </p>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a routerLink="/">
            <app-button variant="primary" size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {{ language.t('errors.goHome') }}
            </app-button>
          </a>
          <a routerLink="/search">
            <app-button variant="secondary" size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {{ language.language() === 'ar' ? 'ابحث' : 'Search' }}
            </app-button>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class NotFound {
  readonly language = inject(LanguageService);
}
