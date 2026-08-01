import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card" style="padding: 32px;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 4px;">Create account</h1>
      <p style="color: var(--color-text-muted); margin: 0 0 24px; font-size: 0.875rem;">Start shortening links in seconds</p>

      <form (ngSubmit)="onSubmit()" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="name">Name</label>
          <input id="name" type="text" class="input" [(ngModel)]="name" name="name" required placeholder="Your name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input id="email" type="email" class="input" [(ngModel)]="email" name="email" required autocomplete="email" placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input id="password" type="password" class="input" [(ngModel)]="password" name="password" required autocomplete="new-password" placeholder="Min. 8 characters" />
        </div>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        <button type="submit" class="btn btn-primary" style="width: 100%;" [disabled]="loading()">
          @if (loading()) { <span class="spinner"></span> Creating account... }
          @else { Create account }
        </button>
      </form>

      <p style="text-align: center; margin-top: 20px; font-size: 0.875rem; color: var(--color-text-muted);">
        Already have an account? <a routerLink="/login">Sign in</a>
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
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected name = '';
  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected errorMessage = signal('');

  async onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage.set('Password must be at least 8 characters');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const res = await this.auth.register({ name: this.name, email: this.email, password: this.password }).toPromise();
      if (res?.data) {
        this.auth.setSession(res.data);
        this.toast.success('Account created successfully');
        await this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Registration failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
