# BeachPlease Product Requirements Document

## 1. Product Summary

BeachPlease is a canvas-first Sydney beach recommendation web app for choosing and planning a Sydney beach day.

The app helps a user move from a mood or vague beach craving into a specific, practical beach plan using:

- a visual beach canvas
- existing Sydney beach data
- live Open-Meteo coastal conditions
- backend ranking logic
- Gemini-generated plan content
- saved plans with notes, replay, and delete flows

BeachPlease should feel like a calm, local, slightly cheeky Sydney beach mate. It should not feel like a generic beach directory, travel booking product, chatbot, or old-style form funnel.

## 2. Current Product Flow

1. User lands on the cloud opening animation.
2. User clicks `ENTER EXPERIENCE`.
3. The app opens into Mood mode by default.
4. The top-right toggle shows `Saved | Mood | Map`.
5. Mood mode shows a visual beach canvas.
6. Beach image tiles appear in a scattered/circular 3D canvas formation.
7. Hovering a beach tile reveals name/basic info with subtle 3D/parallax behaviour.
8. Clicking a beach tile opens a right-side `BeachInfoTile`.
9. The bottom mood input remains available.
10. User can create a full Beach Plan through the Create Plan flow.
11. Create Plan accepts mood, companion, locality/coastal area, activity, food/cafe/bar preference, and extra notes/preferences.
12. Create Plan submits to backend `POST /plans`.
13. Backend uses beach data, live Open-Meteo conditions, ranking logic, and Gemini to generate the plan.
14. Loading/reveal can use the beach rolodex animation if implemented.
15. Result shows the generated Beach Plan.
16. Authenticated users can save the plan.
17. Saved mode lets users view saved plans and use notes, replay, and delete flows.
18. Map mode shows the Mapbox coastal map and live beach conditions.

## 3. Primary Modes

### Mood

Mood is the default experience after the cloud opening.

Mood mode includes:

- circular/scattered beach image canvas
- beach tile hover states
- beach tile click selection
- right-side `BeachInfoTile`
- bottom mood input
- Create Plan action
- optional loading/reveal animation

Mood mode is visual first. It should not become a traditional questionnaire.

### Saved

Saved mode is the personal archive for authenticated users.

Saved mode supports:

- list saved beach plans
- open a saved plan
- update notes
- replay a plan with fresh conditions
- delete a saved plan

Saved plan data comes from the backend `beach_plans` collection. Do not use `localStorage` as the primary saved plan system.

### Map

Map mode uses Mapbox GL JS.

Map mode supports:

- Sydney coastal map
- live beach condition markers
- beach marker selection
- selected beach state shared with Mood mode where practical
- right-side beach info context where supported

Mapbox remains the spatial map technology. Do not replace it with Leaflet or a static image map.

## 4. Beach Canvas Requirements

The beach canvas is the main discovery surface.

Requirements:

- use existing beach records and `image_url` fields
- render beach image tiles in a scattered/circular 3D canvas formation
- keep the formation calm, clean, and premium
- use subtle motion and parallax
- respect `prefers-reduced-motion`
- hover reveals beach name and basic info
- click selects the beach and opens `BeachInfoTile`
- mood input remains available while browsing
- selecting a tile does not automatically generate a plan

The canvas should feel like a coastal image archive, not a directory grid.

## 5. BeachInfoTile

`BeachInfoTile` opens when a user clicks a beach tile or selects a beach from the map.

It should show:

- beach name
- area/suburb/region
- beach image
- live condition summary where available
- temperature, waves, wind, UV, crowd estimate where available
- facilities
- best time
- what to bring
- safety or condition notes where available
- Create Plan / Generate Plan action

The tile should be readable, minimal, and aligned with the visual language in `design.md`.

## 6. Create Plan

Create Plan is the main create action.

It creates one beach day plan for today. The user acts like a director and can provide:

- mood
- companion
- locality/coastal area
- activity
- food/cafe/bar preference
- extra notes/preferences
- selected beach if one has been clicked

The frontend must submit plan creation through the backend. It must not call Gemini directly.

Primary endpoint:

```txt
POST /plans
```

Supported backend payload fields include:

```txt
region
activity
companion
mood_phrase
preferred_beach_slug
selected_mood
companion_context
experience_tags
```

The backend remains responsible for final ranking, validation, live condition fetching, and Gemini generation. The frontend can guide the request, but it must not pretend to choose the final beach when backend ranking/generation is responsible.

## 7. Generated Beach Plan

The generated Beach Plan should show:

- selected beach
- when to go
- what to do
- food/drink suggestion
- why it fits the user
- live conditions summary
- what to bring
- gentle warning or safety note
- save action for authenticated users

The result must be readable as a plan, not only a decorative postcard image.

## 8. Saved Plans

Authenticated users can save and manage generated plans.

Saved plan features:

- create/save generated plan
- view saved plans
- open plan detail
- update user notes
- replay plan with fresh live conditions
- delete plan

Saved plans are stored in MongoDB in `beach_plans`.

## 9. Optional Clusters And Rituals

### Create Cluster

Mood clusters are implemented in the backend and can be treated as optional product surface.

A cluster is a personal group of beaches around a mood, occasion, or type of day.

Examples:

- quiet reset
- soft date beaches
- proper swim spots
- big arvo
- when Bondi is doing too much

Clusters are stored in `mood_clusters`.

### Create Ritual

Rituals are a future or prototype-level feature unless backed by persistent backend routes.

A ritual means a repeatable beach routine that can be re-run with fresh live conditions.

Examples:

- Sunday reset swim
- after-class decompression
- Friday arvo with mates
- solo morning dip

If rituals remain frontend-only or `localStorage`-only, document them as prototype UI, not production CRUD.

## 10. Backend Architecture

Keep the backend architecture based on:

- FastAPI
- MongoDB / MongoDB Atlas
- Motor
- JWT auth
- Gemini
- Open-Meteo
- Mapbox on the frontend
- React/Vite frontend

The backend owns:

- auth
- user profile data
- beach data
- live condition retrieval/cache
- ranking/preselection
- Gemini plan generation
- saved beach plans
- mood clusters if enabled

## 11. Current Backend Endpoints

Health:

- `GET /health`
- `GET /db-check`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`

Users:

- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`

Beaches:

- `GET /beaches`
- `GET /beaches/slug/{slug}`
- `GET /beaches/{beach_id}`

Conditions:

- `GET /conditions`
- `GET /conditions/`
- `GET /conditions/map`
- `GET /conditions/{slug}`
- `GET /conditions/test`

Ranking / AI support:

- `POST /rank/test`
- `POST /ai/test-plan`

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

## 12. CRUD Mapping

### Users

| Operation | Endpoint |
| --- | --- |
| Create | `POST /auth/register`, `POST /auth/google` |
| Read | `GET /users/me` |
| Update | `PATCH /users/me` |
| Delete | `DELETE /users/me` |

### Beach Plans

| Operation | Endpoint |
| --- | --- |
| Create | `POST /plans`, `POST /plans/save-snapshot` |
| Read | `GET /plans`, `GET /plans/{plan_id}` |
| Update | `PATCH /plans/{plan_id}`, `PATCH /plans/{plan_id}/replay` |
| Delete | `DELETE /plans/{plan_id}` |

### Mood Clusters

| Operation | Endpoint |
| --- | --- |
| Create | `POST /clusters` |
| Read | `GET /clusters`, `GET /clusters/{cluster_id}` |
| Update | `PATCH /clusters/{cluster_id}` |
| Delete | `DELETE /clusters/{cluster_id}` |

### Rituals

No production backend ritual CRUD is currently required unless ritual routes/models are added. If rituals are frontend-only, they are prototype state and should not be documented as persistent backend CRUD.

## 13. Current Data Model

### User

Core user fields:

- `_id`
- `email`
- password hash or auth provider metadata
- `suburb`
- `postcode`
- `suburb_lat`
- `suburb_lng`
- `companions`
- `travel_mode`
- `auth_provider`
- `profile_complete`
- `created_at`
- `updated_at`

### Beach

Beach records should include:

- `_id`
- `slug`
- `name`
- `suburb` / area / region fields
- `lat`
- `lng`
- `image_url`
- descriptive and practical beach metadata
- vibe, facility, access, or best-for tags where available

### Beach Plan

Saved/generated beach plans include:

- `_id`
- `user_id`
- `mood_phrase`
- `region`
- `activity`
- `companion`
- `preferred_beach_slug`
- selected/generated beach fields
- generated plan text fields
- live conditions summary
- warning/safety note
- `input_context`
- `user_notes`
- `created_at`
- `updated_at`
- `replayed_at`

### Mood Cluster

Mood clusters include:

- `_id`
- `user_id`
- `name`
- `description`
- `mood_phrase`
- `color`
- `beach_slugs`
- `created_at`
- `updated_at`

### Ritual

A production ritual model, if added later, should include:

- `user_id`
- `name`
- `mood_phrase`
- `preferred_time`
- `companion`
- `locality`
- `activity`
- `food_drink_preference`
- optional linked cluster
- extra preferences
- timestamps

Running a ritual should create a fresh Beach Plan using current live conditions.

## 14. Visual Language

The visual language follows `design.md`.

Summary:

- off-white coastal background
- soft cloud opening
- Instrument Sans
- quiet editorial typography
- clean minimal navigation
- image-led canvas
- tactile beach image tiles
- subtle shadows and depth
- restrained colour
- calm 3D/parallax motion
- no generic travel-card grid
- no dashboard-like interface
- no heavy explanatory UI copy

Motion should be smooth, premium, and quiet. Respect `prefers-reduced-motion`.

## 15. Security And Configuration

Do not commit real `.env` files.

Keep `.env.example` files placeholder-only.

Secrets and keys must remain local or in deployment secret storage:

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `VITE_MAPBOX_TOKEN`
- Google OAuth client IDs/secrets where applicable

Frontend must not call Gemini directly.

Backend should validate authenticated access for:

- saved plans
- notes
- replay
- delete
- clusters
- profile updates

## 16. Deprecated Direction

The following patterns should not guide new implementation:

- visible multi-step questionnaire as the primary experience
- generic beach directory UI
- chatbot-style beach selection
- static-only mock recommendation flow
- purely decorative result cards with no readable plan detail

The backend may still accept structured fields such as region, activity, and companion, but these are inputs to Create Plan rather than a required visible funnel.

## 17. Implementation Guardrails

- Do not break `POST /plans`.
- Do not break saved plan notes, replay, or delete.
- Do not break Mapbox.
- Do not break Open-Meteo condition flows.
- Do not break Gemini generation.
- Do not replace backend ranking with frontend random selection.
- Do not remove auth-protected saved plan behaviour.
- Keep Mood, Saved, and Map as the product modes.
- Keep Create Plan as the main create action.
