import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="py-16 text-center">
      <h1 class="text-3xl font-bold mb-2">404 - Page non trouvée</h1>
      <p class="mb-6">La page demandée n'existe pas.</p>
      <a
        routerLink="/dashboard"
        class="px-4 py-2 rounded bg-gray-900 text-white hover:opacity-90 focus:outline-none focus:ring"
      >
        Retour au dashboard
      </a>
    </section>
  `,
})
export class NotFoundPage {}
