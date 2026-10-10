import { Injectable, signal, computed, effect } from '@angular/core';

const STORAGE_KEY = 'click-wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _ids = signal<string[]>(this.loadFromStorage());

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);
  readonly isEmpty = computed(() => this._ids().length === 0);

  constructor() {
    // Persist changes to localStorage
    effect(() => {
      this.persist(this._ids());
    });

    // Sync across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (Array.isArray(parsed)) {
              this._ids.set(parsed.filter((id) => typeof id === 'string'));
            }
          } catch {
            // ignore malformed
          }
        }
      });
    }
  }

  has(id: string): boolean {
    return this._ids().includes(id);
  }

  /**
   * Signal-based check — useful in templates.
   */
  isInWishlist(id: string) {
    return computed(() => this._ids().includes(id));
  }

  add(id: string): boolean {
    if (this.has(id)) return false;
    this._ids.update((ids) => [...ids, id]);
    return true;
  }

  remove(id: string): boolean {
    if (!this.has(id)) return false;
    this._ids.update((ids) => ids.filter((x) => x !== id));
    return true;
  }

  toggle(id: string): 'added' | 'removed' {
    if (this.has(id)) {
      this.remove(id);
      return 'removed';
    }
    this.add(id);
    return 'added';
  }

  clear(): void {
    this._ids.set([]);
  }

  private loadFromStorage(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((id) => typeof id === 'string');
    } catch {
      return [];
    }
  }

  private persist(ids: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Silently ignore storage errors
    }
  }
}
