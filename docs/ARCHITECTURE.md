# TinyTag Architecture

## Overview
TinyTag is a full-stack URL shortener and link analytics platform built with Angular 22 and NestJS 11. It provides users with the ability to create shortened URLs, organize them into campaigns, tag them, and track detailed click analytics.

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Angular 22 | Standalone, zoneless, signal-based, lazy-loaded routes |
| Styling | Tailwind CSS v4 + CSS Custom Properties | Design system with dark mode |
| Backend | NestJS 11 | Modular architecture, Swagger docs, class-validator |
| Database | SQLite (dev) / PostgreSQL (prod) | TypeORM with better-sqlite3 locally, Neon-ready |
| Auth | JWT + Passport + bcryptjs | Stateless token auth |

## Project Structure

```
2026-07-28-tinytag/
├── apps/
│   ├── api/                    # NestJS backend
│   │   └── src/
│   │       ├── auth/           # Authentication (JWT, register, login)
│   │       ├── users/          # User entity & service
│   │       ├── links/          # URL shortening CRUD + alias service
│   │       ├── clicks/         # Click event recording & dedup
│   │       ├── analytics/      # Aggregation queries & chart data
│   │       ├── campaigns/      # Campaign CRUD with analytics
│   │       ├── tags/           # Tag CRUD
│   │       ├── api-keys/       # API key management
│   │       ├── dashboard/      # Cross-entity aggregation
│   │       ├── redirect/       # Public redirect handler
│   │       └── seed/           # Demo data generation
│   └── web/                    # Angular frontend
│       └── src/app/
│           ├── layouts/        # Auth & Dashboard layouts
│           ├── pages/          # All feature pages
│           ├── services/       # API client services
│           ├── shared/         # Reusable UI components
│           ├── guards/         # Auth guard
│           └── interceptors/   # Auth interceptor
├── docs/                       # Documentation
└── scripts/                    # Build scripts
```

## Data Flow

1. **Authentication**: User registers/logs in → JWT stored in localStorage → Auth interceptor attaches Bearer token
2. **Link Creation**: User pastes URL → optional alias/campaign/tags → POST /api/links → short URL returned
3. **Redirect**: Visitor navigates to /r/:alias → backend resolves, records click (async), returns 302
4. **Analytics**: Dashboard page calls /api/dashboard for aggregated stats; link detail calls /api/links/:id/analytics
5. **API Access**: External apps use API keys → POST /api/v1/links with Bearer token

## Entity Relationships

- User 1--* Link (owner)
- User 1--* Campaign (owner)
- User 1--* ApiKey (owner)
- Link 1--* Click (events)
- Link *--* Tag (many-to-many via link_tags junction)
- Campaign 1--* Link (optional grouping)
