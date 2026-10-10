import {
  Component,
  inject,
  signal,
  HostListener,
  type OnInit,
  type OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from '../../../../shared/components/button/button';
import { LanguageService } from '../../../../core/services/language';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, Button],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly language = inject(LanguageService);

  readonly isMounted = signal(false);
  readonly scrollY = signal(0);

  private ticking = false;
  private prefersReduced = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.prefersReduced) {
      this.isMounted.set(true);
      return;
    }

    requestAnimationFrame(() => {
      this.isMounted.set(true);
    });
  }

  ngOnDestroy(): void {
    this.ticking = false;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.prefersReduced) return;

    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.scrollY.set(window.scrollY);
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  getParallaxOffset(multiplier: number): number {
    if (this.prefersReduced) return 0;
    return Math.min(this.scrollY() * multiplier, 200);
  }
}
