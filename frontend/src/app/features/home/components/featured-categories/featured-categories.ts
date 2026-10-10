import { Component, inject, signal, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../../core/services/category';
import { LanguageService } from '../../../../core/services/language';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import type { Category } from '../../../../core/models/category.model';
import { StaggerDirective } from '../../../../shared/directives/stagger.directive';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
@Component({
  selector: 'app-featured-categories',
  imports: [RouterLink, Skeleton, StaggerDirective, ScrollRevealDirective, EmptyState],
  templateUrl: './featured-categories.html',
  styleUrl: './featured-categories.css',
})
export class FeaturedCategories implements OnInit {
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

  getCategoryName(category: Category): string {
    return this.language.language() === 'ar' ? category.name.ar : category.name.en;
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
