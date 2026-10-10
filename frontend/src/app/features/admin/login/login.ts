import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { LanguageService } from '../../../core/services/language';
import { Button } from '../../../shared/components/button/button';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink, Button, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly language = inject(LanguageService);

  readonly username = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();

    const user = this.username().trim();
    const pass = this.password();

    if (!user || !pass) {
      this.error.set(
        this.language.language() === 'ar'
          ? 'الرجاء إدخال اسم المستخدم وكلمة المرور'
          : 'Please enter username and password',
      );
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.login(user, pass);
      this.toast.success(
        this.language.language() === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully',
      );
      void this.router.navigate(['/admin']);
    } catch (err: unknown) {
      let message = this.language.language() === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed';

      if (err && typeof err === 'object' && 'error' in err) {
        const httpError = err as { error?: { message?: string } };
        message = httpError.error?.message ?? message;
      }

      this.error.set(message);
      this.toast.error(message);
    } finally {
      this.loading.set(false);
    }
  }
}
