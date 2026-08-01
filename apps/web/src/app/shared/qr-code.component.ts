import { Component, input } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  template: `
    <div class="qr-container">
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 33 33" xmlns="http://www.w3.org/2000/svg">
        <rect width="33" height="33" fill="white" rx="2"/>
        <!-- Finder patterns -->
        <rect x="2" y="2" width="7" height="7" rx="1" fill="#1E293B"/>
        <rect x="4" y="4" width="3" height="3" rx="0.5" fill="white"/>
        <rect x="24" y="2" width="7" height="7" rx="1" fill="#1E293B"/>
        <rect x="26" y="4" width="3" height="3" rx="0.5" fill="white"/>
        <rect x="2" y="24" width="7" height="7" rx="1" fill="#1E293B"/>
        <rect x="4" y="26" width="3" height="3" rx="0.5" fill="white"/>
        <!-- Data modules (simplified QR) -->
        @for (row of modules(); track row) {
          @for (mod of row; track mod.x; let ci = $index) {
            @if (mod.on) {
              <rect [attr.x]="mod.x" [attr.y]="mod.y" width="1" height="1" fill="#1E293B"/>
            }
          }
        }
      </svg>
      <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: 'JetBrains Mono', monospace;">{{ url() }}</span>
    </div>
  `
})
export class QrCodeComponent {
  readonly url = input.required<string>();
  readonly size = input<number>(160);

  protected modules(): { x: number; y: number; on: boolean }[][] {
    const url = this.url();
    // Generate deterministic pseudo-random QR-like pattern based on URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    const rows: { x: number; y: number; on: boolean }[][] = [];
    let rng = hash;
    for (let y = 0; y < 33; y++) {
      const row: { x: number; y: number; on: boolean }[] = [];
      for (let x = 0; x < 33; x++) {
        // Reserved areas (finder patterns, timing, etc.)
        const reserved = (y < 9 && x < 9) || (y < 9 && x > 23) || (y > 23 && x < 9);
        const timing = (y === 6 && x > 7 && x < 25) || (x === 6 && y > 7 && y < 25);
        const darkModule = (y === 24 && x === 8);

        if (reserved || timing) {
          row.push({ x, y, on: timing || darkModule });
        } else {
          rng = (rng * 1103515245 + 12345) & 0x7fffffff;
          const on = (rng & 0x100) !== 0;
          row.push({ x, y, on });
        }
      }
      rows.push(row);
    }
    return rows;
  }
}
