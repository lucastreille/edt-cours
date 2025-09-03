import { Injectable, computed, signal } from '@angular/core';
import { Student } from './student.model';

const STORAGE_KEY = 'students';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly _students = signal<Student[]>(this.load());
  readonly students = this._students.asReadonly();

  readonly ordered = computed(() =>
    [...this._students()].sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName);
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName);
    }),
  );

  async getAll(): Promise<void> {
    await new Promise((r) => setTimeout(r, 120));
  }

  async create(
    input: Omit<Student, 'id' | 'createdAt'> & { createdAt?: string },
  ): Promise<Student> {
    await new Promise((r) => setTimeout(r, 120));
    const nowIso = new Date().toISOString();
    const student: Student = { ...input, id: Date.now(), createdAt: input.createdAt ?? nowIso };
    this._students.set([...this._students(), student]);
    this.save();
    return student;
  }

  async update(id: number, patch: Partial<Student>): Promise<Student | null> {
    await new Promise((r) => setTimeout(r, 120));
    const arr = [...this._students()];
    const idx = arr.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...patch, id: arr[idx].id };
    this._students.set(arr);
    this.save();
    return arr[idx];
  }

  async remove(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 120));
    this._students.set(this._students().filter((s) => s.id !== id));
    this.save();
  }

  async getById(id: number): Promise<Student | null> {
    await new Promise((r) => setTimeout(r, 80));
    return this._students().find((s) => s.id === id) ?? null;
  }

  // ---- Email <-> Student helpers ----
  findByEmail(email: string): Student | undefined {
    const e = email.trim().toLowerCase();
    return this._students().find((s) => (s.email ?? '').toLowerCase() === e);
  }

  private createFromEmail(email: string): Student {
    const e = email.trim().toLowerCase();
    const id = Date.now();
    const [firstName, lastName] = this.namesFromEmail(e);

    const today = new Date();
    const birthDate = `${today.getFullYear() - 20}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;
    const createdAt = new Date().toISOString();

    const student: Student = { id, firstName, lastName, email: e, birthDate, createdAt };
    this._students.set([...this._students(), student]);
    this.save();
    return student;
  }

  async ensureByEmail(email: string): Promise<number> {
    await new Promise((r) => setTimeout(r, 80));
    const existing = this.findByEmail(email);
    if (existing) return existing.id;
    const created = this.createFromEmail(email);
    return created.id;
  }

  private namesFromEmail(email: string): [string, string] {
    const local = email.split('@')[0] ?? 'user';
    const parts = local.split(/[.\-_]/).filter(Boolean);
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const first = cap(parts[0] ?? 'User');
    const last = cap(parts[1] ?? 'Demo');
    return [first, last];
  }

  // ---- persistence ----
  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._students()));
  }

  private load(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const todayIso = new Date().toISOString();
      return [
        {
          id: 1,
          firstName: 'User',
          lastName: 'Test',
          email: 'user@test.com',
          birthDate: '2004-01-15',
          createdAt: todayIso,
        },
        {
          id: 2,
          firstName: 'Alice',
          lastName: 'Martin',
          email: 'alice@test.com',
          birthDate: '2003-05-20',
          createdAt: todayIso,
        },
        {
          id: 3,
          firstName: 'Bob',
          lastName: 'Dupont',
          email: 'bob@test.com',
          birthDate: '2003-09-10',
          createdAt: todayIso,
        },
      ];
    }
    try {
      const list = JSON.parse(raw) as Student[];
      return (Array.isArray(list) ? list : []).map((s) => ({
        ...s,
        email: s.email ?? '',
        birthDate: s.birthDate ?? '2004-01-01',
        createdAt: s.createdAt ?? new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}
