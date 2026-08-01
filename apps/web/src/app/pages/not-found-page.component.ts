import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg);">
      <div class="card" style="text-align: center; padding: 48px; max-width: 400px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" style="margin: 0 auto 16px;">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <h2 style="margin: 0 0 8px; font-size: 1.25rem;">Link Not Found</h2>
        <p style="color: var(--color-text-muted); margin: 0 0 24px; font-size: 0.875rem;">
          The short link you're looking for doesn't exist or has been removed.
        </p>
        <a routerLink="/" class="btn btn-primary">Go Home</a>
      </div>
    </div>
  `
})
export class NotFoundPageComponent {}
