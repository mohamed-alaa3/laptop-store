import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './shared/components/toast-container/toast-container';
import { ThemeService } from './core/services/theme';
import { LanguageService } from './core/services/language';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Injecting these ensures they initialize on app startup
  readonly theme = inject(ThemeService);
  readonly language = inject(LanguageService);
}
