import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('tinytag-token');
  if (!token) {
    return router.parseUrl('/login');
  }

  if (!auth.currentUser()) {
    try {
      const res = await lastValueFrom(auth.getProfile());
      if (res?.data) {
        auth.currentUser.set(res.data);
      }
      return true;
    } catch {
      auth.logout();
      return router.parseUrl('/login');
    }
  }

  return true;
};
