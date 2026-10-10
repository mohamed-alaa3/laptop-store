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
  selector: '[appStagger]',
  standalone: true,
})
export class StaggerDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  /** Delay between each child in ms. */
  readonly staggerDelay = input<number>(80, { alias: 'appStaggerDelay' });

  /** Threshold for the IntersectionObserver. */
  readonly staggerThreshold = input<number>(0.1, {
    alias: 'appStaggerThreshold',
  });

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      this.el.nativeElement.classList.add('stagger-visible');
      return;
    }

    this.el.nativeElement.classList.add('stagger-container');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const children = Array.from(target.children) as HTMLElement[];
            const baseDelay = this.staggerDelay();

            children.forEach((child, index) => {
              child.style.transitionDelay = `${index * baseDelay}ms`;
            });

            target.classList.add('stagger-visible');
            this.observer?.unobserve(target);
          }
        }
      },
      {
        threshold: this.staggerThreshold(),
        rootMargin: '0px 0px -50px 0px',
      },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
