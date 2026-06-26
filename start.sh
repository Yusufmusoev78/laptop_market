#!/usr/bin/env bash
# Somon Comp — start everything with a single command.
# Usage: bash start.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[somon-comp]${NC} $*"; }
warn()  { echo -e "${YELLOW}[somon-comp]${NC} $*"; }
error() { echo -e "${RED}[somon-comp]${NC} $*"; exit 1; }

# ── Cleanup: kill background processes when the script exits ──────────────────
BACKEND_PID=""
cleanup() {
    echo ""
    warn "Shutting down..."
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
    info "Goodbye."
}
trap cleanup EXIT

# ── 1. Check venv ─────────────────────────────────────────────────────────────
[ -f "$SCRIPT_DIR/venv/bin/activate" ] || error "Virtual environment not found. Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
source "$SCRIPT_DIR/venv/bin/activate"

# ── 2. Check frontend deps ───────────────────────────────────────────────────
[ -d "$SCRIPT_DIR/frontend/node_modules" ] || {
    info "Installing frontend dependencies (first run)..."
    npm install --prefix "$SCRIPT_DIR/frontend" --no-audit --no-fund
}

# ── 3. Database migrations ───────────────────────────────────────────────────
info "Applying database migrations..."
alembic upgrade head || error "Migration failed. Check your DATABASE_URL in .env and make sure PostgreSQL is running."

# ── 4. Seed catalog (skipped if already populated) ───────────────────────────
info "Seeding catalog..."
python scripts/seed.py

# ── 5. Start FastAPI backend (background) ────────────────────────────────────
info "Starting FastAPI backend on http://localhost:8000 ..."
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/somon_backend.log 2>&1 &
BACKEND_PID=$!

# Wait until the backend is accepting connections (max 15 s)
for i in $(seq 1 15); do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
        info "Backend ready.  API docs → http://localhost:8000/docs"
        break
    fi
    [ "$i" -eq 15 ] && {
        warn "Backend did not respond in time. Check /tmp/somon_backend.log"
        cat /tmp/somon_backend.log
    }
    sleep 1
done

# ── 6. Start React frontend (foreground — Ctrl+C stops everything) ─────────────
info "Starting React frontend on http://localhost:5173 ..."
info "Press Ctrl+C to stop both servers."
echo ""
npm start --prefix "$SCRIPT_DIR/frontend"
