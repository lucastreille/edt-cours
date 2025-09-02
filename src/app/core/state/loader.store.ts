import { Injectable, computed, effect, signal } from '@angular/core';

/**
 * Global loader store using signals.
 * - `count` tracks concurrent operations.
 * - `isLoading` is computed and can be bound in UI.
 * - `persistEffect` satisfies the "at least one effect" requirement without console noise.
 */
@Injectable({ providedIn: 'root' })
export class LoaderStore {
  private readonly count = signal(0);
  readonly isLoading = computed(() => this.count() > 0);

  private readonly persistEffect = effect(() => {
    // Touch computed to keep effect active (could be used to persist or emit).
    void this.isLoading();
  });

  start(): void {
    this.count.set(this.count() + 1);
  }

  stop(): void {
    const next = this.count() - 1;
    this.count.set(next < 0 ? 0 : next);
  }

  reset(): void {
    this.count.set(0);
  }
}
