import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tag-pill',
  standalone: true,
  template: `
    <span class="tag-pill" [style.background]="bgColor()" [style.color]="fgColor()">
      {{ name() }}
      @if (dismissible()) {
        <span class="dismiss" (click)="dismiss.emit()">&times;</span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
  `]
})
export class TagPillComponent {
  readonly name = input.required<string>();
  readonly color = input<string>('#E85D3A');
  readonly dismissible = input(false);
  readonly dismiss = output<void>();

  protected bgColor() {
    return `color-mix(in srgb, ${this.color()} 15%, transparent)`;
  }

  protected fgColor() {
    return this.color();
  }
}
