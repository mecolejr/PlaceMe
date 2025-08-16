# Runbook: Known-Good Local Setup (Aug 2025)

This snapshot is verified working on macOS:
- Backend (Express + Prisma) at http://localhost:4000
- Frontend built statically and served at http://127.0.0.1:5176 (Python http.server)
- Database via Docker Postgres+PostGIS (or Homebrew Postgres)

## Steps
1) Start database (Docker):
```bash
cd /Users/1stowner/Projects/trueplace
docker compose up -d
```

2) Start backend:
```bash
cd /Users/1stowner/Projects/trueplace/backend
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm dev
# Health should be OK at http://localhost:4000/health
```

3) Build and serve frontend (static preview):
```bash
cd /Users/1stowner/Projects/trueplace/frontend
pnpm install
pnpm build
cd dist
python3 -m http.server 5176
# Open http://127.0.0.1:5176
```

Notes:
- Frontend API calls are hard-routed to http://localhost:4000 for reliability across dev/prod/preview.
- If you prefer Vite dev server, run `pnpm dev` in `frontend/` and open http://localhost:5173 (ensure backend is up). If proxy errors occur, use the static preview flow above.

## Operations
- Refresh data (stubs + phase2) and show fingerprint:
```bash
cd backend
pnpm data:refresh:all
```
- View dataset status:
```bash
curl -s http://localhost:4000/api/admin/dataset | jq
```
- Protect admin endpoint with a token (optional): set `ADMIN_TOKEN=your_token` in `backend/.env` and include header `x-admin-token: your_token` in requests.
- One-command preview (ensures backend + local GeoJSON):
```bash
/Users/1stowner/Projects/trueplace/scripts/preview.sh
```
- One-command dev (ensures backend + local GeoJSON):
- Live data (optional, keys required):
```bash
# Set keys in backend/.env
FBI_API_KEY=...
CENSUS_API_KEY=...

cd backend
pnpm data:live
```
If keys are not set, live importers log and skip; CSV stubs remain in use.
```bash
/Users/1stowner/Projects/trueplace/scripts/dev.sh
```

## Scoring Weights (current defaults)
- Safety: 25%–40% (varies with profile)
- Community (Diversity): 45% (60% if `valuesDiversity=true`)
- Policy: 15%
All sub-scores are normalized 0–100 then combined.

## Quick smoke
- Click “Show My Score” for a seeded location (Texas/California/New York)
- Confirm score + Top matches + map choropleth (if using the latest build)
