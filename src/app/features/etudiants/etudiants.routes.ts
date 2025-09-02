import { Routes } from '@angular/router';
import { StudentsListPage } from './pages/students-list.page';

export const ETUDIANTS_ROUTES: Routes = [
  { path: '', component: StudentsListPage, title: 'Étudiants' },
];
