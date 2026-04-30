#!/bin/bash
set -e

POSTGRES_DATA="/app/postgres_data"
POSTGRES_BIN="$(dirname "$(find /usr/lib/postgresql -path '*/bin/postgres' -type f | sort -V | tail -n 1)")"

if [ -z "$POSTGRES_BIN" ] || [ ! -x "$POSTGRES_BIN/postgres" ]; then
  echo "PostgreSQL binaries were not found under /usr/lib/postgresql"
  exit 1
fi

# Initialize PostgreSQL data directory if it doesn't exist
if [ ! -f "$POSTGRES_DATA/PG_VERSION" ]; then
  echo "Initializing PostgreSQL database..."
  mkdir -p $POSTGRES_DATA
  chown postgres:postgres $POSTGRES_DATA
  su - postgres -c "$POSTGRES_BIN/initdb -D $POSTGRES_DATA --encoding=UTF8 --locale=C.UTF-8"
fi

if ! grep -q "mathchat docker host access" "$POSTGRES_DATA/pg_hba.conf"; then
  echo "host all all 0.0.0.0/0 trust # mathchat docker host access" >> "$POSTGRES_DATA/pg_hba.conf"
fi

# Start PostgreSQL in the background with TCP listening on all container interfaces
echo "Starting PostgreSQL..."
su - postgres -c "$POSTGRES_BIN/postgres -D $POSTGRES_DATA -p 5432 -c listen_addresses='*'" > /app/postgres.log 2>&1 &
POSTGRES_PID=$!

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
for i in {1..30}; do
  if pg_isready -h 127.0.0.1 -p 5432 -U postgres > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Attempt $i/30: PostgreSQL not ready yet..."
  sleep 1
done

# Create mathchat database if it doesn't exist
echo "Setting up mathchat database..."
su - postgres -c "createdb -h 127.0.0.1 -p 5432 -E UTF8 mathchat" 2>/dev/null || echo "Database already exists or creation skipped"
su - postgres -c "psql -h 127.0.0.1 -p 5432 -d postgres -c \"ALTER DATABASE mathchat SET client_encoding TO 'UTF8';\"" >/dev/null

# Start Flask application
echo "Starting Flask application..."
exec gunicorn -w 4 --bind 0.0.0.0:5000 --access-logfile - run:app
