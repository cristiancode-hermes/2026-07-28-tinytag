import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-brand">
          <a routerLink="/login" class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span>TinyTag</span>
          </a>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--color-bg); }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-brand { text-align: center; margin-bottom: 32px; }
    .auth-logo { display: inline-flex; align-items: center; gap: 10px; font-size: 1.5rem; font-weight: 700; color: var(--color-text); text-decoration: none; }
    .auth-logo svg { color: var(--color-primary); }
  `]
})
export class AuthLayoutComponent {}
