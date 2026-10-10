import { Component, input, inject } from '@angular/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { LanguageService } from '../../../../core/services/language';
import type { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-related-products',
  imports: [ProductCard, Skeleton],
  templateUrl: './related-products.html',
  styleUrl: './related-products.css',
})
export class RelatedProducts {
  readonly products = input.required<Product[]>();
  readonly loading = input<boolean>(false);
  readonly language = inject(LanguageService);
}
