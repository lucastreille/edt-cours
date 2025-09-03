import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../../cours/courses.service';
import { Course } from '../../cours/course.model';
import { DraggableDirective } from '../../../shared/directives/draggable.directive';
import { DroppableDirective } from '../../../shared/directives/droppable.directive';
import { AuthService } from '../../../core/services/auth.service';
import { StudentsService } from '../../etudiants/students.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, DraggableDirective, DroppableDirective],
  template: `
    <section class="space-y-6">
      <header class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Cours</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Glissez-déposez pour réordonner (admin) · Les étudiants voient uniquement leurs cours
          </p>
        </div>
        <a
          *ngIf="isAdmin()"
          routerLink="/cours/nouveau"
          class="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Ajouter
        </a>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          *ngFor="let c of visible(); let i = index; trackBy: trackById"
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-800 p-4"
          [appDroppable]="i"
          (appDropped)="onDropped($event)"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-semibold select-none ring-1 ring-indigo-200/70 dark:ring-indigo-800/50"
              [appDraggable]="i"
              [class.opacity-50]="draggingIndex() === i"
              title="Glisser pour déplacer"
            >
              {{ c.title.slice(0, 2).toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold leading-tight truncate">{{ c.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Enseignant : {{ c.teacher }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">ECTS : {{ c.ects }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Date : {{ c.date }}</p>

              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Étudiants inscrits : {{ c.studentIds.length }}
              </div>
            </div>

            <div *ngIf="isAdmin()" class="flex items-center gap-2">
              <a
                [routerLink]="['/cours', c.id, 'edition']"
                class="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Éditer le cours"
              >
                Éditer
              </a>
              <button
                type="button"
                (click)="onDelete(c.id)"
                [disabled]="deletingId() === c.id"
                class="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-60"
                aria-label="Supprimer le cours"
              >
                {{ deletingId() === c.id ? 'Suppression…' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </article>

        <div *ngIf="visible().length === 0" class="col-span-full">
          <div
            class="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-900 rounded-2xl ring-1 ring-gray-200/70 dark:ring-gray-800"
          >
            Aucun cours à afficher.
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CoursesListPage {
  private readonly svc = inject(CoursesService);
  private readonly auth = inject(AuthService);
  private readonly studentsSvc = inject(StudentsService);

  readonly draggingIndex = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);

  constructor() {
    this.svc.getAll();
    // pré-charger les étudiants pour le formulaire d'édition/création

    this.studentsSvc.getAll();
  }

  readonly isAdmin = () => this.auth.role() === 'admin';

  /** Tous les cours ordonnés */
  readonly all = computed(() => this.svc.ordered());

  /** Cours visibles en fonction du rôle */
  readonly visible = computed<Course[]>(() => {
    const u = this.auth.user();
    const all = this.all();
    if (!u) return [];
    if (u.role === 'admin') return all;
    const sid = u.studentId;
    if (!Number.isFinite(sid as number)) return [];
    return all.filter((c) => (c.studentIds ?? []).includes(sid as number));
  });

  async onDropped(e: unknown): Promise<void> {
    if (!this.isAdmin()) return;

    const getNum = (v: unknown): number | null =>
      typeof v === 'number' && Number.isFinite(v) ? v : null;

    let fromIndex: number | null = null;
    let toIndex: number | null = null;

    if (typeof e === 'number') {
      // certains DnD envoient juste un index cible (insuffisant pour déplacer)
      return;
    } else if (e && typeof e === 'object') {
      const obj = e as Record<string, unknown>;
      fromIndex =
        getNum(obj['fromIndex']) ??
        getNum(obj['sourceIndex']) ??
        getNum(obj['from']) ??
        getNum(obj['start']) ??
        getNum(obj['dragIndex']) ??
        null;

      toIndex =
        getNum(obj['toIndex']) ??
        getNum(obj['targetIndex']) ??
        getNum(obj['to']) ??
        getNum(obj['end']) ??
        getNum(obj['dropIndex']) ??
        getNum(obj['index']) ??
        null;
    }

    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;

    await this.svc.move(fromIndex, toIndex);
  }

  async onDelete(id: number): Promise<void> {
    if (!this.isAdmin()) return;
    const ok = window.confirm('Supprimer ce cours ?');
    if (!ok) return;
    this.deletingId.set(id);
    try {
      await this.svc.remove(id);
    } catch {
      alert('Suppression impossible.');
    } finally {
      this.deletingId.set(null);
    }
  }

  trackById(_i: number, c: Course): number {
    return c.id;
  }
}
