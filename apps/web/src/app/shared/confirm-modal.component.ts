import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="modal-overlay" (click)="cancel.emit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ title() }}</h3>
            <button class="modal-close" (click)="cancel.emit()">&times;</button>
          </div>
          <p style="color: var(--color-text-muted); margin: 0 0 20px;">{{ message() }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancel.emit()">{{ cancelLabel() }}</button>
            <button class="btn" [class.btn-danger]="danger()" [class.btn-primary]="!danger()" (click)="confirm.emit()">{{ confirmLabel() }}</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  readonly visible = input(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly danger = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
