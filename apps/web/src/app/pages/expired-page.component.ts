import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-expired-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg);">
      <div class="card" style="text-align: center; padding: 48px; max-width: 400px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="1.5" style="margin: 0 auto 16px;">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <h2 style="margin: 0 0 8px; font-size: 1.25rem;">Link Expired</h2>
        <p style="color: var(--color-text-muted); margin: 0 0 24px; font-size: 0.875rem;">
          This short link has expired and is no longer available.
        </p>
        <a routerLink="/" class="btn btn-primary">Go Home</a>
      </div>
    </div>
  `
})
export class ExpiredPageComponent {}
