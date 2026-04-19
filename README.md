# FixMyCity

A production-grade civic issue reporting platform engineered with the mindset of a senior software developer focused on reliability, scalability, and clean system boundaries.

## Live Deployments

- Frontend: https://fixmycitysm.vercel.app
- Backend: https://fixmycity-v3vl.onrender.com

## Product Overview

FixMyCity enables citizens to report civic issues, track resolution status, and engage with municipal workflows through role-based dashboards for citizens and officers.

Core capabilities:

- Citizen issue reporting with category, location, and media metadata.
- Officer-side triage and status transitions (`submitted` -> `under_review` -> `assigned` -> `fixed`).
- Ward-aware assignment routing and progress tracking.
- In-app notification pipeline with email integration hooks.
- Public map and ticket tracking experience.

## System Design Approach

This project is intentionally structured around strong system design fundamentals:

- Clear separation of concerns: UI, API routes, domain utilities, and infrastructure are isolated by layer.
- Configuration-driven runtime: environment variables govern deployment behavior per platform.
- Fail-safe startup strategy: backend startup avoids hard crashes when dependencies are delayed.
- Progressive resilience: API fallback patterns prevent full UX failure when DB connectivity is transient.
- Deployability-first architecture: supports local Docker, Render-hosted backend, and Vercel-hosted frontend.

## Architecture

### Frontend

- React + TypeScript + Vite
- Tailwind + shadcn/ui
- Route-driven pages with explicit auth contexts for citizen/officer workflows
- API base URL abstraction (`src/lib/api-url.ts`) for portable multi-environment deployments

### Backend

- Express-compatible API via Vite API routes
- Typed route handlers grouped by bounded feature areas (`auth`, `issues`, `notifications`, `stats`)
- Health and operational endpoints for runtime verification

### Data Layer

- MySQL schema with Drizzle definitions and SQL migrations
- In-memory fallback behavior for graceful degradation in constrained environments

### Deployment Topology

- Vercel: frontend hosting
- Render: backend service
- MySQL provider: managed external database (Render/TiDB/Aiven/etc.)

## Repository Structure

```text
src/
  components/          Reusable UI and interaction components
  layouts/             Shell/layout composition
  pages/               Route-level screens (citizen, officer, map, report, track)
  lib/                 API URL client, auth context, utility modules
  server/
    api/               Feature-oriented API route handlers
    db/                Schema + DB client integrations
    data/              In-memory store and seed behavior

deploy/
  render.yaml          Render blueprint for backend runtime

drizzle/
  *.sql                Database migrations

docker-entrypoint.sh   Runtime bootstrap for container deployments
Dockerfile             Container build specification
docker-compose.yml     Local full-stack orchestration
```

## Key API Surface

- `GET /api/health`
- `GET /api/issues`
- `POST /api/issues`
- `GET /api/issues/:ticketId`
- `PUT /api/issues/:ticketId/status`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/auth/citizen/login`
- `POST /api/auth/citizen/register`
- `POST /api/auth/officer/login`
- `POST /api/auth/officer/register`

## Operational Characteristics

- Host-aware backend startup for Render (`allowedHosts` and external host normalization).
- CORS policy controlled through environment configuration (`ALLOWED_ORIGINS`).
- Optional DB wait strategy to avoid cold-start failures in managed PaaS environments.
- Typed compile checks enforced via `npm run type-check`.

## Local Development

### Prerequisites

- Node.js 22+
- npm
- Docker (optional but recommended)

### Start in dev mode

```bash
npm install
npm run dev
```

### Type-check and quality gates

```bash
npm run type-check
npm run lint
```

### Full stack via Docker Compose

```bash
docker compose up -d --build
```

Validate:

```bash
curl http://localhost:5173/api/health
curl http://localhost:5173/api/stats
```

## Production Deployment Notes

### Vercel (Frontend)

Set:

```env
VITE_API_URL=https://fixmycity-v3vl.onrender.com
```

The frontend automatically appends `/api/...` paths where required.

### Render (Backend)

Recommended environment variables:

```env
NODE_ENV=production
PORT=10000
ALLOWED_ORIGINS=https://fixmycitysm.vercel.app
APP_START_MODE=dev
SKIP_DB_WAIT=1
```

Database variables:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

## Engineering Highlights

- Designed and implemented with a long-horizon maintainability mindset.
- Focused on practical distributed-system concerns: startup safety, runtime portability, and deployment fault isolation.
- Prioritized explicit interfaces over hidden coupling across frontend, backend, and infrastructure layers.

## Author

Built and maintained by Saad Madni with a 15+ year engineering mindset emphasizing system design, production reliability, and clean architecture.

## 📄 License

MIT License - feel free to use this template for any project.


