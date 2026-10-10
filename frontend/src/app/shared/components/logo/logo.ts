import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  template: `
    <div
      class="flex items-center gap-2 select-none"
      [style.font-size.px]="size()"
      [style.--logo-size.px]="size()"
    >
      <!-- Mouse icon (SVG) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="size() * 1.15"
        [attr.height]="size() * 1.15"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        class="shrink-0"
      >
        <!-- Mouse body -->
        <path
          d="M13 5 C 7 5, 3.5 12, 3.5 22 C 3.5 32, 7.5 38, 13 38 C 18.5 38, 22.5 32, 22.5 22 C 22.5 12, 19 5, 13 5 Z"
          fill="currentColor"
        />

        <!-- Horizontal divider -->
        <rect
          x="3.5"
          y="20.5"
          width="19"
          height="1.6"
          fill="var(--logo-mouse-line, var(--bg-primary))"
        />

        <!-- Scroll wheel -->
        <rect
          x="11"
          y="9"
          width="4"
          height="7"
          rx="2"
          fill="var(--logo-mouse-line, var(--bg-primary))"
        />

        <!-- Wire (cable) -->
        <path
          d="M13 5 C 13 0, 20 -3, 25 0 C 29 2.5, 29 7, 27 9"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          fill="none"
        />
      </svg>

      <!-- "Click" text with red dot on i -->
      <span class="font-bold tracking-tight leading-none" style="color: currentColor">
        Cl<span class="relative inline-block"
          >i<span
            class="absolute rounded-full bg-[var(--logo-dot,#DC2626)]"
            [style.width.px]="size() * 0.19"
            [style.height.px]="size() * 0.19"
            [style.top.px]="size() * 0.04"
            [style.left.px]="size() * 0.44"
          ></span></span
        >ck
      </span>
    </div>
  `,
})
export class Logo {
  /**
   * Font size in pixels. Controls the entire logo scale.
   * Default: 24px (navbar), Footer: 28px, Login: 36px, Hero: 64px.
   */
  readonly size = input<number>(24);
}
