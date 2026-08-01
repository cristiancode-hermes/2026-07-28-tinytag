import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ToastContainerComponent } from '../shared/toast-container.component';
import { SearchInputComponent } from '../shared/search-input.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="sidebar-layout">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          @if (!collapsed()) { <span>TinyTag</span> }
        </div>
        <nav>
          <ul class="sidebar-nav">
            <li><a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              @if (!collapsed()) { <span>Dashboard</span> }
            </a></li>
            <li><a routerLink="/links" routerLinkActive="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              @if (!collapsed()) { <span>Links</span> }
            </a></li>
            <li><a routerLink="/campaigns" routerLinkActive="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              @if (!collapsed()) { <span>Campaigns</span> }
            </a></li>
            <li><a routerLink="/tags" routerLinkActive="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              @if (!collapsed()) { <span>Tags</span> }
            </a></li>
            <li><a routerLink="/settings" routerLinkActive="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              @if (!collapsed()) { <span>Settings</span> }
            </a></li>
          </ul>
        </nav>
        <div style="margin-top: auto; padding: 16px 20px;">
          <button class="btn btn-ghost sidebar-collapse-btn" (click)="collapsed.set(!collapsed())">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              @if (collapsed()) { <polyline points="9 18 15 12 9 6"/> }
              @if (!collapsed()) { <polyline points="15 18 9 12 15 6"/> }
            </svg>
            @if (!collapsed()) { <span>Collapse</span> }
          </button>
        </div>
      </aside>
      <div class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">{{ pageTitle() }}</h2>
          </div>
          <div class="topbar-right">
            <button class="btn btn-ghost" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
              @if (theme.isDark()) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <div class="user-menu" (click)="showUserMenu.set(!showUserMenu())" (blur)="showUserMenu.set(false)" tabindex="0">
              <div class="user-avatar">{{ userInitial() }}</div>
              @if (showUserMenu()) {
                <div class="user-dropdown">
                  <div class="dropdown-header">
                    <div class="dropdown-user-name">{{ auth.currentUser()?.name }}</div>
                    <div class="dropdown-user-email">{{ auth.currentUser()?.email }}</div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" routerLink="/settings">Settings</a>
                  <button class="dropdown-item" (click)="logout()">Sign out</button>
                </div>
              }
            </div>
          </div>
        </header>
        <router-outlet />
      </div>
    </div>
    <app-toast-container />
  `,
  styles: [`
    .sidebar-collapse-btn { width: 100%; justify-content: flex-start; }
    .user-menu { position: relative; cursor: pointer; outline: none; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.813rem; }
    .user-dropdown { position: absolute; right: 0; top: 40px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); min-width: 200px; z-index: 100; animation: slideUp 0.15s ease; }
    .dropdown-header { padding: 12px 16px; }
    .dropdown-user-name { font-weight: 600; font-size: 0.875rem; }
    .dropdown-user-email { font-size: 0.75rem; color: var(--color-text-muted); }
    .dropdown-divider { height: 1px; background: var(--color-border); }
    .dropdown-item { display: block; width: 100%; padding: 10px 16px; font-size: 0.875rem; color: var(--color-text); text-decoration: none; border: none; background: none; text-align: left; cursor: pointer; box-sizing: border-box; }
    .dropdown-item:hover { background: var(--color-surface-secondary); }
  `]
})
export class DashboardLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly collapsed = signal(false);
  protected readonly showUserMenu = signal(false);
  protected readonly pageTitle = signal('Dashboard');

  protected userInitial(): string {
    return this.auth.currentUser()?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  protected logout() {
    this.auth.logout();
    window.location.href = '/login';
  }
}
