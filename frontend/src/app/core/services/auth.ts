import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { AdminUser, LoginResponse } from '../models/api-response.model';
import type { ApiSuccessResponse } from '../models/api-response.model';

const TOKEN_KEY = 'click-admin-token';
const USER_KEY = 'click-admin-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly _user = signal<AdminUser | null>(this.loadUser());
  private readonly _token = signal<string | null>(this.loadToken());

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null && this._user() !== null);

  async login(identifier: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.api.post<ApiSuccessResponse<LoginResponse>>('/admin/login', {
        username: identifier,
        password,
      }),
    );

    this._token.set(response.data.token);
    this._user.set(response.data.admin);

    this.persistToken(response.data.token);
    this.persistUser(response.data.admin);
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private loadToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  }

  private persistToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private persistUser(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}
