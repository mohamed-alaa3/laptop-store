import { Component, input, computed } from '@angular/core';

export type SkeletonShape = 'line' | 'circle' | 'rect';
export type SkeletonVariant = 'default' | 'accent' | 'pulse';

@Component({
  selector: 'app-skeleton',
  imports: [],
  template: ` <div [class]="classes()" [style.width]="width()" [style.height]="height()"></div> `,
  host: {
    class: 'block',
  },
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('line');
  readonly variant = input<SkeletonVariant>('default');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');

  readonly classes = computed(() => {
    const base = ['skeleton'];

    if (this.variant() === 'accent') base.push('skeleton-accent');
    if (this.variant() === 'pulse') base.push('skeleton-pulse');

    const shapeClass =
      this.shape() === 'circle'
        ? 'rounded-full'
        : this.shape() === 'rect'
          ? 'rounded-xl'
          : 'rounded';

    return [...base, shapeClass].join(' ');
  });
}
