#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/1stowner/Projects/trueplace"
API="http://localhost:4000/health"
DEV_PORT=5173
US_JSON="$ROOT/frontend/public/us-states.json"

echo "[dev] Ensuring backend is running..."
if ! curl -sf "$API" >/dev/null 2>&1; then
  echo "[dev] Backend not responding. Starting backend..."
  nohup pnpm -C "$ROOT/backend" dev >/dev/null 2>&1 &
fi

for i in {1..40}; do
  if curl -sf "$API" >/dev/null 2>&1; then
    echo "[dev] Backend healthy."
    break
  fi
  sleep 0.5
  if [[ $i -eq 40 ]]; then
    echo "[dev] Backend did not become healthy in time." >&2
    exit 1
  fi
done

if [[ ! -s "$US_JSON" ]]; then
  echo "[dev] Fetching local US states GeoJSON..."
  "$ROOT/scripts/fetch_us_states.sh" || true
fi

echo "[dev] Starting Vite dev server on :$DEV_PORT..."
if lsof -nPi :$DEV_PORT >/dev/null 2>&1; then
  lsof -nPi :$DEV_PORT | awk 'NR>1{print $2}' | xargs -I{} kill -9 {} >/dev/null 2>&1 || true
fi

nohup pnpm -C "$ROOT/frontend" dev --host 127.0.0.1 >/dev/null 2>&1 &
sleep 1.5

URL="http://127.0.0.1:$DEV_PORT"
echo "[dev] Opening $URL"
open -a "Google Chrome" "$URL" || true
echo "[dev] Done."


