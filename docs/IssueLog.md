# Issue & Solution Log

Template:
- Date:
- Phase:
- Issue:
- Root cause:
- Fix:
- Follow-ups:

Entries:
- 2025-08-13 | Phase 1 | Frontend dev server blank page / proxy failures
  - Root cause: Vite dev proxy intermittently failed; frontend attempted to fetch `/api/...` from the wrong origin (dev proxy or static server), resulting in HTML 404 injected into UI or `Failed to fetch` when backend was down.
  - Fix: Added `fetchApi` helper to always target backend at `http://localhost:4000` for `/api/...` requests. Documented Runbook using static preview at `http://127.0.0.1:5176`. Ensured backend is running before testing.
  - Follow-ups: Keep proxy config, but prefer explicit backend base for reliability. Consider environment variable for API base in production.

- 2025-08-13 | Phase 1 | Static preview showed 404 HTML in UI
  - Root cause: Static server handled `/api/...` returning HTML error; the UI displayed the HTML string.
  - Fix: Route API requests directly to backend via `fetchApi`; added cleaner error handling on frontend.
  - Avoidance: Do not rely on static server to proxy APIs. Use absolute API base or reverse proxy.

- 2025-08-13 | Phase 1 | Backend not running caused `Failed to fetch`
  - Root cause: Backend dev server was not started.
  - Fix: Start backend (`pnpm dev`) and verify `/health` before testing UI.
  - Avoidance: Add preflight script/check in frontend dev and CI to verify backend availability.
