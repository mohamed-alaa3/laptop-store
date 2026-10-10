import { Injectable, signal, computed, effect } from '@angular/core';

const STORAGE_KEY = 'click-compare';
const MAX_COMPARE = 4;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly _ids = signal<string[]>(this.loadFromStorage());

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);
  readonly isEmpty = computed(() => this._ids().length === 0);
  readonly isFull = computed(() => this._ids().length >= MAX_COMPARE);
  readonly max = MAX_COMPARE;

  constructor() {
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
              this._ids.set(parsed.filter((id) => typeof id === 'string').slice(0, MAX_COMPARE));
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

  isInCompare(id: string) {
    return computed(() => this._ids().includes(id));
  }

  /**
   * Returns:
   * - 'added': successfully added
   * - 'removed': successfully removed (was already in list)
   * - 'full': cannot add because max reached
   */
  add(id: string): 'added' | 'full' {
    if (this.has(id)) return 'added';
    if (this.isFull()) return 'full';
    this._ids.update((ids) => [...ids, id]);
    return 'added';
  }

  remove(id: string): boolean {
    if (!this.has(id)) return false;
    this._ids.update((ids) => ids.filter((x) => x !== id));
    return true;
  }

  toggle(id: string): 'added' | 'removed' | 'full' {
    if (this.has(id)) {
      this.remove(id);
      return 'removed';
    }
    return this.add(id);
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
      return parsed.filter((id) => typeof id === 'string').slice(0, MAX_COMPARE);
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
