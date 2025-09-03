import { Injectable, signal, computed, inject } from '@angular/core';
import { Course, CreateCourseDto, UpdateCourseDto } from './course.model';
import { LoaderStore } from '../../core/state/loader.store';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly STORAGE_KEY = 'courses_data';
  private readonly loader = inject(LoaderStore);

  private readonly _courses = signal<Course[]>(this.loadFromStorage() ?? this.seedInitial());
  readonly courses = computed(() => this._courses());
  readonly total = computed(() => this._courses().length);

  private async delay(ms = 400): Promise<void> {
    await new Promise((res) => setTimeout(res, ms));
  }

  async getAll(): Promise<Course[]> {
    this.loader.start();
    try {
      await this.delay(250);
      // tri par order asc
      return [...this._courses()].sort((a, b) => a.order - b.order);
    } finally {
      this.loader.stop();
    }
  }

  async getById(id: number): Promise<Course | null> {
    this.loader.start();
    try {
      await this.delay(200);
      return this._courses().find((c) => c.id === id) ?? null;
    } finally {
      this.loader.stop();
    }
  }

  async create(input: CreateCourseDto): Promise<Course> {
    this.loader.start();
    try {
      await this.delay(350);
      const list = this._courses();
      const nextId = list.length ? Math.max(...list.map((c) => c.id)) + 1 : 1;
      const nextOrder = Number.isFinite(input.order as number)
        ? (input.order as number)
        : list.length; // en fin de liste
      const course: Course = {
        id: nextId,
        title: input.title.trim(),
        teacher: input.teacher.trim(),
        ects: Number(input.ects),
        description: input.description.trim(),
        order: nextOrder,
        createdAt: new Date().toISOString(),
      };
      const updated = [...list, course];
      this._courses.set(this.normalizeOrder(updated));
      this.saveToStorage(this._courses());
      return course;
    } finally {
      this.loader.stop();
    }
  }

  async update(id: number, changes: UpdateCourseDto): Promise<Course> {
    this.loader.start();
    try {
      await this.delay(350);
      let updatedItem: Course | null = null;
      const updated = this._courses().map((c) => {
        if (c.id !== id) return c;
        updatedItem = {
          ...c,
          ...changes,
          title: (changes.title ?? c.title).trim(),
          teacher: (changes.teacher ?? c.teacher).trim(),
          description: (changes.description ?? c.description).trim(),
          ects: Number(changes.ects ?? c.ects),
        };
        return updatedItem;
      });
      if (!updatedItem) throw new Error('Cours introuvable');
      this._courses.set(this.normalizeOrder(updated));
      this.saveToStorage(this._courses());
      return updatedItem;
    } finally {
      this.loader.stop();
    }
  }

  async remove(id: number): Promise<void> {
    this.loader.start();
    try {
      await this.delay(250);
      const filtered = this._courses().filter((c) => c.id !== id);
      if (filtered.length === this._courses().length) throw new Error('Cours introuvable');
      this._courses.set(this.normalizeOrder(filtered));
      this.saveToStorage(this._courses());
    } finally {
      this.loader.stop();
    }
  }

  /**
   * Réordonner (pour prochain commit drag & drop).
   * Déplace l’élément d’un index à un autre et renumérote les "order".
   */
  async reorder(fromIndex: number, toIndex: number): Promise<void> {
    this.loader.start();
    try {
      await this.delay(120);
      const arr = [...this._courses()].sort((a, b) => a.order - b.order);
      if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return;
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      this._courses.set(this.normalizeOrder(arr));
      this.saveToStorage(this._courses());
    } finally {
      this.loader.stop();
    }
  }

  // --- helpers persistance & seed
  private saveToStorage(list: Course[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private loadFromStorage(): Course[] | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Course[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private normalizeOrder(list: Course[]): Course[] {
    return list.map((c, i) => ({ ...c, order: i }));
  }

  private seedInitial(): Course[] {
    const now = new Date().toISOString();
    const seed: Course[] = [
      {
        id: 1,
        title: 'Angular Avancé',
        teacher: 'Dr. Martin',
        ects: 5,
        description: 'Signals, standalone, perf.',
        order: 0,
        createdAt: now,
      },
      {
        id: 2,
        title: 'TypeScript',
        teacher: 'S. Durand',
        ects: 4,
        description: 'Types stricts, génériques.',
        order: 1,
        createdAt: now,
      },
      {
        id: 3,
        title: 'Bases de données',
        teacher: 'A. Bernard',
        ects: 6,
        description: 'Modélisation, SQL.',
        order: 2,
        createdAt: now,
      },
      {
        id: 4,
        title: 'DevOps',
        teacher: 'C. Petit',
        ects: 3,
        description: 'CI/CD, conteneurs.',
        order: 3,
        createdAt: now,
      },
      {
        id: 5,
        title: 'Sécurité Web',
        teacher: 'L. Robert',
        ects: 3,
        description: 'OWASP, Auth.',
        order: 4,
        createdAt: now,
      },
      {
        id: 6,
        title: 'UX / UI',
        teacher: 'E. Richard',
        ects: 2,
        description: 'Design systèmes.',
        order: 5,
        createdAt: now,
      },
      {
        id: 7,
        title: 'Algorithmes',
        teacher: 'P. Moreau',
        ects: 5,
        description: 'Complexité et graphes.',
        order: 6,
        createdAt: now,
      },
      {
        id: 8,
        title: 'Réseaux',
        teacher: 'H. Simon',
        ects: 4,
        description: 'HTTP, TCP/IP.',
        order: 7,
        createdAt: now,
      },
    ];
    this.saveToStorage(seed);
    return seed;
  }
}

// aide console (optionnel)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).CoursesServiceToken = CoursesService;
