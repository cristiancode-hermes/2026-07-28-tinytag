import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="kpi-card">
      <div class="kpi-icon" [style.background]="iconBg()">
        <ng-content select="[icon]" />
      </div>
      <div>
        <div class="kpi-value">{{ value() }}</div>
        <div class="kpi-label">{{ label() }}</div>
        @if (trend(); as t) {
          <div class="kpi-trend" [class.trend-up]="t > 0" [class.trend-down]="t < 0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              @if (t > 0) { <polyline points="18 15 12 9 6 15"/> }
              @if (t < 0) { <polyline points="6 9 12 15 18 9"/> }
            </svg>
            <span>{{ t > 0 ? '+' : '' }}{{ t }}%</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .kpi-trend { display: flex; align-items: center; gap: 2px; font-size: 0.75rem; font-weight: 600; margin-top: 4px; }
    .trend-up { color: var(--color-success); }
    .trend-down { color: var(--color-danger); }
  `]
})
export class KpiCardComponent {
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
  readonly trend = input<number>();
  readonly iconBg = input<string>('color-mix(in srgb, var(--color-primary) 10%, transparent)');
}
