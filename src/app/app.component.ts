import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderStore } from './core/state/loader.store';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <!-- Loader global (overlay plein écran) -->
    <div
      *ngIf="isLoading()"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div
        class="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin"
      ></div>
      <span class="sr-only">Chargement…</span>
    </div>

    <div class="min-h-screen bg-gray-50 text-gray-900">
      <header class="border-b bg-white">
        <nav class="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <a class="font-semibold text-lg" routerLink="/">Plateforme</a>
          <div class="flex-1"></div>
          <a
            routerLink="/auth/login"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Login</a
          >
          <a
            routerLink="/auth/register"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Register</a
          >
          <a
            routerLink="/dashboard"
            class="px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring"
            >Dashboard</a
          >
          <a
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
    </div>
  `,
})
export class App {
  private loader = inject(LoaderStore);
  readonly isLoading = this.loader.isLoading;

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  isAdmin(): boolean {
    return this.auth.role() === 'admin';
  }

  devPing(): void {
    this.http.get<{ ok: boolean; ts: string }>('assets/ping.json').subscribe({
      next: (res) => console.warn('PING OK', res),
      error: (err) => console.warn('PING ERR', err),
    });
  }
}
