import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotesService } from '../../../features/notes/notes.service';
import { StudentsService } from '../../../features/etudiants/students.service';
import { CoursesService } from '../../../features/cours/courses.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-4 max-w-xl">
      <a
        routerLink="/notes"
        class="inline-block px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
        >← Retour</a
      >

      <h2 class="text-2xl font-semibold">
        {{ isEdit ? 'Éditer une note' : 'Nouvelle note' }}
      </h2>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="bg-white rounded-lg shadow p-4 space-y-4"
      >
        <!-- Étudiant -->
        <div>
          <label for="studentId" class="block text-sm font-medium mb-1">Étudiant</label>
          <select
            id="studentId"
            formControlName="studentId"
            class="w-full px-3 py-2 border rounded bg-white focus:outline-none focus:ring focus:border-indigo-500"
          >
            <option value="" disabled>— Sélectionner —</option>
            <option *ngFor="let s of students(); trackBy: trackByStudentId" [value]="s.id">
              {{ s.lastName }} {{ s.firstName }}
            </option>
          </select>
          <p
            *ngIf="form.get('studentId')?.invalid && form.get('studentId')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Étudiant requis
          </p>
        </div>

        <!-- Cours -->
        <div>
          <label for="courseId" class="block text-sm font-medium mb-1">Cours</label>
          <select
            id="courseId"
            formControlName="courseId"
            class="w-full px-3 py-2 border rounded bg-white focus:outline-none focus:ring focus:border-indigo-500"
          >
            <option value="" disabled>— Sélectionner —</option>
            <option *ngFor="let c of courses(); trackBy: trackByCourseId" [value]="c.id">
              {{ c.title }}
            </option>
          </select>
          <p
            *ngIf="form.get('courseId')?.invalid && form.get('courseId')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Cours requis
          </p>
        </div>

        <!-- Valeur /20 -->
        <div>
          <label for="value" class="block text-sm font-medium mb-1">Note (/20)</label>
          <input
            id="value"
            type="number"
            step="0.5"
            min="0"
            max="20"
            formControlName="value"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('value')?.invalid && form.get('value')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Saisir un nombre entre 0 et 20
          </p>
        </div>

        <!-- Date -->
        <div>
          <label for="date" class="block text-sm font-medium mb-1">Date</label>
          <input
            id="date"
            type="date"
            formControlName="date"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('date')?.invalid && form.get('date')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Date requise (YYYY-MM-DD)
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="submit"
            [disabled]="form.invalid || saving"
            class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement…' : isEdit ? 'Sauvegarder' : 'Créer' }}
          </button>

          <a
            routerLink="/notes"
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
          >
            Annuler
          </a>
        </div>
      </form>
    </section>
  `,
})
export class NoteFormPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notesSvc = inject(NotesService);
  private studentsSvc = inject(StudentsService);
  private coursesSvc = inject(CoursesService);

  form: FormGroup;
  isEdit = false;
  currentId: number | null = null;
  saving = false;

  constructor() {
    // charger sources pour les selects

    this.studentsSvc.getAll();

    this.coursesSvc.getAll();

    const idRaw = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idRaw;

    this.form = this.fb.group({
      studentId: ['', [Validators.required]],
      courseId: ['', [Validators.required]],
      value: [null, [Validators.required, Validators.min(0), Validators.max(20)]],
      date: [this.today(), [Validators.required]],
    });

    if (this.isEdit) {
      const id = Number(idRaw);
      this.currentId = Number.isFinite(id) ? id : null;
      if (this.currentId) {
        this.load(this.currentId);
      }
    }
  }

  readonly students = computed(() =>
    [...this.studentsSvc.students()].sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName);
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName);
    }),
  );

  readonly courses = computed(() =>
    [...this.coursesSvc.courses()].sort((a, b) => a.order - b.order),
  );

  private async load(id: number): Promise<void> {
    const n = await this.notesSvc.getById(id);
    if (!n) {
      alert('Note introuvable');
      this.router.navigate(['/notes']);
      return;
    }
    this.form.patchValue({
      studentId: n.studentId,
      courseId: n.courseId,
      value: n.value,
      date: n.date,
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
        studentId: number;
        courseId: number;
        value: number;
        date: string;
      };
      if (this.isEdit && this.currentId) {
        await this.notesSvc.update(this.currentId, v);
      } else {
        await this.notesSvc.create(v);
      }
      await this.router.navigate(['/notes']);
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      this.saving = false;
    }
  }

  trackByStudentId(_i: number, s: { id: number }): number {
    return s.id;
  }
  trackByCourseId(_i: number, c: { id: number }): number {
    return c.id;
  }

  private today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
