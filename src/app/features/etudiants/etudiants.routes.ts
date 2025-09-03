import { Routes } from '@angular/router';

export const ETUDIANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/students-list.page').then((m) => m.StudentsListPage),
  },
];
