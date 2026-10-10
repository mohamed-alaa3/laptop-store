import { Component, inject } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { LanguageService } from '../../../../core/services/language';
import { environment } from '../../../../../environments/environment';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
@Component({
  selector: 'app-whatsapp-cta',
  imports: [Button, ScrollRevealDirective],
  templateUrl: './whatsapp-cta.html',
  styleUrl: './whatsapp-cta.css',
})
export class WhatsappCta {
  readonly language = inject(LanguageService);

  get whatsappLink(): string {
    const message =
      this.language.language() === 'ar' ? 'السلام عليكم، عندي استفسار' : 'Hello, I have a question';
    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  openWhatsApp(): void {
    window.open(this.whatsappLink, '_blank', 'noopener,noreferrer');
  }
}
