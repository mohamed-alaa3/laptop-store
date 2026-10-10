import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(path), {
      params: this.buildParams(params),
    });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.delete<T>(this.url(path), {
      params: this.buildParams(params),
    });
  }

  /**
   * POST multipart/form-data (for file uploads).
   */
  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(this.url(path), formData);
  }

  private url(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      httpParams = httpParams.set(key, String(value));
    }

    return httpParams;
  }
}
