import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../../features/etudiants/students.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-4 max-w-xl">
      <a
        routerLink="/etudiants"
        class="inline-block px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
        >← Retour</a
      >

      <h2 class="text-2xl font-semibold">
        {{ isEdit ? 'Éditer un étudiant' : 'Nouvel étudiant' }}
      </h2>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="bg-white rounded-lg shadow p-4 space-y-4"
      >
        <div>
          <label for="firstName" class="block text-sm font-medium mb-1">Prénom</label>
          <input
            id="firstName"
            type="text"
            formControlName="firstName"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('firstName')?.invalid && form.get('firstName')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Requis
          </p>
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium mb-1">Nom</label>
          <input
            id="lastName"
            type="text"
            formControlName="lastName"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('lastName')?.invalid && form.get('lastName')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Requis
          </p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('email')?.invalid && form.get('email')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Email invalide
          </p>
        </div>

        <div>
          <label for="birthDate" class="block text-sm font-medium mb-1">Date de naissance</label>
          <input
            id="birthDate"
            type="date"
            formControlName="birthDate"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('birthDate')?.invalid && form.get('birthDate')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Requis
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
            routerLink="/etudiants"
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
          >
            Annuler
          </a>
        </div>
      </form>
    </section>
  `,
})
export class StudentFormPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentsSvc = inject(StudentsService);

  form: FormGroup;
  isEdit = false;
  currentId: number | null = null;
  saving = false;

  constructor() {
    const idRaw = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idRaw;
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required]],
    });

    if (this.isEdit) {
      const id = Number(idRaw);
      this.currentId = Number.isFinite(id) ? id : null;
      if (this.currentId) {
        this.load(this.currentId);
      }
    }
  }

  private async load(id: number): Promise<void> {
    const s = await this.studentsSvc.getById(id);
    if (!s) {
      alert('Étudiant introuvable');
      this.router.navigate(['/etudiants']);
      return;
    }
    this.form.patchValue({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      birthDate: s.birthDate,
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
        firstName: string;
        lastName: string;
        email: string;
        birthDate: string;
      };

      if (this.isEdit && this.currentId) {
        await this.studentsSvc.update(this.currentId, v);
      } else {
        await this.studentsSvc.create(v);
      }
      await this.router.navigate(['/etudiants']);
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      this.saving = false;
    }
  }
}
