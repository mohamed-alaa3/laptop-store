import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const routes: Routes = [
  // ─── Admin Login (standalone) ────────────────────────
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login').then((m) => m.AdminLogin),
    title: 'Admin Login · Click',
  },

  // ─── Admin (protected) ───────────────────────────────
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.AdminDashboard),
        title: 'Dashboard · Admin · Click',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/list/products-list').then((m) => m.AdminProductsList),
        title: 'Products · Admin · Click',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/admin/products/form/product-form').then((m) => m.AdminProductForm),
        title: 'New Product · Admin · Click',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/admin/products/form/product-form').then((m) => m.AdminProductForm),
        title: 'Edit Product · Admin · Click',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/categories').then((m) => m.AdminCategories),
        title: 'Categories · Admin · Click',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/list/products-list').then((m) => m.AdminProductsList),
        title: 'Products · Admin · Click',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/categories').then((m) => m.AdminCategories),
        title: 'Categories · Admin · Click',
      },
    ],
  },

  // ─── Public site ─────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Click — Premium Computers & Tech',
      },
      {
        path: 'shop',
        loadComponent: () => import('./features/shop/shop').then((m) => m.Shop),
        title: 'Shop · Click',
      },
      {
        path: 'product/:slug',
        loadComponent: () =>
          import('./features/product-details/product-details').then((m) => m.ProductDetails),
        title: 'Product · Click',
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search').then((m) => m.Search),
        title: 'Search · Click',
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/wishlist/wishlist').then((m) => m.Wishlist),
        title: 'Wishlist · Click',
      },
      {
        path: 'compare',
        loadComponent: () => import('./features/compare/compare').then((m) => m.Compare),
        title: 'Compare · Click',
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
        title: 'Categories · Click',
      },
    ],
  },

  // ─── 404 ─────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Not Found · Click',
  },
];
