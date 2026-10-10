import { Injectable, signal, computed, effect, DOCUMENT, inject } from '@angular/core';
import enTranslations from '../i18n/en.json';
import arTranslations from '../i18n/ar.json';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

const STORAGE_KEY = 'app-language';

type TranslationDict = Record<string, unknown>;

const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: enTranslations as TranslationDict,
  ar: arTranslations as TranslationDict,
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly _language = signal<Language>(this.getInitialLanguage());
  private isInitialized = false;

  readonly language = this._language.asReadonly();
  readonly direction = computed<Direction>(() => (this._language() === 'ar' ? 'rtl' : 'ltr'));
  readonly isRtl = computed(() => this._language() === 'ar');

  constructor() {
    this.applyLanguage(this._language());
    this.isInitialized = true;

    effect(() => {
      const lang = this._language();
      if (!this.isInitialized) return;
      this.applyLanguage(lang);
      this.persist(lang);
    });
  }

  set(lang: Language): void {
    this._language.set(lang);
  }

  toggle(): void {
    this._language.update((current) => (current === 'en' ? 'ar' : 'en'));
  }

  /**
   * Translate a dot-notation key like "nav.home".
   * Returns the key itself if not found.
   */
  t(key: string, fallback?: string): string {
    const dict = TRANSLATIONS[this._language()];
    const parts = key.split('.');
    let current: unknown = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as object)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return fallback ?? key;
      }
    }

    return typeof current === 'string' ? current : (fallback ?? key);
  }

  private getInitialLanguage(): Language {
    if (typeof window === 'undefined') return 'en';

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') return stored;
    } catch {
      // localStorage may be unavailable
    }

    const browserLang = navigator.language?.toLowerCase() ?? '';
    return browserLang.startsWith('ar') ? 'ar' : 'en';
  }

  private applyLanguage(lang: Language): void {
    const root = this.document.documentElement;
    const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';

    root.setAttribute('dir', dir);
    root.setAttribute('lang', lang);
  }

  private persist(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Silently ignore storage errors
    }
  }
}
