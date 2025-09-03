import { Injectable, signal, computed, inject } from '@angular/core';
import { Student, CreateStudentDto, UpdateStudentDto } from './student.model';
import { LoaderStore } from '../../core/state/loader.store';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly STORAGE_KEY = 'students_data';
  private readonly loader = inject(LoaderStore);

  // --- state
  private readonly _students = signal<Student[]>(this.loadFromStorage() ?? this.seedInitial());
  readonly students = computed(() => this._students());
  readonly total = computed(() => this._students().length);

  // --- helpers
  private async delay(ms = 500): Promise<void> {
    await new Promise((res) => setTimeout(res, ms));
  }

  // --- public API
  async getAll(): Promise<Student[]> {
    this.loader.start();
    try {
      await this.delay(300);
      return this._students();
    } finally {
      this.loader.stop();
    }
  }

  async getById(id: number): Promise<Student | null> {
    this.loader.start();
    try {
      await this.delay(200);
      const s = this._students().find((x) => x.id === id) ?? null;
      return s;
    } finally {
      this.loader.stop();
    }
  }

  async create(input: CreateStudentDto): Promise<Student> {
    this.loader.start();
    try {
      await this.delay(400);
      const student: Student = {
        id: this.nextId(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        birthDate: input.birthDate,
        createdAt: new Date().toISOString(),
      };
      const list = [student, ...this._students()];
      this._students.set(list);
      this.saveToStorage(list);
      return student;
    } finally {
      this.loader.stop();
    }
  }

  async update(id: number, changes: UpdateStudentDto): Promise<Student> {
    this.loader.start();
    try {
      await this.delay(400);
      let updated: Student | null = null;
      const list = this._students().map((s) => {
        if (s.id !== id) return s;
        updated = {
          ...s,
          ...changes,
          firstName: (changes.firstName ?? s.firstName).trim(),
          lastName: (changes.lastName ?? s.lastName).trim(),
          email: (changes.email ?? s.email).trim().toLowerCase(),
        };
        return updated;
      });
      if (!updated) {
        throw new Error('Étudiant introuvable');
      }
      this._students.set(list);
      this.saveToStorage(list);
      return updated;
    } finally {
      this.loader.stop();
    }
  }

  async remove(id: number): Promise<void> {
    this.loader.start();
    try {
      await this.delay(300);
      const before = this._students().length;
      const list = this._students().filter((s) => s.id !== id);
      if (list.length === before) {
        throw new Error('Étudiant introuvable');
      }
      this._students.set(list);
      this.saveToStorage(list);
    } finally {
      this.loader.stop();
    }
  }

  // --- localStorage
  private saveToStorage(list: Student[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private loadFromStorage(): Student[] | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Student[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  // --- seed & id
  private seedInitial(): Student[] {
    const now = new Date();
    const sample: Student[] = Array.from({ length: 12 }).map((_, i) => {
      const id = 1000 + i;
      const first = [
        'Alice',
        'Bruno',
        'Chloé',
        'David',
        'Emma',
        'Fares',
        'Gisèle',
        'Hugo',
        'Inès',
        'Jules',
        'Kenza',
        'Léo',
      ][i];
      const last = [
        'Martin',
        'Durand',
        'Bernard',
        'Petit',
        'Robert',
        'Richard',
        'Moreau',
        'Simon',
        'Laurent',
        'Lefebvre',
        'Michel',
        'Garcia',
      ][i];
      const yyyy = 1995 + (i % 7);
      const mm = String(1 + (i % 12)).padStart(2, '0');
      const dd = String(1 + (i % 28)).padStart(2, '0');
      return {
        id,
        firstName: first,
        lastName: last,
        email: `${first}.${last}@exemple.com`.toLowerCase(),
        birthDate: `${yyyy}-${mm}-${dd}`,
        createdAt: now.toISOString(),
      };
    });
    this.saveToStorage(sample);
    return sample;
  }

  private nextId(): number {
    const list = this._students();
    return list.length ? Math.max(...list.map((s) => s.id)) + 1 : 1;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).StudentsServiceToken = StudentsService;
