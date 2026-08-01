# TinyTag — URL Shortener & Link Analytics

**Stack:** Angular 22 + NestJS 11 + SQLite + Tailwind CSS v4

TinyTag es un acortador de URLs y plataforma de analítica de enlaces. Crea enlaces cortos personalizados, organízalos por campañas y etiquetas, y analiza su rendimiento con gráficos detallados.

## ✨ Funcionalidades

- 🔐 **Autenticación JWT** — registro e inicio de sesión
- 🔗 **Enlaces cortos** — alias personalizados, copia rápida, QR codes
- 📁 **Campañas y etiquetas** — organización con etiquetas de colores
- 📊 **Dashboard analítico** — KPIs de clics totales/únicos, tasa móvil, top país
- 📈 **Gráficos de tendencias** — clics en los últimos 30 días
- 🌍 **Segmentación** — por dispositivo, navegador, país y referente
- 🎨 **Modo oscuro/claro** — variables CSS con toggle persistente
- 📱 **Totalmente responsivo** — escritorio, tablet y móvil

## 🚀 Demo

- **URL:** https://tinytag.proyectos.cristiancode.dev
- **Usuario:** `demo@tinytag.dev`
- **Contraseña:** `Demo1234`

## 🛠️ Desarrollo

```bash
# API (puerto 3048)
cd apps/api
npm install --legacy-peer-deps
npm run build
PORT=3048 node dist/main.js

# Web
cd apps/web
npm install --legacy-peer-deps
node node_modules/@angular/cli/bin/ng.js build
```

## 📡 API

RESTful con Swagger en `/api/docs`:

- `POST /api/auth/register` · `POST /api/auth/login`
- `GET/POST /api/links` · `GET/PATCH/DELETE /api/links/:id`
- `GET/POST /api/campaigns` · `GET/POST /api/tags`
- `GET /api/analytics/dashboard` · `GET /api/analytics/links/:id`
- `GET /api/redirect/:alias` — resolución pública de enlaces cortos

## 🗂️ Estructura

```
apps/
  api/    # NestJS backend (auth, links, campaigns, tags, analytics)
  web/    # Angular frontend (dashboard, links, campaigns, tags, settings)
```

Datos semilla: 6 enlaces, 3 campañas, 5 etiquetas y 55 eventos de clic.
