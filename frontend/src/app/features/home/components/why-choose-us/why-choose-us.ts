import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../../core/services/language';
import { StaggerDirective } from '../../../../shared/directives/stagger.directive';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
interface Feature {
  key: 'fastShipping' | 'warranty' | 'support' | 'securePayment';
  icon: 'truck' | 'shield' | 'headset' | 'lock';
  accent: string;
}

@Component({
  selector: 'app-why-choose-us',
  imports: [StaggerDirective, ScrollRevealDirective],
  templateUrl: './why-choose-us.html',
  styleUrl: './why-choose-us.css',
})
export class WhyChooseUs {
  readonly language = inject(LanguageService);

  readonly features: Feature[] = [
    {
      key: 'fastShipping',
      icon: 'truck',
      accent: '#0066FF',
    },
    {
      key: 'warranty',
      icon: 'shield',
      accent: '#10B981',
    },
    {
      key: 'support',
      icon: 'headset',
      accent: '#F59E0B',
    },
    {
      key: 'securePayment',
      icon: 'lock',
      accent: '#7C3AED',
    },
  ];
}
