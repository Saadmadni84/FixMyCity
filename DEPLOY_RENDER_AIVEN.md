# Deploy FixMyCity Backend + Database without Railway

This guide deploys the API/backend on **Render** and the MySQL database on **Aiven**.

## Why this setup

- Render handles the web service/container deployment.
- Aiven provides managed MySQL with public connectivity and backups.
- No Railway usage required.

## 1) Create a MySQL database on Aiven

1. Create a new **MySQL** service in Aiven.
2. Create a database named `fixmycity` (or your preferred name).
3. Copy the connection details:
   - host
   - port
   - username
   - password
   - database name

## 2) Deploy the app on Render

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** from that repository.
3. Use the included `render.yaml` Blueprint (`deploy/render.yaml`) or configure manually.

### Required environment variables on Render

Set these in the Render service environment:

- `NODE_ENV=production`
- `PORT=10000`
- `NOMAD_ALLOC_DIR=/app/alloc`
- `DB_HOST=<aiven-host>`
- `DB_PORT=<aiven-port>`
- `DB_USER=<aiven-username>`
- `DB_PASS=<aiven-password>`
- `DB_NAME=<aiven-database>`

Optional email variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## 3) Initialize database schema

Run the SQL migrations from `drizzle/` against your Aiven database:

- `drizzle/0000_worthless_stick.sql`
- `drizzle/0001_handy_mojo.sql`

You can run these from a MySQL client (MySQL Workbench, DBeaver, or `mysql` CLI).

## 4) Verify deployment

After deploy completes, check:

- `GET /api/health`
- `GET /api/health/email`

If both endpoints respond, backend + database deployment is healthy.
