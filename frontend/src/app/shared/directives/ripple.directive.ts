import { Directive, ElementRef, inject, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appRipple]',
  standalone: true,
  host: {
    style: 'position: relative; overflow: hidden;',
  },
})
export class RippleDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const target = this.el.nativeElement;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.className = 'ripple-effect';

    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}
