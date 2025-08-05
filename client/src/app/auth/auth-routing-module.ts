import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent),
    title: 'Giriş Yap - URL Shortener'
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.RegisterComponent),
    title: 'Kayıt Ol - URL Shortener'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }