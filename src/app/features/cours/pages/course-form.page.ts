import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoursesService } from '../../cours/courses.service';
import { StudentsService } from '../../etudiants/students.service';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AutofocusDirective],
  template: `
    <section class="space-y-4 max-w-2xl">
      <a
        routerLink="/cours"
        class="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >← Retour</a
      >

      <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">
        {{ isEdit ? 'Éditer un cours' : 'Nouveau cours' }}
      </h2>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-800 p-6 space-y-5"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="title" class="block text-sm font-medium mb-1">Titre</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              appAutofocus
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p
              *ngIf="form.get('title')?.invalid && form.get('title')?.touched"
              class="text-red-600 dark:text-red-400 text-sm mt-1"
            >
              Titre requis
            </p>
          </div>

          <div>
            <label for="teacher" class="block text-sm font-medium mb-1">Enseignant</label>
            <input
              id="teacher"
              type="text"
              formControlName="teacher"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p
              *ngIf="form.get('teacher')?.invalid && form.get('teacher')?.touched"
              class="text-red-600 dark:text-red-400 text-sm mt-1"
            >
              Enseignant requis
            </p>
          </div>

          <div>
            <label for="ects" class="block text-sm font-medium mb-1">ECTS</label>
            <input
              id="ects"
              type="number"
              min="0"
              step="1"
              formControlName="ects"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p
              *ngIf="form.get('ects')?.invalid && form.get('ects')?.touched"
              class="text-red-600 dark:text-red-400 text-sm mt-1"
            >
              ECTS ≥ 0
            </p>
          </div>

          <div>
            <label for="date" class="block text-sm font-medium mb-1">Date</label>
            <input
              id="date"
              type="date"
              formControlName="date"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p
              *ngIf="form.get('date')?.invalid && form.get('date')?.touched"
              class="text-red-600 dark:text-red-400 text-sm mt-1"
            >
              Date requise
            </p>
          </div>
        </div>

        <!-- Affectation des étudiants (admin) -->
        <fieldset class="rounded-2xl ring-1 ring-gray-200/70 dark:ring-gray-800 p-4">
          <legend class="text-sm font-medium px-1 text-gray-900 dark:text-gray-100">
            Étudiants inscrits
          </legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <label
              *ngFor="let s of students(); trackBy: trackByStudent"
              class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                #cb
                [checked]="isSelected(s.id)"
                (change)="toggleStudent(s.id, cb.checked)"
                class="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm">{{ s.lastName }} {{ s.firstName }}</span>
            </label>
          </div>
        </fieldset>

        <div class="flex items-center gap-2">
          <button
            type="submit"
            [disabled]="form.invalid || saving"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement…' : isEdit ? 'Sauvegarder' : 'Créer' }}
          </button>
          <a
            routerLink="/cours"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >Annuler</a
          >
        </div>
      </form>
    </section>
  `,
})
export class CourseFormPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courses = inject(CoursesService);
  private studentsSvc = inject(StudentsService);

  form: FormGroup;
  isEdit = false;
  id: number | null = null;
  saving = false;

  constructor() {
    // charger la source étudiants

    this.studentsSvc.getAll();

    const idRaw = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idRaw;

    this.form = this.fb.group({
      title: ['', [Validators.required]],
      teacher: ['', [Validators.required]],
      ects: [0, [Validators.required, Validators.min(0)]],
      date: [this.today(), [Validators.required]],
      studentIds: [[] as number[]],
    });

    if (this.isEdit) {
      const idNum = Number(idRaw);
      this.id = Number.isFinite(idNum) ? idNum : null;
      if (this.id) {
        this.load(this.id);
      }
    }
  }

  readonly students = computed(() =>
    [...this.studentsSvc.students()].sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName);
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName);
    }),
  );

  isSelected(studentId: number): boolean {
    const arr = (this.form.value.studentIds as number[]) ?? [];
    return arr.includes(studentId);
  }

  toggleStudent(studentId: number, checked: boolean): void {
    const arr = new Set<number>((this.form.value.studentIds as number[]) ?? []);
    if (checked) arr.add(studentId);
    else arr.delete(studentId);
    this.form.patchValue({ studentIds: [...arr] });
  }

  private async load(id: number): Promise<void> {
    const c = await this.courses.getById(id);
    if (!c) {
      alert('Cours introuvable');
      this.router.navigate(['/cours']);
      return;
    }
    this.form.patchValue({
      title: c.title,
      teacher: c.teacher,
      ects: c.ects,
      date: c.date,
      studentIds: c.studentIds ?? [],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    try {
      const v = this.form.value as {
        title: string;
        teacher: string;
        ects: number;
        date: string;
        studentIds: number[];
      };
      if (this.isEdit && this.id) {
        await this.courses.update(this.id, v);
      } else {
        await this.courses.create(v);
      }
      await this.router.navigate(['/cours']);
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      this.saving = false;
    }
  }

  trackByStudent(_i: number, s: { id: number }): number {
    return s.id;
  }

  private today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
