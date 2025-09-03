import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotesService } from '../../../features/notes/notes.service';
import { StudentsService } from '../../../features/etudiants/students.service';
import { CoursesService } from '../../../features/cours/courses.service';
import { AuthService } from '../../../core/services/auth.service';
import { GradePipe } from '../../../shared/pipes/grade.pipe';
import { DurationAgoPipe } from '../../../shared/pipes/duration-ago.pipe';

interface EnrichedNote {
  id: number;
  studentId: number;
  courseId: number;
  value: number;
  date: string;
  createdAt: string;
  studentName: string;
  courseTitle: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, GradePipe, DurationAgoPipe],
  template: `
    <section class="space-y-6">
      <header class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Notes</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Filtrez par étudiant, par cours, ou recherchez
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            *ngIf="isAdmin()"
            routerLink="/notes/nouvelle"
            class="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >Ajouter</a
          >
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ filteredCount() }} note(s)</div>
        </div>
      </header>

      <!-- Filtres -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <!-- Étudiant -->
        <div>
          <label for="student" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >Étudiant</label
          >
          <select
            id="student"
            #studentSel
            class="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            (change)="onStudentChange(studentSel.value)"
          >
            <option [selected]="selectedStudentId() === null" value="">Tous</option>
            <option
              *ngFor="let s of students(); trackBy: trackByStudentId"
              [value]="s.id"
              [selected]="selectedStudentId() === s.id"
            >
              {{ s.lastName }} {{ s.firstName }}
            </option>
          </select>
        </div>

        <!-- Cours -->
        <div>
          <label for="course" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >Cours</label
          >
          <select
            id="course"
            #courseSel
            class="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            (change)="onCourseChange(courseSel.value)"
          >
            <option [selected]="selectedCourseId() === null" value="">Tous</option>
            <option
              *ngFor="let c of courses(); trackBy: trackByCourseId"
              [value]="c.id"
              [selected]="selectedCourseId() === c.id"
            >
              {{ c.title }}
            </option>
          </select>
        </div>

        <!-- Recherche -->
        <div class="md:col-span-2">
          <label for="q" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >Recherche</label
          >
          <input
            id="q"
            #q
            type="search"
            class="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nom étudiant, cours, date…"
            (input)="onQueryChange(q.value)"
          />
        </div>
      </div>

      <!-- Résumé moyenne -->
      <div *ngIf="avgText()" class="text-sm text-gray-700 dark:text-gray-300">
        {{ avgText() }}
      </div>

      <!-- Liste -->
      <div
        class="overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-800"
      >
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300">
            <tr>
              <th class="px-4 py-3 text-left font-medium">Date</th>
              <th class="px-4 py-3 text-left font-medium">Étudiant</th>
              <th class="px-4 py-3 text-left font-medium">Cours</th>
              <th class="px-4 py-3 text-right font-medium">Note /20</th>
              <th *ngIf="isAdmin()" class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200/70 dark:divide-gray-800">
            <tr
              *ngFor="let n of visible(); trackBy: trackByNoteId"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-2">
                <div>{{ n.date }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ n.createdAt | durationAgo }}
                </div>
              </td>
              <td class="px-4 py-2">{{ n.studentName }}</td>
              <td class="px-4 py-2">{{ n.courseTitle }}</td>
              <td class="px-4 py-2 text-right font-semibold">
                {{ n.value }} / 20
                <span class="ml-1 text-xs text-gray-600 dark:text-gray-400"
                  >({{ n.value | grade }})</span
                >
              </td>

              <td *ngIf="isAdmin()" class="px-4 py-2 text-right">
                <div class="inline-flex items-center gap-2">
                  <a
                    [routerLink]="['/notes', n.id, 'edition']"
                    class="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Éditer la note"
                    >Éditer</a
                  >
                  <button
                    type="button"
                    (click)="onDelete(n.id)"
                    [disabled]="deletingId() === n.id"
                    class="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-60"
                    aria-label="Supprimer la note"
                  >
                    {{ deletingId() === n.id ? 'Suppression…' : 'Supprimer' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="pageItems().length === 0">
              <td
                class="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                [attr.colspan]="isAdmin() ? 5 : 4"
              >
                Aucun résultat
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
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
          {{ startIndex() + 1 }}–{{ endIndex() }} / {{ filteredCount() }} (page {{ page() }} /
          {{ totalPages() }})
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
export class NotesListPage {
  private readonly notesSvc = inject(NotesService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly coursesSvc = inject(CoursesService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = () => this.auth.role() === 'admin';

  // filtres + pagination
  readonly selectedStudentId = signal<number | null>(null);
  readonly selectedCourseId = signal<number | null>(null);
  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  // état suppression
  readonly deletingId = signal<number | null>(null);

  constructor() {
    this.notesSvc.getAll();

    this.studentsSvc.getAll();

    this.coursesSvc.getAll();
  }

  // sources
  readonly students = computed(() =>
    [...this.studentsSvc.students()].sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName);
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName);
    }),
  );

  readonly courses = computed(() =>
    [...this.coursesSvc.courses()].sort((a, b) => a.order - b.order),
  );

  readonly notes = computed<EnrichedNote[]>(() =>
    [...this.notesSvc.enriched()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );

  readonly visible = computed(() => {
    const u = this.auth.user();
    const all = this.notesSvc.enriched(); // garde l'enrichissement (noms/titres)
    if (!u) return [];
    if (u.role === 'admin') return all;
    const sid = u.studentId;
    if (!Number.isFinite(sid as number)) return [];
    return all.filter((n) => n.studentId === (sid as number));
  });

  // filtrage
  readonly filtered = computed<EnrichedNote[]>(() => {
    const sid = this.selectedStudentId();
    const cid = this.selectedCourseId();
    const q = this.query().trim().toLowerCase();

    let arr = this.notes();

    if (sid !== null) arr = arr.filter((n) => n.studentId === sid);
    if (cid !== null) arr = arr.filter((n) => n.courseId === cid);
    if (q) {
      arr = arr.filter((n) =>
        `${n.studentName} ${n.courseTitle} ${n.value} ${n.date}`.toLowerCase().includes(q),
      );
    }
    return arr;
  });

  readonly filteredCount = computed(() => this.filtered().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCount() / this.pageSize)),
  );
  readonly startIndex = computed(() => (this.page() - 1) * this.pageSize);
  readonly endIndex = computed(() =>
    Math.min(this.startIndex() + this.pageSize, this.filteredCount()),
  );
  readonly pageItems = computed<EnrichedNote[]>(() =>
    this.filtered().slice(this.startIndex(), this.endIndex()),
  );

  // résumé moyenne
  readonly avgText = computed(() => {
    const sid = this.selectedStudentId();
    const cid = this.selectedCourseId();
    if (sid !== null) {
      const v = this.notesSvc.avgByStudent(sid);
      return v === null ? null : `Moyenne de l'étudiant sélectionné : ${v} / 20`;
    }
    if (cid !== null) {
      const v = this.notesSvc.avgByCourse(cid);
      return v === null ? null : `Moyenne du cours sélectionné : ${v} / 20`;
    }
    return null;
  });

  // events UI
  onStudentChange(val: string): void {
    const parsed = val ? Number(val) : null;
    this.selectedStudentId.set(Number.isFinite(parsed as number) ? (parsed as number) : null);
    this.page.set(1);
  }
  onCourseChange(val: string): void {
    const parsed = val ? Number(val) : null;
    this.selectedCourseId.set(Number.isFinite(parsed as number) ? (parsed as number) : null);
    this.page.set(1);
  }
  onQueryChange(val: string): void {
    this.query.set(val);
    this.page.set(1);
  }
  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update((p) => p + 1);
  }
  prevPage(): void {
    if (this.page() > 1) this.page.update((p) => p - 1);
  }

  // suppression avec confirm + clamp pagination
  async onDelete(id: number): Promise<void> {
    if (!this.isAdmin()) return;
    const ok = window.confirm('Supprimer cette note ?');
    if (!ok) return;

    this.deletingId.set(id);
    try {
      await this.notesSvc.remove(id);

      // Clamp pagination si on se retrouve sur une page vide
      // (recalcule après la suppression grâce aux signals)
      const pages = this.totalPages();
      if (this.page() > pages) {
        this.page.set(pages);
      }
    } catch {
      alert('Suppression impossible.');
    } finally {
      this.deletingId.set(null);
    }
  }

  // trackBys
  trackByNoteId(_i: number, n: EnrichedNote): number {
    return n.id;
  }
  trackByStudentId(_i: number, s: { id: number }): number {
    return s.id;
  }
  trackByCourseId(_i: number, c: { id: number }): number {
    return c.id;
  }
}
