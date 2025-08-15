#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/1stowner/Projects/trueplace"
API="http://localhost:4000/health"
PREVIEW_PORT=5176

US_JSON="$ROOT/frontend/public/us-states.json"

echo "[preview] Ensuring backend is running..."
if ! curl -sf "$API" >/dev/null 2>&1; then
  echo "[preview] Backend not responding. Starting backend..."
  # Start backend in background if not already running
  nohup pnpm -C "$ROOT/backend" dev >/dev/null 2>&1 &
fi

# Wait for health
for i in {1..40}; do
  if curl -sf "$API" >/dev/null 2>&1; then
    echo "[preview] Backend healthy."
    break
  fi
  sleep 0.5
  if [[ $i -eq 40 ]]; then
    echo "[preview] Backend did not become healthy in time." >&2
    exit 1
  fi
done

if [[ ! -s "$US_JSON" ]]; then
  echo "[preview] Fetching local US states GeoJSON..."
  "$ROOT/scripts/fetch_us_states.sh" || true
fi

echo "[preview] Building frontend..."
pnpm -C "$ROOT/frontend" build >/dev/null

echo "[preview] Restarting static server on :$PREVIEW_PORT..."
# Kill anything on the port
if lsof -nPi :$PREVIEW_PORT >/dev/null 2>&1; then
  lsof -nPi :$PREVIEW_PORT | awk 'NR>1{print $2}' | xargs -I{} kill -9 {} >/dev/null 2>&1 || true
fi

nohup python3 -m http.server -d "$ROOT/frontend/dist" $PREVIEW_PORT >/dev/null 2>&1 &
sleep 1

URL="http://127.0.0.1:$PREVIEW_PORT"
echo "[preview] Opening $URL"
open -a "Google Chrome" "$URL" || true
echo "[preview] Done."


