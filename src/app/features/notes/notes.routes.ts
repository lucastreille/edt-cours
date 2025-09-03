import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/notes-list.page').then((m) => m.NotesListPage),
  },
  {
    path: 'nouvelle',
    canActivate: [RoleGuard('admin')],
    loadComponent: () => import('./pages/note-form.page').then((m) => m.NoteFormPage),
  },
  {
    path: ':id/edition',
    canActivate: [RoleGuard('admin')],
    loadComponent: () => import('./pages/note-form.page').then((m) => m.NoteFormPage),
  },
];
