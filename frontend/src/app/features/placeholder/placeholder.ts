import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-placeholder',
  template: `
    <div
      class="min-h-screen flex items-center justify-center p-8"
      style="background-color: var(--bg-primary); color: var(--text-primary)"
    >
      <div class="text-center space-y-4 max-w-2xl">
        <h1 class="display">Computer Store</h1>
        <p class="text-[var(--text-secondary)] text-lg">
          Phase 1.2 — Foundation is ready. Routing + Services online.
        </p>

        <div class="flex flex-wrap gap-3 justify-center pt-4">
          <button
            type="button"
            (click)="theme.toggle()"
            class="px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium hover:border-[var(--accent)] transition-colors"
          >
            🌗 {{ theme.isDark() ? 'Light' : 'Dark' }}
          </button>

          <button
            type="button"
            (click)="language.toggle()"
            class="px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium hover:border-[var(--accent)] transition-colors"
          >
            🌐 {{ language.language() === 'ar' ? 'English' : 'العربية' }}
          </button>
        </div>

        <div
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-sm font-medium mt-4"
        >
          <span class="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse-soft"></span>
          {{ language.t('common.loading') }}
        </div>
      </div>
    </div>
  `,
})
export class PlaceholderComponent {
  readonly theme = inject(ThemeService);
  readonly language = inject(LanguageService);
}
