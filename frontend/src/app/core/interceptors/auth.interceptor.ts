import { inject } from '@angular/core';
import { type HttpInterceptorFn, type HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();

  // Attach token to all requests if we have one
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Logout on 401 for admin-related requests
      const isAdminRequest =
        req.url.includes('/admin/') ||
        req.url.includes('/upload/') ||
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

      if (error.status === 401 && isAdminRequest) {
        auth.logout();
        void router.navigate(['/admin/login']);
      }

      return throwError(() => error);
    }),
  );
};
