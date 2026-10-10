import { Component, inject } from '@angular/core';
import { ToastService, type Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-toast-container',
  imports: [],
  template: `
    <div
      class="fixed top-20 end-4 z-[100] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto min-w-[280px] max-w-[400px] p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-fade-in-down"
          [class]="getClasses(toast)"
          role="alert"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              }
              @case ('error') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              }
              @case ('info') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
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

          <!-- Message -->
          <p class="flex-1 text-sm font-medium leading-snug">
            {{ toast.message }}
          </p>

          <!-- Close -->
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  readonly toastService = inject(ToastService);

  getClasses(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'bg-[var(--badge-new-bg)] border-[var(--badge-new-fg)]/20 text-[var(--badge-new-fg)]';
      case 'error':
        return 'bg-[var(--badge-sale-bg)] border-[var(--badge-sale-fg)]/20 text-[var(--badge-sale-fg)]';
      case 'info':
      default:
        return 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)]';
    }
  }
}
