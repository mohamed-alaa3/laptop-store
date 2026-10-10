import { Component, input, output, signal, inject, HostListener, ElementRef } from '@angular/core';
import { LanguageService } from '../../../../core/services/language';
import type { ProductSort } from '../../../../core/models/product.model';

interface SortOption {
  value: ProductSort;
  labelKey: string;
}

@Component({
  selector: 'app-sort-dropdown',
  imports: [],
  templateUrl: './sort-dropdown.html',
  styleUrl: './sort-dropdown.css',
})
export class SortDropdown {
  private readonly elementRef = inject(ElementRef);
  readonly language = inject(LanguageService);

  readonly value = input<ProductSort>('newest');
  readonly changed = output<ProductSort>();

  readonly isOpen = signal(false);

  readonly options: SortOption[] = [
    { value: 'newest', labelKey: 'shop.sort.newest' },
    { value: 'oldest', labelKey: 'shop.sort.oldest' },
    { value: 'price-asc', labelKey: 'shop.sort.priceAsc' },
    { value: 'price-desc', labelKey: 'shop.sort.priceDesc' },
    { value: 'name-asc', labelKey: 'shop.sort.nameAsc' },
    { value: 'name-desc', labelKey: 'shop.sort.nameDesc' },
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  select(option: SortOption): void {
    this.changed.emit(option.value);
    this.isOpen.set(false);
  }

  getCurrentLabel(): string {
    const opt = this.options.find((o) => o.value === this.value());
    return opt ? this.language.t(opt.labelKey) : this.language.t('shop.sort.newest');
  }
}
