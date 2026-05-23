# BeachPlease

BeachPlease is a canvas-first Sydney beach recommendation app. It helps users choose and plan a Sydney beach day through a visual beach canvas, live conditions, Mapbox, Gemini-generated plans, saved plan management, and an admin dashboard for managing the underlying data.

## Current Product Flow

1. User lands on the cloud opening screen.
2. User clicks `ENTER EXPERIENCE`.
3. The app opens into the canvas-first explore experience.
4. Users browse circular/scattered beach image tiles.
5. Hovering a tile reveals name and basic context.
6. Clicking a tile opens the `BeachInfoTile`.
7. Users can enter a mood and generate a beach plan.
8. The backend ranks beaches using stored beach data, live Open-Meteo conditions, and Gemini.
9. Authenticated users can save, replay, annotate, and delete plans.
10. Map mode shows the Mapbox coastal view and live beach conditions.
11. Cluster mode shows curated beach stacks.
12. Admin users can access `/admin` to manage users, plans, beaches, and activity data.

## Tech Stack

### Frontend

- React + Vite
- React Router
- Axios
- Tailwind CSS
- shadcn/ui-style local components
- Framer Motion
- Instrument Sans
- Mapbox GL JS
- Sonner toasts

### Backend

- FastAPI
- Motor
- MongoDB Atlas
- JWT with `python-jose`
- `passlib` bcrypt
- `httpx`
- Open-Meteo
- Gemini
- APScheduler condition refresh

## Core Features

- Cloud opening experience
- Circular beach image canvas
- Hover/click beach tiles
- Right-side beach info tile
- Mood input and Create Plan flow
- Interactive Mapbox map
- Live weather and marine conditions
- Gemini beach plan generation
- Auth and Google OAuth
- Saved plans, notes, replay, and delete
- Profile settings
- Mood clusters / cluster stack browsing
- Admin dashboard
- Admin beach CRUD
- Admin user role management
- Admin plan deletion
- User activity tracking
- NSW suburb search
- Sample database JSON exports under `database/`

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --port 8000
```

Use `--reload` only if local file watching works on your machine:

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## CRUD Mapping

| Area | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Users | `POST /auth/register`, `POST /auth/google` | `GET /users/me`, `GET /admin/users` | `PATCH /users/me`, `PATCH /admin/users/{user_id}` | `DELETE /users/me`, `DELETE /admin/users/{user_id}` |
| Beach plans | `POST /plans`, `POST /plans/save-snapshot` | `GET /plans`, `GET /plans/{plan_id}`, `GET /admin/plans` | `PATCH /plans/{plan_id}`, `PATCH /plans/{plan_id}/replay` | `DELETE /plans/{plan_id}`, `DELETE /admin/plans/{plan_id}` |
| Mood clusters | `POST /clusters` | `GET /clusters`, `GET /clusters/{cluster_id}` | `PATCH /clusters/{cluster_id}` | `DELETE /clusters/{cluster_id}` |
| Beaches | Seed scripts / `POST /admin/beaches` | `GET /beaches`, `GET /beaches/{id}`, `GET /beaches/slug/{slug}` | `PATCH /admin/beaches/{beach_id}` | `DELETE /admin/beaches/{beach_id}` |
| Conditions | n/a | `GET /conditions`, `GET /conditions/{slug}`, `GET /conditions/map` | refresh/cache update internally | n/a |
| Activity log | backend service writes | `GET /admin/activities` | n/a | n/a |

## API Endpoints

Health:

- `GET /health`
- `GET /db-check`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/google`

Users:

- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`

Beaches:

- `GET /beaches`
- `GET /beaches/{beach_id}`
- `GET /beaches/slug/{slug}`

Conditions:

- `GET /conditions`
- `GET /conditions/`
- `GET /conditions/{slug}`
- `GET /conditions/map`
- `GET /conditions/test`

Plans:

- `POST /plans`
- `POST /plans/preview`
- `POST /plans/save-snapshot`
- `GET /plans`
- `GET /plans/{plan_id}`
- `PATCH /plans/{plan_id}`
- `PATCH /plans/{plan_id}/replay`
- `DELETE /plans/{plan_id}`

Clusters:

- `POST /clusters`
- `GET /clusters`
- `GET /clusters/{cluster_id}`
- `PATCH /clusters/{cluster_id}`
- `DELETE /clusters/{cluster_id}`

Admin:

- `GET /admin/dashboard`
- `GET /admin/activities`
- `GET /admin/users`
- `PATCH /admin/users/{user_id}`
- `DELETE /admin/users/{user_id}`
- `GET /admin/plans`
- `DELETE /admin/plans/{plan_id}`
- `POST /admin/beaches`
- `PATCH /admin/beaches/{beach_id}`
- `DELETE /admin/beaches/{beach_id}`

Suburbs:

- `GET /suburbs/search?q={query}&state=NSW`

Ranking / AI support:

- `POST /rank/test`
- `POST /ai/test-plan`

## Environment Variables

### Backend

- `MONGODB_URI`
- `DATABASE_NAME`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `ADMIN_EMAILS`
- `VITE_GOOGLE_CLIENT_ID`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_MAPBOX_TOKEN`
- `VITE_GOOGLE_CLIENT_ID`

Never commit real `.env` files.

## Seed Beaches

```bash
cd backend
source venv/bin/activate
python -m app.seed.seed_beaches
```

## Database Samples

The `database/` folder contains sample JSON structures for beaches, users, plans, clusters, and user activities. These are reference/export samples, not secrets.

## Verification

```bash
cd frontend
npm run build
```

```bash
cd backend
source venv/bin/activate
python -m compileall .
```

## Known Limitations

- No real crowd API; crowd is estimated.
- Mapbox requires a token.
- Gemini and Open-Meteo require API/network availability.
- Admin routes require authenticated admin role/email configuration.
- Some images may use fallback assets.
