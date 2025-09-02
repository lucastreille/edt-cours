import { Injectable, signal, computed, inject } from '@angular/core';
import { LoaderStore } from '../state/loader.store';

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
  private readonly loader = inject(LoaderStore);

  // public API (signals)
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);
  readonly token = computed(() => this._user()?.token ?? null);

  async login(email: string, password: string): Promise<User> {
    this.loader.start();
    try {
      // simulate API delay
      await new Promise((res) => setTimeout(res, 700));

      if (!password || password.length < 3) {
        throw new Error('Invalid password');
      }

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
    } finally {
      this.loader.stop();
    }
  }

  async register(email: string, password: string): Promise<User> {
    this.loader.start();
    try {
      // simulate API delay
      await new Promise((res) => setTimeout(res, 700));

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
    } finally {
      this.loader.stop();
    }
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // (optionnel) getter pratique si tu préfères l’appeler ailleurs
  getToken(): string | null {
    return this._user()?.token ?? null;
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
