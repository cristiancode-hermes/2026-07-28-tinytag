import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem('tinytag-theme');
    const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.isDark.set(dark);
    this.apply(dark);
  }

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    this.apply(next);
  }

  private apply(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('tinytag-theme', dark ? 'dark' : 'light');
  }
}
