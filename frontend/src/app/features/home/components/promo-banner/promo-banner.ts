import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../../shared/components/button/button';
import { LanguageService } from '../../../../core/services/language';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
@Component({
  selector: 'app-promo-banner',
  imports: [RouterLink, Button, ScrollRevealDirective],
  templateUrl: './promo-banner.html',
  styleUrl: './promo-banner.css',
})
export class PromoBanner {
  readonly language = inject(LanguageService);
}
