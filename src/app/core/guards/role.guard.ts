import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function RoleGuard(requiredRole: 'admin' | 'etudiant'): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated() && auth.role() === requiredRole) {
      return true;
    }

    // sinon → redirection vers dashboard
    router.navigate(['/dashboard']);
    return false;
  };
}
