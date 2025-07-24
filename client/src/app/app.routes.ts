// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/shortener/pages/shortener-page/shortener-page').then(m => m.ShortenerPageComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing-module').then(m => m.AuthRoutingModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];