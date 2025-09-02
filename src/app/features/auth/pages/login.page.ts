import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto mt-12 bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-6 text-center">Se connecter</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Email -->
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

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
          />
          <p
            *ngIf="form.get('password')?.invalid && form.get('password')?.touched"
            class="text-red-600 text-sm mt-1"
          >
            Minimum 6 caractères
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="form.invalid || loading"
          class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring disabled:opacity-50"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-600 mt-4">
        Pas encore de compte ?
        <a routerLink="/auth/register" class="text-indigo-600 hover:underline">Créer un compte</a>
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
