import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'etudiants',
    loadChildren: () =>
      import('./features/etudiants/etudiants.routes').then((m) => m.ETUDIANTS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'cours',
    loadChildren: () => import('./features/cours/cours.routes').then((m) => m.COURS_ROUTES),
    canActivate: [AuthGuard, RoleGuard('admin')], // réservé aux admins
  },
  {
    path: 'notes',
    loadChildren: () => import('./features/notes/notes.routes').then((m) => m.NOTES_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
