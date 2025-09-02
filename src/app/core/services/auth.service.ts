import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'etudiant';
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';

  private readonly _user = signal<User | null>(this.loadFromStorage());

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  // constructor() supprimé car inutile

  async login(email: string, password: string): Promise<User> {
    // simulate API delay
    await new Promise((res) => setTimeout(res, 500));

    // mock "use" du password (juste pour ESLint, pas de vraie vérif)
    if (!password || password.length < 3) {
      throw new Error('Invalid password');
    }

    // mock user (simple rule: admin if contains "admin")
    const role: 'admin' | 'etudiant' = email.includes('admin') ? 'admin' : 'etudiant';

    const user: User = {
      id: Date.now(),
      email,
      role,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
    };

    this._user.set(user);
    this.saveToStorage(user);
    return user;
  }

  async register(email: string, password: string): Promise<User> {
    // simulate API delay
    await new Promise((res) => setTimeout(res, 500));

    // mock "use" du password
    if (!password || password.length < 3) {
      throw new Error('Password too short');
    }

    const user: User = {
      id: Date.now(),
      email,
      role: 'etudiant',
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
    };

    this._user.set(user);
    this.saveToStorage(user);
    return user;
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveToStorage(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private loadFromStorage(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
