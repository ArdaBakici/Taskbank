## Taskbank API (minimal mock server)

This is an Express app for taskbank.

### First-time setup

0. `cd back-end`
1. `cp .env.example .env`
2. `npm install`
3. `npm run ui:build` (re-builds the React front-end into /front-end/build so Express can serve it)
4. `npm run dev`
Once the server is running, open `http://localhost:4000/` for the built React app. (While developing you can go to `front-end/` and run `npm run start` there and open `http://localhost:3000/` if you don't want to have to rebuild everything on each change.) API endpoints live under `http://localhost:4000/api/...`.

### Environment looks like:
```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/taskbank
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskbank
   
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
```



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
