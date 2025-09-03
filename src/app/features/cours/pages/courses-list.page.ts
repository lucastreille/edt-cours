import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../../features/cours/courses.service';
import { Course } from '../../../features/cours/course.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <header class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-2xl font-semibold">Cours</h2>
          <p class="text-sm text-gray-600">Catalogue des enseignements disponibles</p>
        </div>
        <div class="text-sm text-gray-600">{{ total() }} cours</div>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          *ngFor="let c of items(); trackBy: trackById"
          class="rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          aria-label="Cours {{ c.title }}"
        >
          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-lg font-semibold leading-snug">
                {{ c.title }}
              </h3>
              <span
                class="shrink-0 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium"
              >
                {{ c.ects }} ECTS
              </span>
            </div>

            <p class="mt-2 text-sm text-gray-600 max-h-12 overflow-hidden">
              {{ c.description }}
            </p>

            <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <div
                  class="h-7 w-7 rounded-full grid place-items-center text-white text-xs font-semibold"
                  [ngClass]="avatarColor(c.order)"
                  aria-hidden="true"
                >
                  {{ c.teacher ? c.teacher[0] : '?' }}
                </div>
                <span class="truncate max-w-[160px]" title="{{ c.teacher }}">{{ c.teacher }}</span>
              </div>
              <time [attr.datetime]="c.createdAt">{{ c.createdAt | date: 'yyyy-MM-dd' }}</time>
            </div>
          </div>

          <div class="border-t px-4 py-2 text-right text-xs text-gray-500">
            Ordre d’affichage : {{ c.order + 1 }}
          </div>
        </article>
      </div>

      <p class="text-sm text-gray-500">
        Réorganisation par <span class="font-medium">drag & drop</span> au prochain commit.
      </p>
    </section>
  `,
})
export class CoursesListPage {
  private coursesSvc = inject(CoursesService);

  // charge initiale (délais mock pour voir le loader)

  constructor() {
    this.coursesSvc.getAll();
  }

  readonly items = computed<Course[]>(() =>
    [...this.coursesSvc.courses()].sort((a, b) => a.order - b.order),
  );
  readonly total = computed(() => this.coursesSvc.total());

  trackById(_i: number, c: Course): number {
    return c.id;
  }

  /**
   * Petits jeux de couleurs pour l’avatar enseignant, en fonction de l’ordre.
   */
  avatarColor(order: number): string {
    const palette = [
      'bg-gradient-to-br from-indigo-500 to-blue-600',
      'bg-gradient-to-br from-rose-500 to-pink-600',
      'bg-gradient-to-br from-emerald-500 to-teal-600',
      'bg-gradient-to-br from-amber-500 to-orange-600',
      'bg-gradient-to-br from-purple-500 to-fuchsia-600',
      'bg-gradient-to-br from-cyan-500 to-sky-600',
    ];
    return palette[order % palette.length];
  }
}
