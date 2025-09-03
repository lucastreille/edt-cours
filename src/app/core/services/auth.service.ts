import { Injectable, computed, signal, inject } from '@angular/core';
import { StudentsService } from '../../features/etudiants/students.service';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'etudiant';
  token: string;
  /** Lien vers l'entité Étudiant (utilisé pour filtrer Cours/Notes côté étudiant) */
  studentId?: number;
}

interface RegisteredUser {
  email: string;
  password: string;
  /** Association éventuelle à un étudiant existant */
  studentId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';
  private readonly USERS_KEY = 'auth_users';

  /** Comptes de démo (login strict: email + mdp exacts) */
  private readonly DEMO_ACCOUNTS: Record<
    string,
    {
      password: string;
      role: 'admin' | 'etudiant';
      studentId?: number;
    }
  > = {
    'admin@test.com': { password: '123456', role: 'admin' },
    'user@test.com': { password: '123456', role: 'etudiant', studentId: 1 },
    'alice@test.com': { password: '123456', role: 'etudiant', studentId: 2 },
    'bob@test.com': { password: '123456', role: 'etudiant', studentId: 3 },
  };

  // ✅ injection typée (évite "unknown")
  private readonly studentsSvc: StudentsService = inject(StudentsService);

  private readonly _user = signal<User | null>(this.loadFromStorage());

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  // -------------------------
  // Public API
  // -------------------------
  async login(email: string, password: string): Promise<User> {
    await this.simDelay(200);

    const emailKey = email.trim().toLowerCase();
    if (password.length < 3) throw new Error('Identifiants invalides');

    // 1) Comptes démo stricts
    const demo = this.DEMO_ACCOUNTS[emailKey];
    if (demo) {
      if (password !== demo.password) throw new Error('Identifiants invalides');

      // sécurité: si compte démo étudiant sans studentId → on le résout par email
      let sid = demo.studentId;
      if (demo.role === 'etudiant' && !Number.isFinite(sid as number)) {
        sid = await this.studentsSvc.ensureByEmail(emailKey);
      }

      const user: User = {
        id: Date.now(),
        email: emailKey,
        role: demo.role,
        token: this.makeToken(),
        studentId: sid,
      };
      this.setUser(user);
      return user;
    }

    // 2) Comptes enregistrés (via Register)
    const reg = this.findRegistered(emailKey);
    if (!reg || reg.password !== password) throw new Error('Identifiants invalides');

    // si pas encore de studentId, on le crée/trouve maintenant puis on persiste
    let sid = reg.studentId;
    if (!Number.isFinite(sid as number)) {
      sid = await this.studentsSvc.ensureByEmail(emailKey);
      const users = this.loadUsers().map((u) =>
        u.email === emailKey ? { ...reg, studentId: sid } : u,
      );
      this.saveUsers(users);
    }

    const user: User = {
      id: Date.now(),
      email: emailKey,
      role: 'etudiant',
      token: this.makeToken(),
      studentId: sid,
    };
    this.setUser(user);
    return user;
  }

  async register(email: string, password: string): Promise<User> {
    await this.simDelay(200);

    const emailKey = email.trim().toLowerCase();
    if (password.length < 3) throw new Error('Mot de passe trop court');
    if (this.DEMO_ACCOUNTS[emailKey]) throw new Error('Cet email est réservé à un compte de démo');

    const users = this.loadUsers();
    if (users.some((u) => u.email === emailKey)) {
      throw new Error('Un compte existe déjà avec cet email');
    }

    // 🔗 crée/trouve l'étudiant par email et récupère son id
    const sid = await this.studentsSvc.ensureByEmail(emailKey);

    // on enregistre le compte utilisateur avec son studentId
    const reg: RegisteredUser = { email: emailKey, password, studentId: sid };
    users.push(reg);
    this.saveUsers(users);

    // auto-login
    const user: User = {
      id: Date.now(),
      email: emailKey,
      role: 'etudiant',
      token: this.makeToken(),
      studentId: sid,
    };
    this.setUser(user);
    return user;
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // -------------------------
  // Helpers (storage & utils)
  // -------------------------
  private setUser(user: User): void {
    this._user.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private loadFromStorage(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw) as Partial<User>;
      if (!u.email || !u.role) return null;
      return {
        id: typeof u.id === 'number' ? u.id : Date.now(),
        email: String(u.email),
        role: u.role === 'admin' ? 'admin' : 'etudiant',
        token: String(u.token ?? ''),
        studentId: typeof u.studentId === 'number' ? u.studentId : undefined,
      };
    } catch {
      return null;
    }
  }

  private loadUsers(): RegisteredUser[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as RegisteredUser[];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: RegisteredUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private findRegistered(emailKey: string): RegisteredUser | undefined {
    return this.loadUsers().find((u) => u.email === emailKey);
  }

  private makeToken(): string {
    return 'mock-jwt-' + Math.random().toString(36).slice(2);
  }

  private async simDelay(ms: number): Promise<void> {
    await new Promise((r) => setTimeout(r, ms));
  }
}
