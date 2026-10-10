import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { WhatsappFloat } from '../../shared/components/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer, WhatsappFloat],
  template: `
    <app-navbar />
    <main class="pt-16 md:pt-20 min-h-[calc(100vh-80px)]">
      <router-outlet (activate)="onActivate()" />
    </main>
    <app-footer />
    <app-whatsapp-float />
  `,
})
export class PublicLayout {
  onActivate(): void {
    // Force a re-trigger of the page-enter animation
    // The animation is applied via CSS to the component itself
  }
}
