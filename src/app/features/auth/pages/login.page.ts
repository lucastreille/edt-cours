import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2 class="text-2xl font-semibold mb-4">Login</h2>
    <p class="text-sm text-gray-600 mb-4">Formulaire à implémenter dans la feature Auth.</p>
    <a routerLink="/auth/register" class="underline">Créer un compte</a>
  `,
})
export class LoginPage {}
