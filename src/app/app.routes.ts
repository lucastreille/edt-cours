import { Routes } from '@angular/router';

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
  },
  {
    path: 'etudiants',
    loadChildren: () =>
      import('./features/etudiants/etudiants.routes').then((m) => m.ETUDIANTS_ROUTES),
  },
  {
    path: 'cours',
    loadChildren: () => import('./features/cours/cours.routes').then((m) => m.COURS_ROUTES),
  },
  {
    path: 'notes',
    loadChildren: () => import('./features/notes/notes.routes').then((m) => m.NOTES_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
