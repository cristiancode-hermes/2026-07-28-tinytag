import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-list">
      @for (item of [].constructor(items()); track $index) {
        <div class="skeleton-row">
          @switch (type()) {
            @case ('card') {
              <div class="skeleton skeleton-card"></div>
            }
            @case ('table-row') {
              <div class="skeleton skeleton-cell" style="width: 60%"></div>
              <div class="skeleton skeleton-cell" style="width: 30%"></div>
              <div class="skeleton skeleton-cell" style="width: 20%"></div>
            }
            @case ('chart') {
              <div class="skeleton" style="height: 200px; width: 100%;"></div>
            }
            @default {
              <div class="skeleton skeleton-cell" style="width: 100%"></div>
              <div class="skeleton skeleton-cell" style="width: 80%"></div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
    .skeleton-row { display: flex; gap: 16px; align-items: center; }
    .skeleton-card { height: 100px; width: 100%; }
    .skeleton-cell { height: 16px; }
  `]
})
export class LoadingSkeletonComponent {
  readonly items = input(3);
  readonly type = input<'card' | 'table-row' | 'chart' | 'text'>('text');
}
