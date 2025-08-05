// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/shortener/pages/shortener-page/shortener-page').then(m => m.ShortenerPageComponent)
  },
  {
    path: 'shortener',
    loadComponent: () => import('./features/shortener/pages/shortener-page/shortener-page').then(m => m.ShortenerPageComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing-module').then(m => m.AuthRoutingModule)
  },
  // Error Testing (for development)
  {
    path: 'error-test',
    loadComponent: () => import('./shared/components/error-test/error-test').then(m => m.ErrorTestComponent)
  },
  // Error Pages
  {
    path: 'error/404',
    loadComponent: () => import('./shared/components/error-pages/not-found/not-found').then(m => m.NotFoundComponent)
  },
  {
    path: 'error/500',
    loadComponent: () => import('./shared/components/error-pages/server-error/server-error').then(m => m.ServerErrorComponent)
  },
  {
    path: 'error/403',
    loadComponent: () => import('./shared/components/error-pages/access-denied/access-denied').then(m => m.AccessDeniedComponent)
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./shared/components/error-pages/maintenance/maintenance').then(m => m.MaintenanceComponent)
  },
  // Catch all - redirect to 404 error page
  {
    path: '**',
    loadComponent: () => import('./shared/components/error-pages/not-found/not-found').then(m => m.NotFoundComponent)
  }
];