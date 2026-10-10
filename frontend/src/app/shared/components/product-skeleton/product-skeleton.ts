import { Component } from '@angular/core';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-product-skeleton',
  imports: [Skeleton],
  template: `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
      <!-- Image area -->
      <div class="relative aspect-[4/3] overflow-hidden">
        <app-skeleton variant="accent" shape="rect" width="100%" height="100%" />

        <!-- Badge placeholders -->
        <div class="absolute top-3 start-3 flex gap-1.5">
          <app-skeleton shape="rect" width="48px" height="20px" />
          <app-skeleton shape="rect" width="36px" height="20px" />
        </div>
      </div>

      <!-- Content area -->
      <div class="p-4 space-y-3">
        <!-- Brand -->
        <app-skeleton width="30%" height="0.625rem" />

        <!-- Name -->
        <div class="space-y-1.5">
          <app-skeleton width="90%" height="0.875rem" />
          <app-skeleton width="60%" height="0.875rem" />
        </div>

        <!-- Specs chips -->
        <div class="flex gap-1.5 pt-1">
          <app-skeleton shape="rect" width="60px" height="18px" />
          <app-skeleton shape="rect" width="72px" height="18px" />
        </div>

        <!-- Price + button -->
        <div class="flex items-end justify-between gap-2 pt-2">
          <div class="space-y-1.5 flex-1">
            <app-skeleton width="50%" height="1rem" />
            <app-skeleton width="30%" height="0.625rem" />
          </div>
          <app-skeleton shape="circle" width="36px" height="36px" />
        </div>
      </div>
    </div>
  `,
})
export class ProductSkeleton {}
