# BeachPlease

BeachPlease is a mood-aware Sydney beach recommendation app. It uses a 4-stage decision funnel, live coastal conditions, an interactive Mapbox map, and Gemini to generate a practical beach plan.

## Screens

[Landing cloud intro screenshot]

[Funnel + Mapbox map screenshot]

[Ticket result screenshot]

[Saved shelf screenshot]

[Plan detail screenshot]

## Tech Stack

### Frontend

- React + Vite
- React Router
- Axios
- Tailwind CSS
- shadcn/ui
- Geist Mono
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

- Cinematic cloud-video landing
- 4-stage beach decision funnel
- Interactive Mapbox map
- Optional mood input as a vibe note
- Live weather and marine conditions
- Gemini beach plan generation
- Ticket-style result card
- Auth
- Saved shelf
- Plan notes
- Replay for fresh conditions
- Delete plan
- Profile settings

## CRUD Mapping

| Operation | Endpoints |
| --- | --- |
| Create | `POST /auth/register`, `POST /plans` |
| Read | `GET /plans`, `GET /plans/{id}`, `GET /users/me`, `GET /conditions` |
| Update | `PATCH /plans/{id}`, `PATCH /plans/{id}/replay`, `PATCH /users/me` |
| Delete | `DELETE /plans/{id}`, `DELETE /users/me` |

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
- `GET /plans`
- `GET /plans/{id}`
- `PATCH /plans/{id}`
- `PATCH /plans/{id}/replay`
- `DELETE /plans/{id}`

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
- `VITE_USE_MOCKS`

## Seed Beaches

```bash
cd backend
source venv/bin/activate
python -m app.seed.seed_beaches
```

## Assessment Alignment

BeachPlease uses a modern frontend library through React with Vite, React Router, Tailwind CSS, shadcn/ui, and Mapbox GL JS. The frontend behaves as a single-page application, with local state and routed views for the main experience, auth, shelf, profile, and plan detail pages.

The backend is implemented with FastAPI and exposes REST endpoints for auth, users, beaches, conditions, ranking, AI generation, and saved plans. MongoDB Atlas is used as the database through Motor, with collections for users, beaches, and beach plans.

The app demonstrates full CRUD through user registration and plan creation, reading saved plans and profiles, updating notes or replaying plans, and deleting plans or accounts. The interface is designed as a streamlined flow: users move from a cinematic landing into a guided beach decision experience, then receive one clear ticket-style recommendation.

## Known Limitations

- No real crowd API.
- Crowd is estimated.
- Mapbox requires a token.
- Gemini and Open-Meteo require API/network availability.
- Some images may use fallback assets.
