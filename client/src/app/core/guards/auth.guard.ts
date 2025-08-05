import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Login'e yönlendir ama hata sayfasına değil
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url },
      replaceUrl: true 
    });
    return false;
  }
};
