import { Injectable, signal, effect, computed, DOCUMENT, ApplicationRef } from '@angular/core';
import { inject } from '@angular/core';
import { revealWithViewTransition, type RevealOrigin } from '../utils/view-transition';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly _theme = signal<Theme>(this.getInitialTheme());
  private isInitialized = false;

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    // Apply initial theme immediately
    this.applyTheme(this._theme());
    this.isInitialized = true;

    // React to theme changes
    effect(() => {
      const theme = this._theme();
      if (!this.isInitialized) return;
      this.applyTheme(theme);
      this.persist(theme);
    });
  }

  /** `origin` (viewport coordinates) enables the circular reveal from that point. */
  toggle(origin?: RevealOrigin): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';

    const revealed = revealWithViewTransition(
      () => {
        // The effect above runs asynchronously, but the View Transition captures the
        // new state right after this callback, so apply it synchronously here.
        this._theme.set(next);
        this.applyTheme(next);
        this.persist(next);
        this.appRef.tick(); // render theme-dependent template bits (e.g. the toggle icon)
      },
      origin ?? this.defaultOrigin(),
    );

    if (!revealed) {
      this._theme.set(next);
    }
  }

  private defaultOrigin(): RevealOrigin {
    return { x: window.innerWidth / 2, y: 0 };
  }

  set(theme: Theme): void {
    this._theme.set(theme);
  }

  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // localStorage may be unavailable (private mode)
    }

    // Check system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const root = this.document.documentElement;
    const body = this.document.body;

    // Add temporary transition class for smooth theme switch
    // (skipped during a View Transition, which handles the visual change itself)
    if (this.isInitialized && body && !root.classList.contains('theme-vt')) {
      body.classList.add('theme-transition');
      window.setTimeout(() => {
        body.classList.remove('theme-transition');
      }, 350);
    }

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#08090c' : '#fafbfc');
    }
  }

  private persist(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Silently ignore storage errors
    }
  }
}
