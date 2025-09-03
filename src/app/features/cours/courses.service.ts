import { Injectable, computed, signal } from '@angular/core';
import { Course } from './course.model';

const STORAGE_KEY = 'courses';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly _courses = signal<Course[]>(this.load());
  readonly courses = this._courses.asReadonly();

  /** Liste triée par 'order' croissant */
  readonly ordered = computed(() => [...this._courses()].sort((a, b) => a.order - b.order));

  async getAll(): Promise<void> {
    // mock délai
    await new Promise((r) => setTimeout(r, 200));
  }

  async create(input: Omit<Course, 'id' | 'order'> & { order?: number }): Promise<Course> {
    await new Promise((r) => setTimeout(r, 200));
    const nextId = Date.now();
    const current = [...this._courses()];
    const order = Number.isFinite(input.order as number)
      ? (input.order as number)
      : current.length + 1;

    const course: Course = {
      id: nextId,
      title: input.title,
      teacher: input.teacher,
      ects: input.ects,
      date: input.date,
      order,
      studentIds: input.studentIds ?? [],
    };
    current.push(course);
    this._courses.set(this.normalizeOrder(current));
    this.save();
    return course;
  }

  async update(id: number, patch: Partial<Omit<Course, 'id'>>): Promise<Course | null> {
    await new Promise((r) => setTimeout(r, 200));
    const arr = [...this._courses()];
    const idx = arr.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...patch };
    this._courses.set(this.normalizeOrder(arr));
    this.save();
    return arr[idx];
  }

  async remove(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const arr = this._courses().filter((c) => c.id !== id);
    this._courses.set(this.normalizeOrder(arr));
    this.save();
  }

  async getById(id: number): Promise<Course | null> {
    await new Promise((r) => setTimeout(r, 150));
    return this._courses().find((c) => c.id === id) ?? null;
  }

  /** Déplacement d'une carte (drag & drop) */
  async move(fromIndex: number, toIndex: number): Promise<void> {
    const arr = [...this.ordered()];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    const normalized = arr.map((c, i) => ({ ...c, order: i + 1 }));
    this._courses.set(normalized);
    this.save();
    // mock délai
    await new Promise((r) => setTimeout(r, 100));
  }

  private normalizeOrder(arr: Course[]): Course[] {
    return [...arr].sort((a, b) => a.order - b.order).map((c, i) => ({ ...c, order: i + 1 }));
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._courses()));
  }

  private load(): Course[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // seed léger
      return [
        {
          id: 1,
          title: 'Angular Avancé',
          teacher: 'Dr. Martin',
          ects: 5,
          date: '2025-09-10',
          order: 1,
          studentIds: [],
        },
        {
          id: 2,
          title: 'Bases de Données',
          teacher: 'Mme. Leroy',
          ects: 4,
          date: '2025-09-12',
          order: 2,
          studentIds: [],
        },
      ];
    }
    try {
      const data = JSON.parse(raw) as Course[];
      return data.map((c, i) => ({
        ...c,
        studentIds: c.studentIds ?? [],
        order: c.order ?? i + 1,
      }));
    } catch {
      return [];
    }
  }
}
