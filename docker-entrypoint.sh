#!/usr/bin/env sh
set -e

export NOMAD_ALLOC_DIR="${NOMAD_ALLOC_DIR:-/app/alloc}"
mkdir -p "$NOMAD_ALLOC_DIR"

DB_HOST="${DB_HOST:-${MYSQLHOST:-db}}"
DB_PORT="${DB_PORT:-${MYSQLPORT:-3306}}"
DB_USER="${DB_USER:-${MYSQLUSER:-fixmycity}}"
DB_PASS="${DB_PASS:-${MYSQLPASSWORD:-fixmycity_pass}}"
DB_NAME="${DB_NAME:-${MYSQLDATABASE:-fixmycity}}"
DB_WAIT_MAX_ATTEMPTS="${DB_WAIT_MAX_ATTEMPTS:-60}"
DB_WAIT_DELAY_MS="${DB_WAIT_DELAY_MS:-2000}"

cat > "$NOMAD_ALLOC_DIR/config.json" <<EOF
{
  "DATABASE": {
    "VALUE": {
      "HOST": "$DB_HOST",
      "PORT": "$DB_PORT",
      "USERNAME": "$DB_USER",
      "PASSWORD": "$DB_PASS",
      "NAME": "$DB_NAME"
    }
  }
}
EOF

echo "[entrypoint] Wrote database config to $NOMAD_ALLOC_DIR/config.json"

# Render expects an open port quickly. Do not block startup there.
if [ "${SKIP_DB_WAIT:-0}" = "1" ] || [ -n "${RENDER:-}" ]; then
  echo "[entrypoint] Skipping database readiness wait."
else
  # Wait for MySQL to accept connections before booting the app.
  # If DB is still unavailable, continue boot and rely on API-level fallbacks.
  node -e '
const mysql = require("mysql2/promise");
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const cfg = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || "db",
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || "fixmycity",
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD || "fixmycity_pass",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "fixmycity",
};
const maxAttempts = Number(process.env.DB_WAIT_MAX_ATTEMPTS || 60);
const delayMs = Number(process.env.DB_WAIT_DELAY_MS || 2000);
(async () => {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const conn = await mysql.createConnection(cfg);
      await conn.ping();
      await conn.end();
      console.log("[entrypoint] Database is reachable.");
      process.exit(0);
    } catch (e) {
      console.log(`[entrypoint] Waiting for database (${i}/${maxAttempts})...`);
      await delay(delayMs);
    }
  }
  console.warn("[entrypoint] Database not reachable in time; continuing startup.");
  process.exit(0);
})();
'
fi

if [ -f "dist/index.html" ]; then
  echo "[entrypoint] Starting preview server from dist/."
  exec npm run preview -- --host 0.0.0.0 --port "${PORT:-5173}"
else
  echo "[entrypoint] dist/ not found; starting Vite dev server fallback."
  exec npm run dev -- --host 0.0.0.0 --port "${PORT:-5173}"
fi
