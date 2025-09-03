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
    <div class="min-h-screen bg-gray-50 text-gray-900">
      <header class="border-b bg-white">
        <nav class="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <a class="font-semibold text-lg" routerLink="/">Plateforme</a>

          <div class="flex-1"></div>

          <!-- Badge statut + email + logout -->
          <div *ngIf="isAuth()" class="flex items-center gap-2 mr-2">
            <span
              class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
              [ngClass]="
                isAdmin()
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              "
              aria-label="Statut utilisateur"
            >
              {{ roleLabel() }}
            </span>
            <span class="text-sm text-gray-700" aria-label="Email utilisateur">{{
              userEmail()
            }}</span>
            <button
              type="button"
              (click)="logout()"
              class="px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
              aria-label="Se déconnecter"
            >
              Se déconnecter
            </button>
          </div>

          <!-- Liens -->
          <a
            routerLink="/auth/login"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            *ngIf="!isAuth()"
            >Login</a
          >
          <a
            routerLink="/auth/register"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            *ngIf="!isAuth()"
            >Register</a
          >
          <a
            routerLink="/dashboard"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Dashboard</a
          >
          <a
            *ngIf="isAdmin()"
            routerLink="/etudiants"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Étudiants</a
          >
          <a
            routerLink="/cours"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Cours</a
          >
          <a
            routerLink="/notes"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Notes</a
          >

          <!-- Bouton dev ping (admin) -->
          <button
            *ngIf="isAdmin()"
            (click)="devPing()"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            aria-label="Ping API (test interceptor)"
          >
            Ping API
          </button>
        </nav>
      </header>

      <main class="mx-auto max-w-6xl p-4">
        <router-outlet />
      </main>

      <!-- Overlay loader (utilise LoaderService; restera caché si rien ne l'active) -->
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

  // ---- hooks utilisés par le template ----
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

  devPing(): void {
    this.http.get<{ ok: boolean; ts: string }>('assets/ping.json').subscribe({
      next: (res) => console.warn('PING OK', res),
      error: (err) => console.error('PING ERR', err),
    });
  }
}
