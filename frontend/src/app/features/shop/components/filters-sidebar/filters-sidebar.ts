import { Component, input, output, inject, computed, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category';
import { LanguageService } from '../../../../core/services/language';
import type { Category } from '../../../../core/models/category.model';
import type { ProductCondition, ProductQuery } from '../../../../core/models/product.model';

interface FilterChange {
  [key: string]: string | number | boolean | undefined;
}

@Component({
  selector: 'app-filters-sidebar',
  imports: [FormsModule],
  templateUrl: './filters-sidebar.html',
  styleUrl: './filters-sidebar.css',
})
export class FiltersSidebar implements OnInit {
  private readonly categoryService = inject(CategoryService);
  readonly language = inject(LanguageService);

  readonly query = input<ProductQuery>({});
  readonly filtered = output<FilterChange>();

  readonly categories = computed<Category[]>(() => this.categoryService.categories());

  readonly loadingCategories = computed(() => this.categoryService.loading());

  // Local state (so we can debounce price inputs)
  readonly minPriceInput = signal<string>('');
  readonly maxPriceInput = signal<string>('');

  // Track which sections are expanded
  readonly expandedSections = signal<Record<string, boolean>>({
    category: true,
    condition: true,
    price: true,
    badges: true,
  });

  ngOnInit(): void {
    const q = this.query();
    this.minPriceInput.set(q.minPrice?.toString() ?? '');
    this.maxPriceInput.set(q.maxPrice?.toString() ?? '');
  }

  isExpanded(section: string): boolean {
    return this.expandedSections()[section] ?? true;
  }

  toggleSection(section: string): void {
    this.expandedSections.update((s) => ({
      ...s,
      [section]: !s[section],
    }));
  }

  getCategoryName(category: Category): string {
    return this.language.language() === 'ar' ? category.name.ar : category.name.en;
  }

  isCategorySelected(categoryId: string): boolean {
    return this.query().category === categoryId;
  }

  selectCategory(categoryId: string): void {
    if (this.isCategorySelected(categoryId)) {
      this.filtered.emit({ category: undefined });
    } else {
      this.filtered.emit({ category: categoryId });
    }
  }

  isConditionSelected(condition: ProductCondition): boolean {
    return this.query().condition === condition;
  }

  selectCondition(condition: ProductCondition): void {
    if (this.isConditionSelected(condition)) {
      this.filtered.emit({ condition: undefined });
    } else {
      this.filtered.emit({ condition });
    }
  }

  toggleFeatured(): void {
    this.filtered.emit({ featured: this.query().featured ? undefined : true });
  }

  toggleNewArrival(): void {
    this.filtered.emit({
      newArrival: this.query().newArrival ? undefined : true,
    });
  }

  toggleOnSale(): void {
    this.filtered.emit({ onSale: this.query().onSale ? undefined : true });
  }

  applyPriceRange(): void {
    const min = this.minPriceInput().trim();
    const max = this.maxPriceInput().trim();

    const minVal = min ? Number(min) : undefined;
    const maxVal = max ? Number(max) : undefined;

    this.filtered.emit({
      minPrice: minVal !== undefined && !isNaN(minVal) ? minVal : undefined,
      maxPrice: maxVal !== undefined && !isNaN(maxVal) ? maxVal : undefined,
    });
  }

  onMinPriceChange(value: string): void {
    this.minPriceInput.set(value);
  }

  onMaxPriceChange(value: string): void {
    this.maxPriceInput.set(value);
  }
}
