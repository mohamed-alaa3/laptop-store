import { Component, input, signal, computed } from '@angular/core';
import type { ProductImage } from '../../../../core/models/product.model';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {
  readonly images = input.required<ProductImage[]>();
  readonly productName = input.required<string>();

  readonly activeIndex = signal(0);

  readonly hasImages = computed(() => this.images().length > 0);
  readonly activeImage = computed(() => {
    const imgs = this.images();
    if (imgs.length === 0) return null;
    return imgs[this.activeIndex()] ?? imgs[0];
  });

  select(index: number): void {
    if (index < 0 || index >= this.images().length) return;
    this.activeIndex.set(index);
  }

  prev(): void {
    const len = this.images().length;
    if (len === 0) return;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  next(): void {
    const len = this.images().length;
    if (len === 0) return;
    this.activeIndex.update((i) => (i + 1) % len);
  }
}
