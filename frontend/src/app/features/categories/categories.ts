import { Component, inject, signal, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category';
import { LanguageService } from '../../core/services/language';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { StaggerDirective } from '../../shared/directives/stagger.directive';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import type { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, Skeleton, EmptyState, StaggerDirective, ScrollRevealDirective],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  readonly language = inject(LanguageService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    await this.categoryService.loadAll();
    this.categories.set(this.categoryService.categories());
    this.loading.set(false);
  }

  getCategoryName(cat: Category): string {
    return this.language.language() === 'ar' ? cat.name.ar : cat.name.en;
  }

  getCategoryDescription(cat: Category): string {
    if (!cat.description) return '';
    return this.language.language() === 'ar' ? cat.description.ar : cat.description.en;
  }

  getIconForCategory(slug: string): string {
    const icons: Record<string, string> = {
      laptops: 'laptop',
      'desktop-pcs': 'desktop',
      monitors: 'monitor',
      accessories: 'headphones',
      gaming: 'gamepad',
    };
    return icons[slug] ?? 'box';
  }
}
