import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const COURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/courses-list.page').then((m) => m.CoursesListPage),
  },
  {
    path: 'nouveau',
    canActivate: [RoleGuard('admin')],
    loadComponent: () => import('./pages/course-form.page').then((m) => m.CourseFormPage),
  },
  {
    path: ':id/edition',
    canActivate: [RoleGuard('admin')],
    loadComponent: () => import('./pages/course-form.page').then((m) => m.CourseFormPage),
  },
];
