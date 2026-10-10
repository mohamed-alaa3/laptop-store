import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { LanguageService } from '../../../core/services/language';
import { ThemeService } from '../../../core/services/theme';
import { ToastService } from '../../../core/services/toast';
import { Logo } from '../../../shared/components/logo/logo';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { LanguageToggle } from '../../../shared/components/language-toggle/language-toggle';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, ThemeToggle, LanguageToggle],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly language = inject(LanguageService);
  readonly theme = inject(ThemeService);

  readonly isSidebarOpen = signal(false);
  readonly isMobileSidebarOpen = signal(false);

  readonly user = this.auth.user;

  toggleSidebar(): void {
    this.isSidebarOpen.update((v) => !v);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.toast.info(this.language.language() === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
    void this.router.navigate(['/admin/login']);
  }

  getInitial(): string {
    const username = this.user()?.username ?? 'A';
    return username.charAt(0).toUpperCase();
  }
}
