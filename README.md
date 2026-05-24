# BeachPlease Internet Programming Assesment

Soham Mundhe 25966209 |
Nguyen Quang Tu 26139333 |
Mrinal Parashar 26048254

BeachPlease is a canvas-first Sydney beach recommendation app. It helps users choose and plan a Sydney beach day through a visual beach canvas, live conditions, an interactive coastal map, Gemini-generated plans, saved plan management, and an admin dashboard for managing the underlying data.

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
10. Map mode shows an interactive coastal view with search, filters, and live beach conditions.
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
- Leaflet
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
- Interactive coastal map with search and filters
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
- Sanitized MongoDB JSON exports under `database/`

## Assignment Requirement Coverage

| Requirement | How BeachPlease satisfies it |
| --- | --- |
| Modern frontend library | React 19, Vite, React Router, Tailwind CSS, shadcn-style local UI components, Framer Motion |
| Backend with database | FastAPI backend with Motor and MongoDB Atlas |
| SPA behaviour | `frontend/index.html` is the single HTML entry point; React Router swaps views without full page reloads |
| Authentication | Email/password registration and login use bcrypt password hashing and JWT access tokens; Google OAuth is also supported |
| At least three CRUD entities | Users, beach plans, mood clusters, and beaches all support database-backed CRUD operations |
| Live search / dynamic filtering | Beach explore/map surfaces filter and inspect beach data dynamically; suburb selection uses the backend suburb search proxy |
| Admin/user profile | Admin dashboard manages users, plans, beaches, roles, and activity history; profile page lets users update/delete their own account |
| Error handling | Frontend forms use Zod + React Hook Form and toast/error states; backend returns structured FastAPI errors |
| Database export | `database/` contains sanitized MongoDB JSON exports for users, beaches, plans, clusters, and user activities |

## Setup From A Fresh Clone

### Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- MongoDB Atlas connection string, or another reachable MongoDB instance
- Gemini API key for generated beach plans
- Google OAuth client ID only if testing Google sign-in

### 1. Clone

```bash
git clone https://github.com/sohamdesigns98-prog/BeachPlease.git
cd BeachPlease
```

### 2. Backend Environment

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell, use this instead of `cp` if needed:

```powershell
Copy-Item .env.example .env
```

Fill `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=beachplease
JWT_SECRET=use_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_oauth_client_id_optional
ADMIN_EMAILS=admin@example.com
```

`ADMIN_EMAILS` is comma-separated. To test the admin dashboard, register or log in with one of these emails, then open `/admin`.

### 3. Backend Install And Run

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Backend health check:

```txt
http://127.0.0.1:8000/health
```

### 4. Seed Beach Data

Run this once after MongoDB is configured:

```bash
python -m app.seed.seed_beaches
```

Optional image metadata refresh:

```bash
python -m app.seed.seed_beach_images
```

### 5. Frontend Environment

Open a second terminal:

```bash
cd frontend
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=false
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_optional
```

For Google OAuth, `VITE_GOOGLE_CLIENT_ID` must match `GOOGLE_CLIENT_ID` in `backend/.env`.

### 6. Frontend Install And Run

```bash
npm install
npm run dev
```

Frontend URL:

```txt
http://127.0.0.1:5173/
```

### 7. Common Setup Checks

- If login/register fails, check `JWT_SECRET` and `MONGODB_URI`.
- If generated plans fail, check `GEMINI_API_KEY`.
- If admin is blocked, check that the logged-in email is listed in `ADMIN_EMAILS`.
- If CORS fails, check `CLIENT_URL=http://localhost:5173` and use the frontend URL above.
- If the database starts empty, run `python -m app.seed.seed_beaches`.

## CRUD Mapping

| Area | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Users | `POST /auth/register`, `POST /auth/google` | `GET /users/me`, `GET /admin/users` | `PATCH /users/me`, `PATCH /admin/users/{user_id}` | `DELETE /users/me`, `DELETE /admin/users/{user_id}` |
| Beach plans | `POST /plans`, `POST /plans/save-snapshot` | `GET /plans`, `GET /plans/{plan_id}`, `GET /admin/plans` | `PATCH /plans/{plan_id}`, `PATCH /plans/{plan_id}/replay` | `DELETE /plans/{plan_id}`, `DELETE /admin/plans/{plan_id}` |
| Mood clusters | `POST /clusters` | `GET /clusters`, `GET /clusters/{cluster_id}` | `PATCH /clusters/{cluster_id}` | `DELETE /clusters/{cluster_id}` |
| Beaches | Seed scripts / `POST /admin/beaches` | `GET /beaches`, `GET /beaches/{id}`, `GET /beaches/slug/{slug}` | `PATCH /admin/beaches/{beach_id}` | `DELETE /admin/beaches/{beach_id}` |
| Conditions | n/a | `GET /conditions`, `GET /conditions/{slug}`, `GET /conditions/map` | refresh/cache update internally | n/a |
| Activity log | backend service writes | `GET /admin/activities` | n/a | n/a |

## Folder Structure

```txt
BeachPlease/
  backend/
    main.py                 FastAPI app entrypoint and router registration
    requirements.txt        Python dependencies
    .env.example            Backend environment variable template
    app/
      auth.py               JWT, password hashing, current-user/admin dependencies
      config.py             Environment configuration
      database.py           MongoDB connection helpers
      models/               Pydantic request/response models
      routes/               Auth, users, beaches, conditions, plans, clusters, admin APIs
      services/             Gemini, ranking, weather, activity log, suburb validation
      seed/                 Beach seed data and image metadata scripts
  frontend/
    index.html              Single HTML entrypoint for the SPA
    package.json            React/Vite dependencies and scripts
    .env.example            Frontend environment variable template
    src/
      App.jsx               React Router route tree
      api/                  Axios API wrappers
      components/           Reusable UI, explore, map, plan, cluster, auth components
      components/map/       Leaflet map implementation and map helpers
      context/              Auth context and token/profile state
      pages/                Login, register, explore, saved plans, profile, admin
      styles/               Feature-level CSS files imported by `index.css`
      utils/                Display, payload, adapter, and error helpers
  database/                 Sanitized MongoDB JSON export files for submission
  README.md                 Setup, feature, CRUD, and workload documentation
  PRD.md                    Product requirements and design rationale
```

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

### Frontend

- `VITE_API_BASE_URL`
- `VITE_USE_MOCKS`
- `VITE_GOOGLE_CLIENT_ID`

Never commit real `.env` files.

## Seed Beaches

```bash
cd backend
source venv/bin/activate
python -m app.seed.seed_beaches
```

## Database Export

The `database/` folder contains sanitized MongoDB JSON exports for beaches, users, plans, clusters, and user activities. User emails, password hashes, OAuth subjects, and token-like fields are redacted or anonymized before export.

To regenerate the export after configuring `backend/.env`:

```bash
cd backend
python -m app.seed.export_database
```

## Workload Allocation

This allocation is based on the repository history and current file ownership.

| Member | Main responsibilities | Representative files |
| --- | --- | --- |
| Nguyen Quang Tu (`125725836+tuwang2301@users.noreply.github.com`) | Authentication, JWT/profile flow, admin authorization, admin dashboard, activity logging, saved plans, clusters, data exports, validation/error handling | `backend/app/auth.py`, `backend/app/routes/auth_routes.py`, `backend/app/routes/user_routes.py`, `backend/app/routes/admin_routes.py`, `backend/app/routes/plan_routes.py`, `backend/app/routes/cluster_routes.py`, `backend/app/services/activity_log.py`, `frontend/src/pages/Admin.jsx`, `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`, `frontend/src/pages/Profile.jsx`, `frontend/src/components/SavedModeShell.jsx`, `database/*.json` |
| Soham (`soham.mundhe@student.uts.edu.au`) Main Webapp Architecture| Visual product direction, landing/canvas experience, cluster and generated-plan UI, saved-plan UI, walkthrough/help, audio, map integration polish, documentation updates | `frontend/src/components/LandingIntro.jsx`, `frontend/src/components/CircularBeachCanvas.jsx`, `frontend/src/components/CircularBeachTile.jsx`, `frontend/src/components/ClusterStackGallery.jsx`, `frontend/src/components/GeneratedPlanJournal.jsx`, `frontend/src/components/help/HowToUseOverlay.jsx`, `frontend/src/pages/MainExperience.jsx`, `frontend/src/pages/ResultExperience.jsx`, `frontend/src/styles/*.css`, `README.md`, `PRD.md` |
| Mrinaluts (`Mrinal.Parashar@student.uts.edu.au`) | Map exploration contribution and geospatial interaction support | `frontend/src/components/map/leaflet/LeafletBeachMap.jsx`, `frontend/src/components/map/leaflet/LeafletMapMode.jsx`, `frontend/src/components/map/leaflet/LeafletMapSidebar.jsx`, `frontend/src/components/map/leaflet/leafletMapUtils.js`, map-related commits |

The workload is intentionally split across backend/security, frontend/product experience, and mapping/interaction areas so the assignment does not rely on a single member.

## Demo Video Checklist

For the required video, keep it under 3 minutes and show the browser UI:

1. Register or log in, then show the profile/account state.
2. Explore beaches on canvas/map and use live/dynamic beach details.
3. Generate a beach plan, then save it.
4. Open saved plans, edit notes/replay/delete a plan.
5. Create/update a cluster and add/remove a beach.
6. Log in as an admin and briefly show dashboard, users, beaches, plans, and activities.

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
- Gemini and Open-Meteo require API/network availability.
- Admin routes require authenticated admin role/email configuration.
- Some images may use fallback assets.
