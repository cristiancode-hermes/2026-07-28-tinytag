import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiKeysService, ApiKey } from '../services/api-keys.service';
import { ThemeService } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, ConfirmModalComponent, DatePipe],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Manage your account and preferences</p>
      </div>
    </div>

    <!-- Profile Section -->
    <div class="card settings-section">
      <h3 class="settings-section-title">Profile</h3>
      <form (ngSubmit)="updateProfile()" class="settings-form">
        <div class="form-group">
          <label class="form-label" for="name">Name</label>
          <input id="name" type="text" class="input" [(ngModel)]="profileName" name="name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input id="email" type="email" class="input" [(ngModel)]="profileEmail" name="email" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="profileSaving()">
            @if (profileSaving()) { <span class="spinner"></span> Saving... }
            @else { Save Changes }
          </button>
        </div>
      </form>
      @if (profileError()) {
        <div class="error-msg">{{ profileError() }}</div>
      }
      @if (profileSuccess()) {
        <div class="success-msg">Profile updated successfully</div>
      }
    </div>

    <!-- Theme Section -->
    <div class="card settings-section">
      <h3 class="settings-section-title">Appearance</h3>
      <div class="theme-toggle-row">
        <span>Dark mode</span>
        <button class="theme-switch" [class.active]="theme.isDark()" (click)="theme.toggle()">
          <div class="theme-switch-thumb"></div>
        </button>
      </div>
    </div>

    <!-- API Keys Section -->
    <div class="card settings-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="settings-section-title" style="margin: 0;">API Keys</h3>
        <button class="btn btn-primary btn-sm" (click)="showCreateKeyModal.set(true)">Create Key</button>
      </div>

      @if (apiKeys().length === 0) {
        <p style="color: var(--color-text-muted); font-size: 0.875rem;">No API keys yet. Create one to use the TinyTag API.</p>
      } @else {
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Key</th><th>Last Used</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              @for (key of apiKeys(); track key.id) {
                <tr>
                  <td>{{ key.name }}</td>
                  <td><code class="mono" style="font-size: 0.75rem;">{{ key.key.slice(0, 12) }}...</code></td>
                  <td>{{ key.lastUsed ? (key.lastUsed | date:'mediumDate') : 'Never' }}</td>
                  <td>{{ key.createdAt | date:'mediumDate' }}</td>
                  <td>
                    <button class="btn btn-ghost" style="padding: 4px 8px; color: var(--color-danger);" (click)="confirmRevokeKey(key)">Revoke</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <div style="margin-top: 16px;">
        <a href="#" class="btn btn-secondary btn-sm" (click)="exportData($event)">Export All Data (CSV)</a>
      </div>
    </div>

    <!-- Create API Key Modal -->
    @if (showCreateKeyModal()) {
      <div class="modal-overlay" (click)="showCreateKeyModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Create API Key</h3>
            <button class="modal-close" (click)="showCreateKeyModal.set(false)">&times;</button>
          </div>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label">Key Name</label>
              <input class="input" [(ngModel)]="newKeyName" name="newKeyName" placeholder="e.g., Production" />
            </div>
            @if (newlyCreatedKey(); as key) {
              <div class="key-reveal">
                <p style="font-size: 0.813rem; font-weight: 600;">Your API Key:</p>
                <code class="mono key-value">{{ key }}</code>
                <p style="font-size: 0.75rem; color: var(--color-danger);">Copy this now. You won't be able to see it again.</p>
              </div>
            }
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showCreateKeyModal.set(false)">Close</button>
              @if (!newlyCreatedKey()) {
                <button class="btn btn-primary" (click)="createApiKey()" [disabled]="!newKeyName.trim()">Create</button>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <app-confirm-modal
      [visible]="revokeKeyId() !== null"
      title="Revoke API Key"
      message="Are you sure? This action cannot be undone. Any services using this key will lose access."
      confirmLabel="Revoke"
      [danger]="true"
      (confirm)="doRevokeKey()"
      (cancel)="revokeKeyId.set(null)"
    />
  `,
  styles: [`
    .settings-section { margin-bottom: 24px; max-width: 640px; }
    .settings-section-title { font-size: 1rem; font-weight: 600; margin: 0 0 16px; }
    .settings-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.813rem; font-weight: 600; }
    .form-actions { display: flex; gap: 10px; }
    .error-msg { padding: 8px 12px; background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); border-radius: 8px; font-size: 0.813rem; margin-top: 12px; }
    .success-msg { padding: 8px 12px; background: color-mix(in srgb, var(--color-success) 10%, transparent); color: var(--color-success); border-radius: 8px; font-size: 0.813rem; margin-top: 12px; }
    .theme-toggle-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; }
    .theme-switch { width: 44px; height: 24px; background: var(--color-border); border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.2s; }
    .theme-switch.active { background: var(--color-primary); }
    .theme-switch-thumb { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
    .theme-switch.active .theme-switch-thumb { transform: translateX(20px); }
    .btn-sm { font-size: 0.813rem; padding: 6px 14px; }
    .key-reveal { background: var(--color-surface-secondary); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; }
    .key-value { font-size: 0.813rem; word-break: break-all; user-select: all; }
  `]
})
export class SettingsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly apiKeysService = inject(ApiKeysService);
  protected readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);

  protected profileName = '';
  protected profileEmail = '';
  protected profileSaving = signal(false);
  protected profileError = signal('');
  protected profileSuccess = signal(false);
  protected apiKeys = signal<ApiKey[]>([]);
  protected showCreateKeyModal = signal(false);
  protected newKeyName = '';
  protected newlyCreatedKey = signal<string | null>(null);
  protected revokeKeyId = signal<number | null>(null);

  ngOnInit() {
    this.profileName = this.auth.currentUser()?.name || '';
    this.profileEmail = this.auth.currentUser()?.email || '';
    this.loadApiKeys();
  }

  private async loadApiKeys() {
    try {
      const res = await this.apiKeysService.getAll().toPromise();
      if (res?.data) this.apiKeys.set(res.data);
    } catch {}
  }

  protected async updateProfile() {
    this.profileSaving.set(true);
    this.profileError.set('');
    this.profileSuccess.set(false);
    try {
      const res = await this.auth.updateProfile({ name: this.profileName, email: this.profileEmail }).toPromise();
      if (res?.data) {
        this.auth.currentUser.set(res.data);
        this.profileSuccess.set(true);
        setTimeout(() => this.profileSuccess.set(false), 3000);
      }
    } catch (err: any) {
      this.profileError.set(err?.error?.message || 'Failed to update profile');
    } finally {
      this.profileSaving.set(false);
    }
  }

  protected async createApiKey() {
    try {
      const res = await this.apiKeysService.create({ name: this.newKeyName.trim() }).toPromise();
      if (res?.data) {
        this.newlyCreatedKey.set(res.data.key);
        this.toast.success('API key created');
        this.loadApiKeys();
      }
    } catch {
      this.toast.error('Failed to create API key');
    }
  }

  protected confirmRevokeKey(key: ApiKey) {
    this.revokeKeyId.set(key.id);
  }

  protected async doRevokeKey() {
    const id = this.revokeKeyId();
    if (id === null) return;
    try {
      await this.apiKeysService.revoke(id).toPromise();
      this.toast.success('API key revoked');
      this.revokeKeyId.set(null);
      this.loadApiKeys();
    } catch {
      this.toast.error('Failed to revoke API key');
    }
  }

  protected exportData(event: Event) {
    event.preventDefault();
    this.toast.info('Data export initiated. Check your email.');
  }
}
