export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}
export interface AdminUser {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}