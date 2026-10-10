import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

export type EmptyStateIcon = 'search' | 'heart' | 'compare' | 'box' | 'info' | 'folder' | 'cart';

export type EmptyStateVariant = 'default' | 'accent';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <!-- Icon -->
      <div
        class="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-105"
        [class]="iconClasses()"
      >
        @switch (icon()) {
          @case ('search') {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          }
          @case ('heart') {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              />
            </svg>
          }
          @case ('compare') {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m16 16 4 4 4-4" />
              <path d="M20 20V4" />
              <path d="m8 8-4-4-4 4" />
              <path d="M4 4v16" />
            </svg>
          }
          @case ('folder') {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
              />
            </svg>
          }
          @case ('cart') {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path
                d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
              />
            </svg>
          }
          @case ('box') {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
              />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          }
          @default {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          }
        }
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {{ title() }}
      </h3>

      <!-- Description -->
      @if (description()) {
        <p class="text-sm text-[var(--text-secondary)] max-w-md mb-6">
          {{ description() }}
        </p>
      }

      <!-- Action button -->
      @if (actionLabel() && actionLink()) {
        <a
          [routerLink]="actionLink()"
          class="inline-flex items-center gap-2 px-5 h-10 rounded-full
                 bg-[var(--accent)] text-[var(--accent-foreground)]
                 text-sm font-medium hover:bg-[var(--accent-hover)]
                 transition-colors focus-ring active:scale-[0.97]"
        >
          {{ actionLabel() }}
        </a>
      }
    </div>
  `,
})
export class EmptyState {
  readonly icon = input<EmptyStateIcon>('box');
  readonly title = input<string>('Nothing here');
  readonly description = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionLink = input<string>('');
  readonly variant = input<EmptyStateVariant>('default');

  readonly iconClasses = computed(() => {
    if (this.variant() === 'accent') {
      return 'bg-[var(--accent-soft)] text-[var(--accent)]';
    }
    return 'bg-[var(--surface)] text-[var(--text-muted)]';
  });
}
