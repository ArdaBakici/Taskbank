## Taskbank API (minimal mock server)

This is an Express app for taskbank.

### First-time setup

1. `cd back-end`
2. `npm install`
3. `npm run ui:build` (re-builds the React front-end into /front-end/build so Express can serve it)
4. `npm run dev`
Once the server is running, open `http://localhost:4000/` for the React app. API endpoints live under `http://localhost:4000/api/...`.


### Routes implemented

- `GET /api/tasks` – all tasks (supports `limit`, `sort`, `projectId` when needed).
- `GET /api/projects` – all projects (supports `limit`, `sort`), `GET /api/projects/:id` (includes its tasks), plus matching POST/PATCH/DELETE.

- `GET /api/tasks/:id`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`.
- `POST /api/auth/login`, `POST /api/auth/register` – return mock user + token.
- `GET /api/settings`, `PATCH /api/settings` – in-memory settings store.
- `GET /api/stats` – aggregates counts by status.
- `GET /api/search?q=` – searches task titles/descriptions and project names/descriptions.
- `GET /api/health` – quick uptime check.

Hardcoded mock data lives in `/data` and is currently in-memory (no persistence) for now.
