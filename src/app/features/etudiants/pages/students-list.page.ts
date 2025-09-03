import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../../features/etudiants/students.service';
import { Student } from '../../../features/etudiants/student.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="space-y-4">
      <header class="flex items-end gap-3 flex-wrap">
        <div class="flex-1 min-w-[240px]">
          <label for="search" class="block text-sm font-medium text-gray-700">Recherche</label>
          <div class="relative">
            <input
              #q
              id="search"
              type="search"
              (input)="onSearch(q.value)"
              placeholder="Nom, prénom, email…"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        <a
          *ngIf="isAdmin()"
          routerLink="/etudiants/nouveau"
          class="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring"
          >Ajouter</a
        >

        <div class="text-sm text-gray-600 ml-auto">
          {{ filteredCount() }} résultat(s) — page {{ page() }} / {{ totalPages() }}
        </div>
      </header>

      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Prénom
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Nom
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Naissance
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Créé le
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                *ngIf="isAdmin()"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let s of pageItems(); trackBy: trackById" class="hover:bg-gray-50">
              <td class="px-4 py-2">
                <a [routerLink]="['/etudiants', s.id]" class="text-indigo-700 hover:underline">{{
                  s.firstName
                }}</a>
              </td>
              <td class="px-4 py-2 font-medium">
                <a [routerLink]="['/etudiants', s.id]" class="text-indigo-700 hover:underline">{{
                  s.lastName
                }}</a>
              </td>
              <td class="px-4 py-2">{{ s.email }}</td>
              <td class="px-4 py-2">{{ s.birthDate }}</td>
              <td class="px-4 py-2">{{ s.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td class="px-4 py-2 text-right" *ngIf="isAdmin()">
                <a
                  [routerLink]="['/etudiants', s.id, 'edition']"
                  class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
                  >Éditer</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="flex items-center justify-between gap-2">
        <button
          type="button"
          (click)="prevPage()"
          [disabled]="page() === 1"
          class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring"
        >
          Précédent
        </button>

        <div class="text-sm text-gray-700">
          {{ (page() - 1) * pageSize + 1 }}–{{ Math.min(page() * pageSize, filteredCount()) }} /
          {{ filteredCount() }}
        </div>

        <button
          type="button"
          (click)="nextPage()"
          [disabled]="page() >= totalPages()"
          class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring"
        >
          Suivant
        </button>
      </footer>
    </section>
  `,
})
export class StudentsListPage {
  private readonly studentsSvc = inject(StudentsService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = () => this.auth.role() === 'admin';

  readonly pageSize = 10;
  readonly page = signal(1);
  readonly query = signal('');

  constructor() {
    // charge initiale (délais mock)

    this.studentsSvc.getAll();
  }

  readonly students = computed<Student[]>(() => this.studentsSvc.students());

  readonly filtered = computed<Student[]>(() => {
    const q = this.query().trim().toLowerCase();
    let arr = this.students();

    if (q.length > 0) {
      arr = arr.filter((s) => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(q));
    }

    // tri asc : nom puis prénom
    return [...arr].sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName);
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName);
    });
  });

  readonly filteredCount = computed(() => this.filtered().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCount() / this.pageSize)),
  );

  readonly pageItems = computed<Student[]>(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  onSearch(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update((v) => v + 1);
  }

  prevPage(): void {
    if (this.page() > 1) this.page.update((v) => v - 1);
  }

  trackById(_i: number, s: Student): number {
    return s.id;
  }

  readonly Math = Math;
}
