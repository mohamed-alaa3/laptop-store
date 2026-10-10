import {
  Component,
  computed,
  DestroyRef,
  inject,
  NgZone,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { LanguageToggle } from '../language-toggle/language-toggle';
import { Logo } from '../logo/logo';
import { LanguageService } from '../../../core/services/language';
import { WishlistService } from '../../../core/services/wishlist';
import { CompareService } from '../../../core/services/compare';
import { watchScrollDirection } from '../../../core/utils/scroll-direction';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule, ThemeToggle, LanguageToggle, Logo],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);
  readonly language = inject(LanguageService);
  readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly searchQuery = signal('');

  /** Scroll direction says "hide" (scrolled down past the threshold). */
  private readonly scrollHidden = signal(false);
  /** Keyboard focus is inside the bar — never slide it away from under the user. */
  private readonly keyboardFocusWithin = signal(false);

  /** Visually hidden: only while scrolling down, never with the mobile menu open or focus inside. */
  readonly isHidden = computed(
    () => this.scrollHidden() && !this.isMobileMenuOpen() && !this.keyboardFocusWithin(),
  );

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    // Scroll events stay outside Angular; signals are only written when a value changes.
    const watcher = zone.runOutsideAngular(() =>
      watchScrollDirection({
        onChange: ({ hidden, scrolled }) => {
          this.scrollHidden.set(hidden);
          this.isScrolled.set(scrolled);
        },
      }),
    );
    watcher.reset(); // initial isScrolled (e.g. reload mid-page)

    // Route change / scroll restoration: always start from a visible bar at the new position.
    const sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.closeMobileMenu();
        watcher.reset();
        // Restoration ('top') scrolls after NavigationEnd; re-baseline once it has settled.
        requestAnimationFrame(() => requestAnimationFrame(() => watcher.reset()));
      }
    });

    destroyRef.onDestroy(() => {
      watcher.destroy();
      sub.unsubscribe();
    });
  }

  onFocusIn(event: FocusEvent): void {
    // Only keyboard focus pins the bar; a mouse click on a button shouldn't.
    const target = event.target as HTMLElement | null;
    if (target?.matches?.(':focus-visible')) this.keyboardFocusWithin.set(true);
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) {
      this.keyboardFocusWithin.set(false);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const q = this.searchQuery().trim();
    if (!q) return;
    this.closeMobileMenu();
    void this.router.navigate(['/search'], { queryParams: { q } });
    this.searchQuery.set('');
  }

  navigateToSearch(): void {
    this.closeMobileMenu();
    void this.router.navigate(['/search']);
  }
}
