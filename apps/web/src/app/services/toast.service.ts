import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) {
    this.add(message, 'success');
  }

  error(message: string) {
    this.add(message, 'error');
  }

  info(message: string) {
    this.add(message, 'info');
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(message: string, type: Toast['type']) {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
