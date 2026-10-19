import {
  Directive,
  ElementRef,
  inject,
  input,
  type OnInit,
  type OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  /** Delay in ms before the reveal animation starts. */
  readonly revealDelay = input<number>(0, { alias: 'appScrollRevealDelay' });

  /** Threshold for the IntersectionObserver (0-1). */
  readonly revealThreshold = input<number>(0.15, {
    alias: 'appScrollRevealThreshold',
  });

  /** Only animate once (default: true). */
  readonly revealOnce = input<boolean>(true, { alias: 'appScrollRevealOnce' });

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Respect reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      this.el.nativeElement.classList.add('is-visible');
      return;
    }

    // Set initial state via class
    this.el.nativeElement.classList.add('scroll-reveal');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const delay = this.revealDelay();

            if (delay > 0) {
              target.style.transitionDelay = `${delay}ms`;
            }

            // Keep `.scroll-reveal` on the element: it carries the transition. Removing it in the
            // same frame as adding `.is-visible` made the reveal snap instead of animate.
            target.classList.add('is-visible');

            if (this.revealOnce()) {
              this.observer?.unobserve(target);
            }
          } else if (!this.revealOnce()) {
            const target = entry.target as HTMLElement;
            target.classList.remove('is-visible');
          }
        }
      },
      {
        threshold: this.revealThreshold(),
        rootMargin: '0px 0px -50px 0px',
      },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
