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
    <section class="space-y-6">
      <header class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Étudiants</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Recherchez par nom, prénom ou email
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            *ngIf="isAdmin()"
            routerLink="/etudiants/nouveau"
            class="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >Ajouter</a
          >
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ filteredCount() }} etudiant(s)
          </div>
        </div>
      </header>

      <!-- Filtre recherche (même style que Notes) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="md:col-span-2">
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >Recherche</label
          >
          <div class="relative">
            <input
              #q
              id="search"
              type="search"
              (input)="onSearch(q.value)"
              placeholder="Nom, prénom, email…"
              class="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div
        class="overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-800"
      >
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-medium">Prénom</th>
              <th scope="col" class="px-4 py-3 text-left font-medium">Nom</th>
              <th scope="col" class="px-4 py-3 text-left font-medium">Email</th>
              <th scope="col" class="px-4 py-3 text-left font-medium">Naissance</th>
              <th scope="col" class="px-4 py-3 text-left font-medium">Créé le</th>
              <th *ngIf="isAdmin()" scope="col" class="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200/70 dark:divide-gray-800">
            <tr
              *ngFor="let s of pageItems(); trackBy: trackById"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-2">
                <a
                  [routerLink]="['/etudiants', s.id]"
                  class="text-indigo-700 dark:text-indigo-400 hover:underline"
                  >{{ s.firstName }}</a
                >
              </td>
              <td class="px-4 py-2 font-medium">
                <a
                  [routerLink]="['/etudiants', s.id]"
                  class="text-indigo-700 dark:text-indigo-400 hover:underline"
                  >{{ s.lastName }}</a
                >
              </td>
              <td class="px-4 py-2">{{ s.email }}</td>
              <td class="px-4 py-2">{{ s.birthDate }}</td>
              <td class="px-4 py-2">{{ s.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td *ngIf="isAdmin()" class="px-4 py-2 text-right">
                <a
                  [routerLink]="['/etudiants', s.id, 'edition']"
                  class="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >Éditer</a
                >
                <button
                  type="button"
                  (click)="onDelete(s.id)"
                  class="ml-2 inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  aria-label="Supprimer l'étudiant {{ s.firstName }} {{ s.lastName }}"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (copiée du style Notes) -->
      <footer class="flex items-center justify-between gap-2">
        <button
          type="button"
          (click)="prevPage()"
          [disabled]="page() === 1"
          class="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Précédent
        </button>

        <div class="text-sm text-gray-700 dark:text-gray-300">
          {{ (page() - 1) * pageSize + 1 }}–{{ Math.min(page() * pageSize, filteredCount()) }} /
          {{ filteredCount() }}
        </div>

        <button
          type="button"
          (click)="nextPage()"
          [disabled]="page() >= totalPages()"
          class="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
    this.studentsSvc.getAll();
  }

  readonly students = computed<Student[]>(() => this.studentsSvc.students());

  readonly filtered = computed<Student[]>(() => {
    const q = this.query().trim().toLowerCase();
    let arr = this.students();

    if (q.length > 0) {
      arr = arr.filter((s) => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(q));
    }

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

  async onDelete(id: number): Promise<void> {
    if (!this.isAdmin()) return;
    const ok = confirm('Supprimer cet étudiant ? Cette action est irréversible.');
    if (!ok) return;
    try {
      await this.studentsSvc.remove(id);
      // Si on est sur une page au-delà du max après suppression, clamp
      this.page.update((p) => Math.min(p, this.totalPages()));
    } catch {
      alert('Erreur lors de la suppression');
    }
  }
}
