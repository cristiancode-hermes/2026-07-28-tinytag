import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page.component').then(m => m.RegisterPageComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'links', loadComponent: () => import('./pages/link-list-page.component').then(m => m.LinkListPageComponent) },
      { path: 'links/new', loadComponent: () => import('./pages/link-create-page.component').then(m => m.LinkCreatePageComponent) },
      { path: 'links/:id', loadComponent: () => import('./pages/link-detail-page.component').then(m => m.LinkDetailPageComponent) },
      { path: 'links/:id/edit', loadComponent: () => import('./pages/link-edit-page.component').then(m => m.LinkEditPageComponent) },
      { path: 'campaigns', loadComponent: () => import('./pages/campaign-list-page.component').then(m => m.CampaignListPageComponent) },
      { path: 'campaigns/:id', loadComponent: () => import('./pages/campaign-detail-page.component').then(m => m.CampaignDetailPageComponent) },
      { path: 'tags', loadComponent: () => import('./pages/tag-list-page.component').then(m => m.TagListPageComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings-page.component').then(m => m.SettingsPageComponent) },
    ]
  },
  { path: 'expired', loadComponent: () => import('./pages/expired-page.component').then(m => m.ExpiredPageComponent) },
  { path: '404', loadComponent: () => import('./pages/not-found-page.component').then(m => m.NotFoundPageComponent) },
  { path: ':alias', loadComponent: () => import('./pages/redirect-page.component').then(m => m.RedirectPageComponent) },
  { path: '**', redirectTo: '/404', pathMatch: 'full' }
];
