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
          <h2 class="text-2xl font-semibold">Cours</h2>
          <p class="text-sm text-gray-600">
            Glissez-déposez pour réordonner (admin) · Les étudiants voient uniquement leurs cours
          </p>
        </div>
        <a
          *ngIf="isAdmin()"
          routerLink="/cours/nouveau"
          class="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring"
        >
          Ajouter
        </a>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          *ngFor="let c of visible(); let i = index; trackBy: trackById"
          class="bg-white rounded-lg shadow p-4 border"
          [appDroppable]="i"
          (appDropped)="onDropped($event)"
        >
          <div class="flex items-start gap-2">
            <div
              class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold select-none"
              [appDraggable]="i"
              [class.opacity-50]="draggingIndex() === i"
              title="Glisser pour déplacer"
            >
              {{ c.title.slice(0, 2).toUpperCase() }}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ c.title }}</h3>
              <p class="text-sm text-gray-600">Enseignant : {{ c.teacher }}</p>
              <p class="text-sm text-gray-600">ECTS : {{ c.ects }}</p>
              <p class="text-sm text-gray-600">Date : {{ c.date }}</p>

              <div class="mt-2 text-xs text-gray-500">
                Étudiants inscrits : {{ c.studentIds.length }}
              </div>
            </div>

            <div *ngIf="isAdmin()" class="flex items-center gap-2">
              <a
                [routerLink]="['/cours', c.id, 'edition']"
                class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
                aria-label="Éditer le cours"
                >Éditer</a
              >
              <button
                type="button"
                (click)="onDelete(c.id)"
                [disabled]="deletingId() === c.id"
                class="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring disabled:opacity-60"
                aria-label="Supprimer le cours"
              >
                {{ deletingId() === c.id ? 'Suppression…' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </article>

        <div *ngIf="visible().length === 0" class="text-gray-500">Aucun cours à afficher.</div>
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
