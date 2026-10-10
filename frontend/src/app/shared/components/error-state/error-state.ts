import { Component, input, output } from '@angular/core';

export type ErrorStateIcon = 'network' | 'server' | 'not-found' | 'warning';

@Component({
  selector: 'app-error-state',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <!-- Icon -->
      <div
        class="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        [style.background-color]="getIconBg()"
        [style.color]="getIconColor()"
      >
        @switch (icon()) {
          @case ('network') {
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
              <path d="m2 2 20 20" />
              <path d="M8.5 16.5a5 5 0 0 1 7 0" />
              <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
              <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
              <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
              <path d="M5 13a10 10 0 0 1 5.24-2.76" />
              <line x1="12" x2="12.01" y1="20" y2="20" />
            </svg>
          }
          @case ('server') {
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
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
              <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
              <line x1="6" x2="6.01" y1="6" y2="6" />
              <line x1="6" x2="6.01" y1="18" y2="18" />
            </svg>
          }
          @case ('not-found') {
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
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
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

      <!-- Retry button -->
      @if (showRetry()) {
        <button
          type="button"
          (click)="retry.emit()"
          class="inline-flex items-center gap-2 px-5 h-10 rounded-full
                 bg-[var(--accent)] text-[var(--accent-foreground)]
                 text-sm font-medium hover:bg-[var(--accent-hover)]
                 transition-colors focus-ring active:scale-[0.97]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          {{ retryLabel() }}
        </button>
      }
    </div>
  `,
})
export class ErrorState {
  readonly icon = input<ErrorStateIcon>('warning');
  readonly title = input<string>('Something went wrong');
  readonly description = input<string>('');
  readonly showRetry = input<boolean>(true);
  readonly retryLabel = input<string>('Try again');

  readonly retry = output<void>();

  getIconBg(): string {
    switch (this.icon()) {
      case 'network':
        return 'color-mix(in srgb, var(--warning) 12%, transparent)';
      case 'server':
        return 'color-mix(in srgb, var(--danger) 12%, transparent)';
      case 'not-found':
        return 'var(--surface)';
      default:
        return 'color-mix(in srgb, var(--warning) 12%, transparent)';
    }
  }

  getIconColor(): string {
    switch (this.icon()) {
      case 'network':
        return 'var(--warning)';
      case 'server':
        return 'var(--danger)';
      case 'not-found':
        return 'var(--text-muted)';
      default:
        return 'var(--warning)';
    }
  }
}
