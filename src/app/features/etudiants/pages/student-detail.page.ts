import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../../features/etudiants/students.service';
import { Student } from '../../../features/etudiants/student.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="space-y-4">
      <a
        routerLink="/etudiants"
        class="inline-block px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring"
        >← Retour</a
      >

      <ng-container *ngIf="student(); else notfound">
        <header class="flex items-center justify-between gap-2 flex-wrap">
          <h2 class="text-2xl font-semibold">
            {{ student()!.firstName }} {{ student()!.lastName }}
          </h2>

          <div class="flex items-center gap-2" *ngIf="isAdmin()">
            <a
              [routerLink]="['/etudiants', student()!.id, 'edition']"
              class="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring"
              >Éditer</a
            >
            <button
              type="button"
              (click)="onDelete()"
              class="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring"
            >
              Supprimer
            </button>
          </div>
        </header>

        <div class="bg-white rounded-lg shadow divide-y">
          <div class="p-4"><span class="font-medium">Email :</span> {{ student()!.email }}</div>
          <div class="p-4">
            <span class="font-medium">Naissance :</span> {{ student()!.birthDate }}
          </div>
          <div class="p-4">
            <span class="font-medium">Créé le :</span>
            {{ student()!.createdAt | date: 'yyyy-MM-dd HH:mm' }}
          </div>
        </div>
      </ng-container>

      <ng-template #notfound>
        <div class="p-4 rounded bg-red-50 text-red-700">Étudiant introuvable.</div>
      </ng-template>
    </section>
  `,
})
export class StudentDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentsSvc = inject(StudentsService);
  private auth = inject(AuthService);

  readonly isAdmin = () => this.auth.role() === 'admin';
  readonly student = signal<Student | null>(null);

  constructor() {
    const idRaw = this.route.snapshot.paramMap.get('id');
    const id = idRaw ? Number(idRaw) : NaN;
    if (!Number.isFinite(id)) {
      this.student.set(null);
      return;
    }

    this.load(id);
  }

  private async load(id: number): Promise<void> {
    const s = await this.studentsSvc.getById(id);
    this.student.set(s);
  }

  async onDelete(): Promise<void> {
    if (!this.isAdmin() || !this.student()) return;
    const ok = confirm('Supprimer cet étudiant ? Cette action est irréversible.');
    if (!ok) return;
    try {
      await this.studentsSvc.remove(this.student()!.id);
      await this.router.navigate(['/etudiants']);
    } catch {
      alert('Erreur lors de la suppression');
    }
  }
}
