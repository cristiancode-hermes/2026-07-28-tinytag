import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-chart-donut',
  standalone: true,
  template: `
    <svg [attr.viewBox]="viewBox()" [attr.width]="size()" [attr.height]="size()">
      @for (slice of slices(); track slice.index) {
        <circle
          cx="50%" cy="50%" r="40%"
          fill="none"
          [attr.stroke]="slice.color"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="slice.dashArray"
          [attr.stroke-dashoffset]="slice.dashOffset"
          [attr.transform]="'rotate(-90, ' + (size() / 2) + ', ' + (size() / 2) + ')'"
          style="transition: stroke-dasharray 0.3s ease;"
        />
      }
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="var(--color-text)" font-size="14" font-weight="700">{{ centerText() }}</text>
    </svg>
    <div class="donut-legend">
      @for (item of data(); track item.label) {
        <div class="legend-item">
          <span class="legend-dot" [style.background]="item.color"></span>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; align-items: center; gap: 20px; }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.813rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { color: var(--color-text-muted); flex: 1; }
    .legend-value { font-weight: 600; color: var(--color-text); }
  `]
})
export class ChartDonutComponent {
  readonly data = input.required<{ label: string; value: number; color: string }[]>();
  readonly size = input(180);
  readonly strokeWidth = input(20);
  readonly centerText = input('');

  private colors = ['#E85D3A', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  protected slices = computed(() => {
    const data = this.data();
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const circumference = 2 * Math.PI * (this.size() * 0.4);
    let offset = 0;
    return data.map((d, i) => {
      const fraction = total > 0 ? d.value / total : 0.01;
      const length = circumference * fraction;
      const slice = {
        index: i,
        color: d.color || this.colors[i % this.colors.length],
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -offset,
        value: d.value
      };
      offset += length;
      return slice;
    });
  });

  protected viewBox = computed(() => `0 0 ${this.size()} ${this.size()}`);
}
