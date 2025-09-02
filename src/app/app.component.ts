import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
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
        </nav>
      </header>

      <main class="mx-auto max-w-6xl p-4">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {}
