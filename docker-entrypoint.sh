#!/usr/bin/env sh
set -e

export NOMAD_ALLOC_DIR="${NOMAD_ALLOC_DIR:-/app/alloc}"
mkdir -p "$NOMAD_ALLOC_DIR"

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-fixmycity}"
DB_PASS="${DB_PASS:-fixmycity_pass}"
DB_NAME="${DB_NAME:-fixmycity}"

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

# Wait for MySQL to accept connections before booting the app.
node -e '
const mysql = require("mysql2/promise");
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const cfg = {
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "fixmycity",
  password: process.env.DB_PASS || "fixmycity_pass",
  database: process.env.DB_NAME || "fixmycity",
};
(async () => {
  for (let i = 1; i <= 60; i++) {
    try {
      const conn = await mysql.createConnection(cfg);
      await conn.ping();
      await conn.end();
      console.log("[entrypoint] Database is reachable.");
      process.exit(0);
    } catch (e) {
      console.log(`[entrypoint] Waiting for database (${i}/60)...`);
      await delay(2000);
    }
  }
  console.error("[entrypoint] Database did not become reachable in time.");
  process.exit(1);
})();
'

exec npm run preview -- --host 0.0.0.0 --port "${PORT:-5173}"
