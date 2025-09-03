import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function RoleGuard(required: 'admin' | 'etudiant'): CanActivateFn {
  return (): true | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    const role = auth.role();
    if (role === required) {
      return true;
    }

    // Accès refusé → redirige vers dashboard
    return router.createUrlTree(['/dashboard']);
  };
}
