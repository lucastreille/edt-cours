import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const ETUDIANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/students-list.page').then((m) => m.StudentsListPage),
  },
  {
    path: 'nouveau',
    canActivate: [RoleGuard('admin')],
    loadComponent: () => import('./pages/student-form.page').then((m) => m.StudentFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/student-detail.page').then((m) => m.StudentDetailPage),
  },
  {
    path: ':id/edition',
    canActivate: [RoleGuard('admin')],
    loadComponent: () => import('./pages/student-form.page').then((m) => m.StudentFormPage),
  },
];
