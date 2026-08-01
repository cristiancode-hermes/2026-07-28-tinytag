# TinyTag API Reference

Base URL: `/api`

## Authentication

### POST /api/auth/register
Register a new user.
```json
{ "email": "user@example.com", "password": "Demo1234", "name": "Demo User" }
```
Response: `{ "token": "jwt...", "user": { "id", "email", "name" } }`

### POST /api/auth/login
Login with credentials.
```json
{ "email": "user@example.com", "password": "Demo1234" }
```
Response: `{ "token": "jwt...", "user": { "id", "email", "name" } }`

### GET /api/auth/profile
Get current user profile. Requires JWT.

### PATCH /api/auth/profile
Update profile. Requires JWT.

## Links

All links endpoints require JWT auth.

### GET /api/links
List all links. Query params: search, campaignId, tagId, sort (clicks|date|alias), page, limit.
Response: `{ "data": Link[], "total": number, "page": number, "pages": number }`

### POST /api/links
Create short link.
```json
{ "url": "https://example.com", "alias?": "my-link", "campaignId?": "uuid", "tagIds?": ["uuid"], "expiresAt?": "2026-08-01T00:00:00Z" }
```

### GET /api/links/:id
Get link detail with campaign and tags.

### PATCH /api/links/:id
Update link.

### DELETE /api/links/:id
Delete link.

### GET /api/links/alias/:alias/check
Check alias availability. Response: `{ "available": boolean }`

## Analytics

### GET /api/links/:id/analytics?range=7d|30d|90d
Full analytics for a link.
```json
{
  "totalClicks": 342,
  "uniqueClicks": 198,
  "mobileRate": 62.0,
  "topCountry": { "code": "US", "name": "United States", "count": 128 },
  "clickTrends": [{ "date": "2026-07-01", "count": 12 }],
  "topReferrers": [{ "referrer": "Twitter/X", "count": 142 }],
  "devices": [{ "device": "mobile", "count": 212, "percentage": 62.0 }],
  "browsers": [{ "browser": "Chrome", "count": 198, "percentage": 57.9 }],
  "countries": [{ "code": "US", "name": "United States", "count": 128, "percentage": 37.4 }]
}
```

## Dashboard

### GET /api/dashboard
Aggregated stats for the authenticated user.
```json
{ "totalLinks": 24, "totalClicks": 1847, "uniqueClicks": 1024, "mobileRate": 62.0, "topCountry": {...}, "recentLinks": [...], "clickTrends": [...] }
```

## Campaigns

CRUD at `/api/campaigns`. GET /api/campaigns/:id/analytics?range=30d for aggregate campaign stats.

## Tags

CRUD at `/api/tags`. Returns tags with link count and total clicks.

## API Keys

CRUD at `/api/api-keys`. POST creates a key (shown once). DELETE revokes.

### POST /api/v1/links (API Key auth)
Create link via API key. Auth: `Authorization: Bearer <api-key>`
```json
{ "url": "https://example.com", "alias?": "...", "campaign?": "...", "tags?": ["..."] }
```

## Redirect

### GET /api/r/:alias
Public endpoint. Returns 302 to original URL if active, 410 if expired, 404 if not found.

## Export

### GET /api/export/links
Export all links as CSV.

### GET /api/export/campaigns/:id
Export campaign links as CSV.

## Seed

### POST /api/seed
Generate demo data (dev only). Requires JWT.
