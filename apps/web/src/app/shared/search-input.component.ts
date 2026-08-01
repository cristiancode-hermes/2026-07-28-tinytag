import { Component, input, model, OnInit, effect, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-wrapper">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        class="input"
        style="padding-left: 36px;"
        [placeholder]="placeholder()"
        [(ngModel)]="query"
        (ngModelChange)="onQueryChange()"
      />
      @if (query) {
        <button class="clear-btn" (click)="clear()">&times;</button>
      }
    </div>
  `,
  styles: [`
    .search-wrapper { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
    .clear-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 1.25rem; padding: 0 4px; line-height: 1; }
  `]
})
export class SearchInputComponent implements OnInit {
  readonly placeholder = input('Search...');
  readonly debounceMs = input(300);
  readonly search = model<string>('');

  protected query = '';

  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    const sub = this.searchSubject.pipe(
      debounceTime(this.debounceMs()),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.set(value);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected onQueryChange() {
    this.searchSubject.next(this.query);
  }

  protected clear() {
    this.query = '';
    this.search.set('');
  }
}
