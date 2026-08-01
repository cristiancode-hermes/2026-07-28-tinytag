import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button (click)="goTo.emit(1)" [disabled]="page() <= 1">&laquo;</button>
        <button (click)="goTo.emit(page() - 1)" [disabled]="page() <= 1">&lsaquo;</button>
        @for (p of visiblePages(); track p) {
          <button [class.active]="p === page()" (click)="goTo.emit(p)">{{ p }}</button>
        }
        <button (click)="goTo.emit(page() + 1)" [disabled]="page() >= totalPages()">&rsaquo;</button>
        <button (click)="goTo.emit(totalPages())" [disabled]="page() >= totalPages()">&raquo;</button>
      </div>
    }
  `
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly goTo = output<number>();

  protected visiblePages(): number[] {
    const current = this.page();
    const total = this.totalPages();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
