import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../logo/logo';
import { LanguageService } from '../../../core/services/language';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly language = inject(LanguageService);
  readonly currentYear = new Date().getFullYear();
  readonly whatsappNumber = environment.whatsappNumber;

  readonly whatsappLink = `https://wa.me/${environment.whatsappNumber}`;
}
