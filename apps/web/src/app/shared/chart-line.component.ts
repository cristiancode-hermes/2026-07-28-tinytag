import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-chart-line',
  standalone: true,
  template: `
    <svg [attr.viewBox]="viewBox()" [attr.width]="width()" [attr.height]="height()" style="overflow: visible;">
      @for (gl of gridLines(); track gl.y) {
        <line [attr.x1]="0" [attr.y1]="gl.y" [attr.x2]="innerWidth()" [attr.y2]="gl.y" stroke="var(--color-border)" stroke-width="1"/>
        <text [attr.x]="0" [attr.y]="gl.y - 4" fill="var(--color-text-muted)" font-size="10">{{ gl.label }}</text>
      }
      <polyline [attr.points]="linePoints()" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path [attr.d]="fillPath()" fill="url(#lineGradient)" opacity="0.15"/>
      @for (point of data(); track $index) {
        <circle [attr.cx]="xScale($index)" [attr.cy]="yScale(point.value)" r="3" fill="var(--color-primary)"/>
      }
      @for (label of xLabels(); track label.index) {
        <text [attr.x]="xScale(label.index)" [attr.y]="height() - 4" fill="var(--color-text-muted)" font-size="10" text-anchor="middle">{{ label.text }}</text>
      }
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--color-primary)"/>
          <stop offset="1" stop-color="var(--color-primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `
})
export class ChartLineComponent {
  readonly data = input.required<{ label: string; value: number }[]>();
  readonly width = input(500);
  readonly height = input(220);

  protected padding = { top: 20, right: 10, bottom: 30, left: 40 };
  protected innerWidth = computed(() => this.width() - this.padding.left - this.padding.right);
  protected innerHeight = computed(() => this.height() - this.padding.top - this.padding.bottom);

  protected viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`);

  private maxValue = computed(() => Math.max(...this.data().map(d => d.value), 1));

  protected yScale = (value: number) => {
    const max = this.maxValue();
    const h = this.innerHeight();
    return this.padding.top + h - (value / max) * h;
  };

  protected xScale = (index: number) => {
    const len = this.data().length;
    const w = this.innerWidth();
    return this.padding.left + (len > 1 ? (index / (len - 1)) * w : w / 2);
  };

  protected gridLines = computed(() => {
    const max = this.maxValue();
    const steps = 5;
    const lines: { y: number; label: string }[] = [];
    for (let i = 0; i <= steps; i++) {
      const value = Math.round((max / steps) * i);
      lines.push({ y: this.yScale(value), label: String(value) });
    }
    return lines;
  });

  protected xLabels = computed(() => {
    const data = this.data();
    if (data.length <= 6) {
      return data.map((d, i) => ({ index: i, text: d.label }));
    }
    const step = Math.ceil(data.length / 6);
    return data
      .map((d, i) => ({ index: i, text: d.label }))
      .filter((_, i) => i % step === 0 || i === data.length - 1);
  });

  protected linePoints = computed(() => {
    return this.data().map((d, i) => `${this.xScale(i)},${this.yScale(d.value)}`).join(' ');
  });

  protected fillPath = computed(() => {
    const data = this.data();
    if (data.length === 0) return '';
    const first = data[0];
    const last = data[data.length - 1];
    const points = data.map((d, i) => `${this.xScale(i)},${this.yScale(d.value)}`).join(' L ');
    return `M ${this.xScale(0)},${this.padding.top + this.innerHeight()} L ${points} L ${this.xScale(data.length - 1)},${this.padding.top + this.innerHeight()} Z`;
  });
}
