# Deploy FixMyCity with Render (Backend) + TiDB Cloud (MySQL) + Vercel (Frontend)

This guide replaces Aiven with a lower-cost/free-tier friendly option:

- **Backend/API**: Render (Docker web service)
- **Database**: TiDB Cloud Serverless (MySQL-compatible)
- **Frontend**: Vercel (static Vite build)

## 1) Create a free MySQL-compatible database on TiDB Cloud

1. Create a TiDB Cloud account and a **Serverless** cluster.
2. Create a database (for example: `fixmycity`).
3. Create a SQL user and password.
4. Add an IP allow rule for Render egress (or temporarily `0.0.0.0/0` for setup, then restrict).
5. Save these values from **Parameters** (as shown in TiDB “Connect” dialog):
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASS`
   - `DB_NAME`
   - (optional) `DB_SSL_CA` (CA certificate text if you want strict TLS validation)

## 2) Deploy backend on Render

1. Push this repository to GitHub.
2. Create a Render **Web Service** from this repo (or use `deploy/render.yaml`).
3. Configure environment variables:

### Required

- `NODE_ENV=production`
- `PORT=10000`
- `NOMAD_ALLOC_DIR=/app/alloc`
- `DB_HOST=<tidb-host>`
- `DB_PORT=<tidb-port>`
- `DB_USER=<tidb-user>`
- `DB_PASS=<tidb-password>`
- `DB_NAME=<tidb-database>`
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=false`

For stricter TLS verification, also set:
- `DB_SSL_REJECT_UNAUTHORIZED=true`
- `DB_SSL_CA=<full-ca-pem-content>`

### Required for Vercel frontend integration

- `CORS_ORIGIN=https://<your-vercel-project>.vercel.app`

> You can provide multiple frontend origins using commas, for example:
> `CORS_ORIGIN=https://app.vercel.app,https://www.fixmycity.in`

### Optional email settings

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## 3) Run database schema migrations

Run these SQL files against your TiDB database:

- `drizzle/0000_worthless_stick.sql`
- `drizzle/0001_handy_mojo.sql`

> TiDB commonly uses `4000` as the SQL port; use the exact port shown in your TiDB connection panel.

## 4) Point Vercel frontend to Render backend

In your Vercel project settings, add:

- `VITE_API_URL=https://<your-render-service>.onrender.com`

Then redeploy Vercel so frontend API calls go to Render.

## 5) Verify

- Backend health: `GET https://<render-url>/api/health`
- Email health: `GET https://<render-url>/api/health/email`
- Frontend: open Vercel URL, then test login/report/track flows.
