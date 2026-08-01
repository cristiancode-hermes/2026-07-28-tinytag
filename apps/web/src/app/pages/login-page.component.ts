import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card" style="padding: 32px;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 4px;">Welcome back</h1>
      <p style="color: var(--color-text-muted); margin: 0 0 24px; font-size: 0.875rem;">Sign in to your TinyTag account</p>

      <form (ngSubmit)="onSubmit()" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="input"
            [(ngModel)]="email"
            name="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            type="password"
            class="input"
            [(ngModel)]="password"
            name="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        <button type="submit" class="btn btn-primary" style="width: 100%;" [disabled]="loading()">
          @if (loading()) {
            <span class="spinner"></span> Signing in...
          } @else {
            Sign in
          }
        </button>
      </form>

      <p style="text-align: center; margin-top: 20px; font-size: 0.875rem; color: var(--color-text-muted);">
        Don't have an account? <a routerLink="/register">Create one</a>
      </p>
    </div>
  `,
  styles: [`
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.813rem; font-weight: 600; color: var(--color-text); }
    .error-message { padding: 10px 14px; background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); border-radius: 8px; font-size: 0.813rem; }
  `]
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected errorMessage = signal('');

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const res = await this.auth.login({ email: this.email, password: this.password }).toPromise();
      if (res?.data) {
        this.auth.setSession(res.data);
        this.toast.success('Signed in successfully');
        await this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Invalid email or password');
    } finally {
      this.loading.set(false);
    }
  }
}
