import { Routes } from '@angular/router';

export const COURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/courses-list.page').then((m) => m.CoursesListPage),
  },
];
