# BeachPlease

BeachPlease is a canvas-first Sydney beach recommendation app. It uses a circular beach image canvas, live coastal conditions, Mapbox, and Gemini to generate a practical beach plan.

## Screens

[Landing cloud intro screenshot]

[Canvas + Mapbox screenshot]

[Generated plan screenshot]

[Saved shelf screenshot]

[Plan detail screenshot]

## Tech Stack

### Frontend

- React + Vite
- React Router
- Axios
- Tailwind CSS
- shadcn/ui
- Instrument Sans
- Mapbox GL JS

### Backend

- FastAPI
- Motor
- MongoDB Atlas
- JWT with `python-jose`
- `passlib` bcrypt
- `httpx`
- Open-Meteo
- Gemini
- APScheduler if implemented

## Core Features

- Cloud opening experience
- Circular beach image canvas
- Hover/click beach tiles
- Right-side beach info tile
- Mood input
- Interactive Mapbox map
- Live weather and marine conditions
- Gemini beach plan generation
- Create Plan flow
- Auth
- Saved shelf
- Plan notes
- Replay for fresh conditions
- Delete plan
- Profile settings

## CRUD Mapping

| Operation | Endpoints |
| --- | --- |
| Create | `POST /auth/register`, `POST /plans`, `POST /plans/preview`, `POST /clusters` |
| Read | `GET /plans`, `GET /plans/{id}`, `GET /users/me`, `GET /conditions`, `GET /clusters` |
| Update | `PATCH /plans/{id}`, `PATCH /plans/{id}/replay`, `PATCH /users/me`, `PATCH /clusters/{id}` |
| Delete | `DELETE /plans/{id}`, `DELETE /users/me`, `DELETE /clusters/{id}` |

## API Endpoints

- `GET /health`
- `GET /db-check`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- `GET /beaches`
- `GET /beaches/{id}`
- `GET /beaches/slug/{slug}`
- `GET /conditions`
- `GET /conditions/{slug}`
- `GET /conditions/map`
- `POST /rank/test`
- `POST /ai/test-plan`
- `POST /plans`
- `POST /plans/preview`
- `GET /plans`
- `GET /plans/{id}`
- `PATCH /plans/{id}`
- `PATCH /plans/{id}/replay`
- `DELETE /plans/{id}`
- `GET /clusters`
- `POST /clusters`
- `PATCH /clusters/{id}`
- `DELETE /clusters/{id}`

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend

- `MONGODB_URI`
- `DATABASE_NAME`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `CLIENT_URL`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_MAPBOX_TOKEN`
- `VITE_GOOGLE_CLIENT_ID`

## Seed Beaches

```bash
cd backend
source venv/bin/activate
python -m app.seed.seed_beaches
```

## Assessment Alignment

BeachPlease uses a modern frontend library through React with Vite, React Router, Tailwind CSS, shadcn/ui, and Mapbox GL JS. The frontend behaves as a single-page application, with local state and routed views for the main experience, auth, shelf, profile, and plan detail pages.

The backend is implemented with FastAPI and exposes REST endpoints for auth, users, beaches, conditions, ranking, AI generation, saved plans, and mood clusters. MongoDB Atlas is used as the database through Motor, with collections for users, beaches, beach plans, and clusters.

The app demonstrates full CRUD through user registration and plan creation, reading saved plans and profiles, updating notes or replaying plans, and deleting plans or accounts. The interface is designed as a streamlined flow: users move from a cloud opening into the canvas-first beach experience, then receive one clear generated plan.

## Known Limitations

- No real crowd API.
- Crowd is estimated.
- Mapbox requires a token.
- Gemini and Open-Meteo require API/network availability.
- Some images may use fallback assets.
