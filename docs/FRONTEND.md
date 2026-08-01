# TinyTag Frontend

## Overview
Angular 22 standalone, zoneless, signal-based frontend with lazy-loaded routes and Tailwind CSS v4 styling.

## Architecture

- **Standalone components**: No NgModules, each component declares its own imports
- **Signals**: All state management via signals (not RxJS BehaviorSubjects)
- **Zoneless**: provideZonelessChangeDetection() for better performance
- **Lazy routes**: Each feature page is lazy-loaded via loadComponent
- **Functional guards**: authGuard as CanActivateFn

## Routes

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| /login | LoginPageComponent | No | Login form |
| /register | RegisterPageComponent | No | Registration |
| /dashboard | DashboardPageComponent | Yes | Main dashboard |
| /links | LinkListPageComponent | Yes | All links |
| /links/new | LinkCreatePageComponent | Yes | Create link |
| /links/:id | LinkDetailPageComponent | Yes | Link analytics |
| /links/:id/edit | LinkEditPageComponent | Yes | Edit link |
| /campaigns | CampaignListPageComponent | Yes | All campaigns |
| /campaigns/:id | CampaignDetailPageComponent | Yes | Campaign analytics |
| /tags | TagListPageComponent | Yes | Tag management |
| /settings | SettingsPageComponent | Yes | Profile & API keys |
| /:alias | RedirectPageComponent | No | Public redirect |
| /expired | ExpiredPageComponent | No | Expired link |
| /404 | NotFoundPageComponent | No | Not found |

## Key Patterns

### State Triad
Every data-fetching page uses three signals:
```typescript
protected readonly items = signal<Item[]>([]);
protected readonly loading = signal(true);
protected readonly error = signal('');
```

Priority: loading → error → empty → normal

### Theme Service
Uses `data-theme` attribute on `<html>` for CSS variable switching. Options: Light, Dark, System.

### Auth Guard
Async guard that validates the JWT token on init. Falls back to `/login` if not authenticated.

### Toast Service
Signals-based notifications with auto-dismiss after 3s. Three levels: success, error, info.

## Services

All services use Angular's HttpClient and return Observables. Page components convert to signals via subscribe.

| Service | Endpoints | Purpose |
|---------|-----------|---------|
| AuthService | /api/auth/* | Login, register, profile |
| LinksService | /api/links/* | Link CRUD + analytics |
| CampaignsService | /api/campaigns/* | Campaign CRUD |
| TagsService | /api/tags/* | Tag CRUD |
| ApiKeysService | /api/api-keys/* | API key management |
| DashboardService | /api/dashboard | Aggregated stats |
| ThemeService | — | Dark mode toggle |
| ToastService | — | In-app notifications |

## Styling

CSS custom properties + Tailwind v4 utilities. Design system tokens are defined in styles.css:
- `--color-primary`: #E85D3A (orange)
- `--color-secondary`: #1E293B (slate)
- `--color-accent`: #F59E0B (amber)
- Dark mode flips all tokens via `.dark` class

## SVG Charts
Custom SVG chart components (line, bar, donut) built without external chart libraries. Use Angular's `[attr.*]` binding for dynamic SVG attributes.
