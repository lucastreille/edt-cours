import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../../cours/courses.service';
import { NotesService } from '../../notes/notes.service';
import { StudentsService } from '../../etudiants/students.service';
import { AuthService } from '../../../core/services/auth.service';
import { GradePipe } from '../../../shared/pipes/grade.pipe';
import { DurationAgoPipe } from '../../../shared/pipes/duration-ago.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, GradePipe, DurationAgoPipe],
  template: `
    <section class="space-y-10">
      <!-- Header -->
      <header
        class="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-lg"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">
              {{ greeting() }}
            </h1>
            <p class="mt-1 text-sm opacity-80">
              {{ todayStr() }} · {{ isAdmin() ? 'Espace administrateur' : 'Espace étudiant' }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <a
              routerLink="/cours"
              class="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition"
            >
              Gérer les cours
            </a>
            <a
              routerLink="/notes"
              class="px-4 py-2 rounded-xl bg-white text-gray-900 font-medium shadow hover:bg-gray-100 transition"
            >
              Voir les notes
            </a>
          </div>
        </div>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-lg border border-gray-100">
          <p class="text-sm text-gray-500">Moyenne générale</p>
          <p class="mt-3 text-4xl font-extrabold text-indigo-600">{{ avgDisplay() }}</p>
          <p class="mt-1 text-xs text-gray-400">
            Basée sur {{ notesCount() }} note{{ notesCount() > 1 ? 's' : '' }}
          </p>
        </div>
        <div class="rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-lg border border-gray-100">
          <p class="text-sm text-gray-500">Cours planifiés</p>
          <p class="mt-3 text-4xl font-extrabold text-purple-600">{{ coursesCount() }}</p>
          <p class="mt-1 text-xs text-gray-400">Dont {{ upcomingCourses().length }} à venir</p>
        </div>
        <div class="rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-lg border border-gray-100">
          <p class="text-sm text-gray-500">Prochain cours</p>
          <ng-container *ngIf="upcomingCourses().length; else noNext">
            <p class="mt-3 text-lg font-semibold text-gray-900">{{ upcomingCourses()[0].title }}</p>
            <p class="text-sm text-gray-500">Avec {{ upcomingCourses()[0].teacher }}</p>
            <p class="text-xs text-gray-400 mt-1">Le {{ upcomingCourses()[0].date }}</p>
          </ng-container>
          <ng-template #noNext>
            <p class="mt-3 text-lg font-semibold text-gray-900">Aucun à venir</p>
            <p class="text-sm text-gray-500">Planifie un nouveau cours</p>
          </ng-template>
        </div>
      </section>

      <!-- Content -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Upcoming courses -->
        <div class="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50"
          >
            <h2 class="text-lg font-semibold text-gray-900">Cours à venir</h2>
            <a routerLink="/cours" class="text-sm text-indigo-600 hover:underline">Tout voir</a>
          </div>
          <ul class="divide-y divide-gray-100">
            <li
              *ngFor="let c of upcomingCourses(); trackBy: trackByCourseId"
              class="px-6 py-5 hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-medium text-gray-900">{{ c.title }}</p>
                  <p class="text-sm text-gray-500">Avec {{ c.teacher }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-800">{{ c.date }}</p>
                  <p class="text-xs text-gray-400">#{{ c.id }}</p>
                </div>
              </div>
            </li>
            <li *ngIf="!upcomingCourses().length" class="p-6 text-center text-gray-400 text-sm">
              Pas de cours programmés.
            </li>
          </ul>
        </div>

        <!-- Latest notes -->
        <div class="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50"
          >
            <h2 class="text-lg font-semibold text-gray-900">Dernières notes</h2>
            <a routerLink="/notes" class="text-sm text-indigo-600 hover:underline">Tout voir</a>
          </div>
          <ul class="divide-y divide-gray-100">
            <li
              *ngFor="let n of latestNotes(); trackBy: trackByNoteId"
              class="px-6 py-5 hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between gap-6">
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">
                    {{ n.courseTitle }} ·
                    <span class="text-sm text-gray-500">{{
                      isAdmin() ? n.studentName : 'Ma note'
                    }}</span>
                  </p>
                  <p class="text-xs text-gray-400">Ajoutée {{ n.createdAt | durationAgo }}</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-extrabold text-purple-600">{{ n.value }}/20</p>
                  <p class="text-xs text-gray-500">Rang {{ n.value | grade }}</p>
                </div>
              </div>
            </li>
            <li *ngIf="!latestNotes().length" class="p-6 text-center text-gray-400 text-sm">
              Aucune note pour l’instant.
            </li>
          </ul>
        </div>
      </section>
    </section>
  `,
})
export class DashboardPage {
  private readonly coursesSvc = inject(CoursesService);
  private readonly notesSvc = inject(NotesService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  readonly todayStr = computed(() =>
    new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  readonly currentStudentName = computed(() => {
    const sid = this.auth.user()?.studentId;
    if (!sid) return null;
    const s = this.studentsSvc.students().find((s) => s.id === sid);
    return s ? `${s.firstName} ${s.lastName}` : null;
  });

  greeting = computed(() => {
    const name = this.currentStudentName();
    return name ? `Bonjour ${name} 👋` : 'Bienvenue 👋';
  });

  readonly coursesCount = computed(() => this.coursesSvc.courses().length);

  readonly upcomingCourses = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const all = this.coursesSvc.ordered();
    const filtered = this.isAdmin()
      ? all
      : all.filter((c) => {
          const sid = this.auth.user()?.studentId;
          return sid ? c.studentIds?.includes(sid) : false;
        });
    return filtered
      .filter((c) => c.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  });
  trackByCourseId(_i: number, c: { id: number }) {
    return c.id;
  }

  readonly notesCount = computed(() => this.notesSvc.notes().length);

  private hasAvgByStudent(
    svc: NotesService,
  ): svc is NotesService & { avgByStudent: (studentId: number | string) => number } {
    return (
      'avgByStudent' in svc &&
      typeof (svc as { avgByStudent?: unknown }).avgByStudent === 'function'
    );
  }

  readonly latestNotes = computed(() => {
    const sid = this.auth.user()?.studentId;
    const enriched = this.notesSvc.enriched();
    const filtered = this.isAdmin() ? enriched : enriched.filter((n) => n.studentId === sid);
    return [...filtered]
      .sort((a, b) => (b.createdAt ?? b.date).localeCompare(a.createdAt ?? a.date))
      .slice(0, 5);
  });
  trackByNoteId(_i: number, n: { id: number }) {
    return n.id;
  }

  readonly avgDisplay = computed(() => {
    // Normalise: sid est maintenant number | null (plus de undefined)
    const sid: number | null = this.auth.user()?.studentId ?? null;

    if (this.notesSvc.notes().length === 0) return '–';

    const average = (arr: { value: number }[]) => {
      const s = arr.reduce((acc, n) => acc + n.value, 0);
      return Math.round((s / Math.max(arr.length, 1)) * 100) / 100;
    };

    if (this.isAdmin()) {
      return average(this.notesSvc.notes());
    }

    if (sid !== null) {
      if (this.hasAvgByStudent(this.notesSvc)) {
        const v = this.notesSvc.avgByStudent(sid);
        if (typeof v === 'number') return v;
      }
      const arr = this.notesSvc.notes().filter((n) => n.studentId === sid);
      return average(arr);
    }

    return '-';
  });
}
