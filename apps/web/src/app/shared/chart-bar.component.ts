import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-chart-bar',
  standalone: true,
  template: `
    <svg [attr.viewBox]="viewBox()" [attr.width]="width()" [attr.height]="height()" style="overflow: visible;">
      <!-- Y axis grid lines -->
      @for (gl of gridLines(); track gl.y) {
        <line [attr.x1]="padding.left" [attr.y1]="gl.y" [attr.x2]="width()" [attr.y2]="gl.y" stroke="var(--color-border)" stroke-width="1"/>
        <text [attr.x]="padding.left - 6" [attr.y]="gl.y + 4" fill="var(--color-text-muted)" font-size="10" text-anchor="end">{{ gl.label }}</text>
      }
      <!-- Bars -->
      @for (bar of bars(); track bar.index) {
        <rect
          [attr.x]="bar.x"
          [attr.y]="bar.y"
          [attr.width]="bar.width"
          [attr.height]="bar.height"
          [attr.fill]="bar.color || 'var(--color-primary)'"
          rx="3"
        />
        @if (bar.value > 0) {
          <text [attr.x]="bar.x + bar.width / 2" [attr.y]="bar.y - 6" fill="var(--color-text)" font-size="10" text-anchor="middle">{{ bar.value }}</text>
        }
      }
      <!-- X labels -->
      @for (bar of bars(); track bar.index) {
        <text [attr.x]="bar.x + bar.width / 2" [attr.y]="height() - 4" fill="var(--color-text-muted)" font-size="10" text-anchor="middle" [attr.transform]="'rotate(-45, ' + (bar.x + bar.width / 2) + ', ' + (height() - 4) + ')'">{{ bar.label }}</text>
      }
    </svg>
  `
})
export class ChartBarComponent {
  readonly data = input.required<{ label: string; value: number; color?: string }[]>();
  readonly width = input(500);
  readonly height = input(280);
  readonly horizontal = input(false);

  protected padding = { top: 20, right: 20, bottom: 60, left: 40 };

  protected viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`);
  protected maxValue = computed(() => Math.max(...this.data().map(d => d.value), 1));

  protected innerHeight = computed(() => this.height() - this.padding.top - this.padding.bottom);
  protected innerWidth = computed(() => this.width() - this.padding.left - this.padding.right);

  protected gridLines = computed(() => {
    const max = this.maxValue();
    const steps = 4;
    const lines: { y: number; label: string }[] = [];
    for (let i = 0; i <= steps; i++) {
      const value = Math.round((max / steps) * i);
      const y = this.padding.top + this.innerHeight() - (value / max) * this.innerHeight();
      lines.push({ y, label: String(value) });
    }
    return lines;
  });

  protected bars = computed(() => {
    const data = this.data();
    const max = this.maxValue();
    const h = this.innerHeight();
    const count = data.length;
    const totalWidth = this.innerWidth();
    const barWidth = Math.min(40, (totalWidth / count) * 0.7);
    const gap = count > 1 ? (totalWidth - barWidth * count) / (count - 1) : 0;

    return data.map((d, i) => {
      const barHeight = (d.value / max) * h;
      const x = this.padding.left + i * (barWidth + gap);
      const y = this.padding.top + h - barHeight;
      return {
        index: i,
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: d.value,
        label: d.label,
        color: d.color
      };
    });
  });
}
