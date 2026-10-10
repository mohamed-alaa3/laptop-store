import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly changed = output<number>();

  /**
   * Generate the list of page numbers to display.
   * Includes ellipsis (represented by -1) for skipped ranges.
   *
   * Examples:
   * - 1 page → [1]
   * - 5 pages, current 3 → [1, 2, 3, 4, 5]
   * - 10 pages, current 1 → [1, 2, 3, 4, -1, 10]
   * - 10 pages, current 5 → [1, -1, 4, 5, 6, -1, 10]
   */
  readonly pages = computed<(number | -1)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 1) return [1];
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const result: (number | -1)[] = [];

    // Always show first page
    result.push(1);

    // Calculate range around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) result.push(-1); // ellipsis

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (end < total - 1) result.push(-1); // ellipsis

    // Always show last page
    result.push(total);

    return result;
  });

  readonly hasPrev = computed(() => this.currentPage() > 1);
  readonly hasNext = computed(() => this.currentPage() < this.totalPages());

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    if (page === this.currentPage()) return;
    this.changed.emit(page);
  }

  prev(): void {
    if (this.hasPrev()) {
      this.changed.emit(this.currentPage() - 1);
    }
  }

  next(): void {
    if (this.hasNext()) {
      this.changed.emit(this.currentPage() + 1);
    }
  }
}
