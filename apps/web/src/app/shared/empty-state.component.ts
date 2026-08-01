import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      @if (icon(); as iconSvg) {
        <div class="empty-icon" [innerHTML]="iconSvg"></div>
      } @else {
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-text-muted);">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
      }
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
      @if (ctaLabel()) {
        <button class="btn btn-primary" (click)="ctaClick.emit()">{{ ctaLabel() }}</button>
      }
    </div>
  `,
  styles: [`
    .empty-icon { margin-bottom: 8px; opacity: 0.6; }
  `]
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly ctaLabel = input<string>();
  readonly icon = input<string>();
  readonly ctaClick = output<void>();
}
