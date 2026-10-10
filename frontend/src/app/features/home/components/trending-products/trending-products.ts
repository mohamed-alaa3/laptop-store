import { Component, inject, signal, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductSkeleton } from '../../../../shared/components/product-skeleton/product-skeleton';
import { StaggerDirective } from '../../../../shared/directives/stagger.directive';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
import { ProductService } from '../../../../core/services/product';
import { LanguageService } from '../../../../core/services/language';
import type { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-trending-products',
  imports: [RouterLink, ProductCard, ProductSkeleton, StaggerDirective, ScrollRevealDirective],
  templateUrl: './trending-products.html',
  styleUrl: './trending-products.css',
})
export class TrendingProducts implements OnInit {
  private readonly productService = inject(ProductService);
  readonly language = inject(LanguageService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    const featured = await this.productService.loadFeatured(8);
    this.products.set(featured);
    this.loading.set(false);
  }
}
