import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-language-toggle',
  imports: [],
  template: `
    <button
      type="button"
      (click)="language.toggle()"
      [attr.aria-label]="language.t('language.toggle')"
      class="h-10 px-3 rounded-full flex items-center gap-1.5
             text-[var(--text-secondary)] hover:text-[var(--text-primary)]
             hover:bg-[var(--surface)] transition-all duration-200
             text-xs font-semibold tracking-wide focus-ring"
    >
      @if (language.language() === 'ar') {
        <span class="mono">EN</span>
      } @else {
        <span>ع</span>
      }
    </button>
  `,
})
export class LanguageToggle {
  readonly language = inject(LanguageService);
}
