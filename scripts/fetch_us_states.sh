#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/1stowner/Projects/trueplace"
OUT="$ROOT/frontend/public/us-states.json"
TMP="$(mktemp)"

mkdir -p "$(dirname "$OUT")"

URLS=(
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/USA-states.json"
)

echo "[fetch_us_states] Downloading US states GeoJSON..."
ok=0
for u in "${URLS[@]}"; do
  if curl -fsSL "$u" -o "$TMP"; then
    if grep -q '"FeatureCollection"' "$TMP"; then
      ok=1
      break
    fi
  fi
done

if [[ $ok -ne 1 ]]; then
  echo "[fetch_us_states] Failed to download US states GeoJSON" >&2
  exit 1
fi

mv "$TMP" "$OUT"
echo "[fetch_us_states] Saved to $OUT"


