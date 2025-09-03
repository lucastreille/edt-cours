import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';
import { LoaderService } from './core/services/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm"
      >
        <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <!-- Logo -->
          <a
            routerLink="/"
            class="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 text-lg"
          >
            <span class="bg-indigo-600 text-white px-2 py-1 rounded-lg text-sm">EDT</span>
            <span class="hidden sm:inline">Plateforme</span>
          </a>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-6">
            <a
              routerLink="/dashboard"
              class="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >Dashboard</a
            >
            <a
              routerLink="/cours"
              class="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >Cours</a
            >
            <a
              routerLink="/notes"
              class="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >Notes</a
            >
            <a
              *ngIf="isAdmin()"
              routerLink="/etudiants"
              class="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >Étudiants</a
            >
          </div>

          <!-- User -->
          <div class="flex items-center gap-3">
            <ng-container *ngIf="isAuth(); else guestLinks">
              <span
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                [ngClass]="
                  isAdmin()
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                "
              >
                {{ roleLabel() }}
              </span>
              <span class="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">{{
                userEmail()
              }}</span>
              <button
                (click)="logout()"
                class="text-sm font-medium rounded-lg px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                Déconnexion
              </button>
            </ng-container>

            <!-- Guest -->
            <ng-template #guestLinks>
              <a
                routerLink="/auth/login"
                class="text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Login
              </a>
              <a
                routerLink="/auth/register"
                class="text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Register
              </a>
            </ng-template>
          </div>
        </nav>
      </header>

      <!-- Main -->
      <main class="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <router-outlet />
      </main>

      <!-- Loader overlay -->
      <div
        *ngIf="isLoading()"
        class="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          class="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent"
        ></div>
        <span class="sr-only">Chargement…</span>
      </div>
    </div>
  `,
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);

  isLoading(): boolean {
    return this.loader.loading();
  }
  isAuth(): boolean {
    return this.auth.isAuthenticated();
  }
  isAdmin(): boolean {
    return this.auth.role() === 'admin';
  }
  roleLabel(): 'Admin' | 'Étudiant' {
    return this.isAdmin() ? 'Admin' : 'Étudiant';
  }
  userEmail(): string {
    return this.auth.user()?.email ?? '';
  }
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
