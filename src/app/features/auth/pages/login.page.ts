import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AutofocusDirective],
  template: `
    <div
      class="max-w-md mx-auto mt-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-800 p-8"
    >
      <h2 class="text-2xl md:text-3xl font-semibold tracking-tight mb-6 text-center">
        Se connecter
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            appAutofocus
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('email')?.invalid && form.get('email')?.touched"
            class="text-red-600 dark:text-red-400 text-sm mt-1"
          >
            Email invalide
          </p>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('password')?.invalid && form.get('password')?.touched"
            class="text-red-600 dark:text-red-400 text-sm mt-1"
          >
            Minimum 6 caractères
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="form.invalid || loading"
          class="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Pas encore de compte ?
        <a routerLink="/auth/register" class="text-indigo-600 dark:text-indigo-400 hover:underline"
          >Créer un compte</a
        >
      </p>
    </div>
  `,
})
export class LoginPage {
  loading = false;
  form: FormGroup;

  // ✅ injection via inject() (pas de constructor injection)
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      await this.auth.login(this.form.value.email!, this.form.value.password!);
      this.router.navigate(['/dashboard']);
    } catch {
      alert('Échec de connexion');
    } finally {
      this.loading = false;
    }
  }
}
