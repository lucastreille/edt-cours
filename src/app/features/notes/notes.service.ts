import { Injectable, signal, computed, inject } from '@angular/core';
import { Note, CreateNoteDto, UpdateNoteDto } from './note.model';
import { LoaderStore } from '../../core/state/loader.store';
import { StudentsService } from '../etudiants/students.service';
import { CoursesService } from '../cours/courses.service';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly STORAGE_KEY = 'notes_data';
  private readonly loader = inject(LoaderStore);

  // pour enrichissement (nom étudiant / titre cours)
  private readonly studentsSvc = inject(StudentsService);
  private readonly coursesSvc = inject(CoursesService);

  private readonly _notes = signal<Note[]>(this.loadFromStorage() ?? this.seedInitial());
  readonly notes = computed(() => this._notes());
  readonly total = computed(() => this._notes().length);

  // --- helpers
  private async delay(ms = 400): Promise<void> {
    await new Promise((res) => setTimeout(res, ms));
  }

  private assertValue(v: number): void {
    if (!Number.isFinite(v) || v < 0 || v > 20) {
      throw new Error('La note doit être un nombre entre 0 et 20.');
    }
  }

  private today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // --- API publique
  async getAll(): Promise<Note[]> {
    this.loader.start();
    try {
      await this.delay(200);
      // tri décroissant par date de création (plus récent d’abord)
      return [...this._notes()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } finally {
      this.loader.stop();
    }
  }

  async getById(id: number): Promise<Note | null> {
    this.loader.start();
    try {
      await this.delay(150);
      return this._notes().find((n) => n.id === id) ?? null;
    } finally {
      this.loader.stop();
    }
  }

  async create(input: CreateNoteDto): Promise<Note> {
    this.loader.start();
    try {
      await this.delay(300);
      this.assertValue(Number(input.value));
      const list = this._notes();
      const nextId = list.length ? Math.max(...list.map((n) => n.id)) + 1 : 1;

      const note: Note = {
        id: nextId,
        studentId: Number(input.studentId),
        courseId: Number(input.courseId),
        value: Number(input.value),
        date: input.date ?? this.today(),
        createdAt: new Date().toISOString(),
      };

      const updated = [note, ...list];
      this._notes.set(updated);
      this.saveToStorage(updated);
      return note;
    } finally {
      this.loader.stop();
    }
  }

  async update(id: number, changes: UpdateNoteDto): Promise<Note> {
    this.loader.start();
    try {
      await this.delay(300);
      let updatedItem: Note | null = null;
      const updated = this._notes().map((n) => {
        if (n.id !== id) return n;
        const value = Number(changes.value ?? n.value);
        this.assertValue(value);
        updatedItem = {
          ...n,
          ...changes,
          value,
          studentId: Number(changes.studentId ?? n.studentId),
          courseId: Number(changes.courseId ?? n.courseId),
          date: changes.date ?? n.date,
        };
        return updatedItem;
      });
      if (!updatedItem) throw new Error('Note introuvable');
      this._notes.set(updated);
      this.saveToStorage(updated);
      return updatedItem;
    } finally {
      this.loader.stop();
    }
  }

  async remove(id: number): Promise<void> {
    this.loader.start();
    try {
      await this.delay(200);
      const filtered = this._notes().filter((n) => n.id !== id);
      if (filtered.length === this._notes().length) throw new Error('Note introuvable');
      this._notes.set(filtered);
      this.saveToStorage(filtered);
    } finally {
      this.loader.stop();
    }
  }

  // --- Sélecteurs calculés (moyennes)
  avgByStudent(studentId: number): number | null {
    const arr = this._notes().filter((n) => n.studentId === studentId);
    if (!arr.length) return null;
    const s = arr.reduce((acc, n) => acc + n.value, 0);
    return Math.round((s / arr.length) * 100) / 100;
  }

  avgByCourse(courseId: number): number | null {
    const arr = this._notes().filter((n) => n.courseId === courseId);
    if (!arr.length) return null;
    const s = arr.reduce((acc, n) => acc + n.value, 0);
    return Math.round((s / arr.length) * 100) / 100;
  }

  // --- Enrichissement (join simple)
  /**
   * Retourne un tableau enrichi avec nom complet étudiant et titre du cours.
   * Utile pour l’affichage liste (prochain commit UI).
   */
  readonly enriched = computed(() => {
    const students = this.studentsSvc.students();
    const courses = this.coursesSvc.courses();

    const studentName = new Map(students.map((s) => [s.id, `${s.firstName} ${s.lastName}`]));
    const courseTitle = new Map(courses.map((c) => [c.id, c.title]));

    return this._notes().map((n) => ({
      ...n,
      studentName: studentName.get(n.studentId) ?? `#${n.studentId}`,
      courseTitle: courseTitle.get(n.courseId) ?? `#${n.courseId}`,
    }));
  });

  // --- persistance
  private saveToStorage(list: Note[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private loadFromStorage(): Note[] | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Note[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  // seed initial: on utilise les IDs existants (étudiants 1000..1011, cours 1..8)
  private seedInitial(): Note[] {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const students = Array.from({ length: 12 }, (_, i) => 1000 + i); // 1000..1011
    const courses = [1, 2, 3, 4, 5, 6, 7, 8];

    const today = this.today();
    const nowIso = new Date().toISOString();

    const seed: Note[] = [];

    // 2 notes par étudiant sur 2 cours pour démo
    for (const sid of students) {
      const c1 = courses[rand(0, courses.length - 1)];
      const c2 = courses[rand(0, courses.length - 1)];
      seed.push({
        id: seed.length + 1,
        studentId: sid,
        courseId: c1,
        value: rand(8, 18),
        date: today,
        createdAt: nowIso,
      });
      seed.push({
        id: seed.length + 1,
        studentId: sid,
        courseId: c2,
        value: rand(6, 19),
        date: today,
        createdAt: nowIso,
      });
    }

    this.saveToStorage(seed);
    return seed;
  }
}

// aide debug console (optionnel)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).NotesServiceToken = NotesService;
