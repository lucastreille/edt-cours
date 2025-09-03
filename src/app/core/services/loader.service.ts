import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly _loading = signal(false);

  /** Accès réactif si besoin ailleurs */
  readonly loading = computed<boolean>(() => this._loading());

  /** Accès simple (type sûr) pour les composants */
  isLoading(): boolean {
    return this._loading();
  }

  show(): void {
    this._loading.set(true);
  }

  hide(): void {
    this._loading.set(false);
  }
}
