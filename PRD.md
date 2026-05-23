# BeachPlease Product Requirements Document

## 1. Product Summary

BeachPlease is a canvas-first Sydney beach recommendation web app for choosing and planning a Sydney beach day.

The current product combines:

- cloud opening experience
- circular/scattered beach canvas
- hover/click beach tiles
- right-side beach information
- mood-led plan creation
- Mapbox coastal map
- saved plans with notes/replay/delete
- mood clusters and stack browsing
- admin dashboard for data management
- FastAPI, MongoDB, Gemini, Open-Meteo, and React/Vite

BeachPlease should feel local, calm, visual, and slightly cheeky. It should not feel like a generic beach directory, chatbot, or old form funnel.

## 2. Current Product Flow

1. User lands on the cloud opening animation.
2. User clicks `ENTER EXPERIENCE`.
3. The app opens into the canvas-first explore experience.
4. Users browse beach image tiles in a circular/scattered 3D canvas formation.
5. Hovering a beach tile reveals name/basic info with subtle 3D/parallax behaviour.
6. Clicking a beach tile opens a right-side `BeachInfoTile`.
7. The bottom mood input remains available.
8. User can create a full Beach Plan through the Create Plan flow.
9. Create Plan can include mood, companion, locality/coastal area, activity, food/cafe/bar preference, extra notes, and selected beach context.
10. Create Plan submits to backend `POST /plans` or uses preview/snapshot flows where appropriate.
11. Backend uses beach data, live Open-Meteo conditions, ranking logic, and Gemini to generate the plan.
12. Result shows a generated Beach Plan with selected beach, timing, activity, food/drink suggestion, fit rationale, live conditions, bring list, and gentle warning.
13. Authenticated users can save the plan.
14. Saved plans support notes, replay, and delete.
15. Map mode shows the Mapbox coastal map and live beach conditions.
16. Cluster mode shows curated beach stacks and beach browsing by mood/use case.
17. Admin users can access `/admin` to manage users, plans, beaches, and activity data.

## 3. Primary Frontend Surfaces

### Landing

- Cloud opening animation.
- `ENTER EXPERIENCE` call to action.
- Respect reduced motion.
- Starts beach ambience after entry.

### Explore / Canvas

- Circular/scattered beach image canvas.
- Existing beach data and `image_url` fields.
- Subtle motion and depth.
- Hover reveals beach name/basic metadata.
- Click opens `BeachInfoTile`.
- Mood input remains available.
- Create Plan action remains the main create action.

### BeachInfoTile

Shows selected beach context:

- beach name
- area/suburb/region
- beach image
- live condition summary where available
- temperature, waves, wind, UV, crowd estimate where available
- facilities
- best time
- what to bring
- warning/safety note where available
- cluster membership where available
- plan generation action

### Map

- Uses Mapbox GL JS.
- Shows Sydney beaches spatially.
- Uses live condition markers and selected beach state.
- Must not be replaced with Leaflet or a static-only map.

### Clusters

- Cluster surface uses stack/coverflow-inspired beach browsing.
- Clusters group beaches by mood, occasion, or type of day.
- Backend persists clusters in `mood_clusters`.

### Saved Plans

- Saved plan archive for authenticated users.
- Supports list, detail, notes, replay, and delete.
- Data comes from backend `beach_plans`.

### Admin

Admin is a protected operational surface at `/admin`.

Admin users can:

- view dashboard stats
- inspect recent activity
- list users
- change user roles
- delete users and related data
- list plans
- delete plans
- create beaches
- update beaches
- delete beaches

Admin access is controlled by backend role/email checks and frontend `AdminRoute`.

## 4. Create Plan

Create Plan is the main create action.

It creates one beach day plan. The user can provide:

- mood
- companion
- locality/coastal area
- activity
- food/cafe/bar preference
- extra notes/preferences
- selected beach if one has been clicked

Primary endpoint:

```txt
POST /plans
```

Related endpoints:

```txt
POST /plans/preview
POST /plans/save-snapshot
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

The frontend must not call Gemini directly. The backend owns final ranking, validation, live condition fetching, and Gemini generation.

## 5. Generated Beach Plan

The generated plan should show:

- selected beach
- when to go
- what to do
- food/drink suggestion
- why it fits
- live conditions summary
- what to bring
- gentle warning or safety note
- save action for authenticated users

The result must be readable as a plan, not only a decorative postcard image.

## 6. Backend Architecture

Keep the backend architecture based on:

- FastAPI
- MongoDB / MongoDB Atlas
- Motor
- JWT auth
- role-aware admin auth
- Gemini
- Open-Meteo
- APScheduler condition refresh
- Mapbox on the frontend
- React/Vite frontend

The backend owns:

- auth
- user profile data
- user roles/admin authorization
- suburb lookup proxy
- beach data
- admin beach CRUD
- live condition retrieval/cache
- ranking/preselection
- Gemini plan generation
- saved beach plans
- mood clusters
- activity logging

## 7. Current Backend Endpoints

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

## 8. CRUD Mapping

### Users

| Operation | Endpoint |
| --- | --- |
| Create | `POST /auth/register`, `POST /auth/google` |
| Read | `GET /users/me`, `GET /admin/users` |
| Update | `PATCH /users/me`, `PATCH /admin/users/{user_id}` |
| Delete | `DELETE /users/me`, `DELETE /admin/users/{user_id}` |

### Beach Plans

| Operation | Endpoint |
| --- | --- |
| Create | `POST /plans`, `POST /plans/save-snapshot` |
| Read | `GET /plans`, `GET /plans/{plan_id}`, `GET /admin/plans` |
| Update | `PATCH /plans/{plan_id}`, `PATCH /plans/{plan_id}/replay` |
| Delete | `DELETE /plans/{plan_id}`, `DELETE /admin/plans/{plan_id}` |

### Mood Clusters

| Operation | Endpoint |
| --- | --- |
| Create | `POST /clusters` |
| Read | `GET /clusters`, `GET /clusters/{cluster_id}` |
| Update | `PATCH /clusters/{cluster_id}` |
| Delete | `DELETE /clusters/{cluster_id}` |

### Beaches

| Operation | Endpoint |
| --- | --- |
| Create | `POST /admin/beaches`, seed scripts |
| Read | `GET /beaches`, `GET /beaches/slug/{slug}`, `GET /beaches/{beach_id}` |
| Update | `PATCH /admin/beaches/{beach_id}` |
| Delete | `DELETE /admin/beaches/{beach_id}` |

### Activity Log

| Operation | Endpoint |
| --- | --- |
| Create | backend `log_activity` service |
| Read | `GET /admin/activities` |
| Update | n/a |
| Delete | n/a |

### Rituals

No production backend ritual CRUD is currently required unless ritual routes/models are added. If rituals are frontend-only, they are prototype state and should not be documented as persistent backend CRUD.

## 9. Current Data Model

### User

Core fields:

- `_id`
- `email`
- password hash or auth provider metadata
- `suburb`
- `postcode`
- `suburb_lat`
- `suburb_lng`
- `companions`
- `travel_mode`
- `role`
- `auth_provider`
- `profile_complete`
- `created_at`
- `updated_at`

### Beach

Beach records include:

- `_id`
- `slug`
- `name`
- `suburb`
- `region`
- `lat`
- `lng`
- `image_url`
- `water_type`
- `exposure`
- `accessibility`
- `crowd_level_default`
- suitability fields
- dog access
- vibe tags
- best-for tags
- facilities
- timestamps when admin-created/updated

### Beach Plan

Saved/generated plans include:

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
- candidate/rejected beach context where available
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

### User Activity

Admin/activity records include:

- `_id`
- `action`
- `entity_type`
- `entity_id`
- `label`
- actor/user context
- metadata
- `created_at`

## 10. Latest Merge Summary

Added:

- admin dashboard frontend
- admin route guard
- admin API client
- admin backend routes
- admin role/email authorization
- beach write model
- user activity logging
- suburb search API/client integration
- database sample JSON exports
- `ADMIN_EMAILS` env support

Removed earlier in the canvas cleanup:

- old 4-stage funnel components
- old funnel-first visible product flow
- old mock candidate selector helper
- old unused landing page component
- accidental backend npm lockfile

## 11. Visual Language

Use `design.md` as the interaction and style guide.

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
- dense but readable admin tools
- no generic travel-card grid
- no dashboard feel in the main user-facing experience

## 12. Security And Configuration

Do not commit real `.env` files.

Secrets and keys must remain local or in deployment secret storage:

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `VITE_MAPBOX_TOKEN`
- `GOOGLE_CLIENT_ID`
- `ADMIN_EMAILS`

Frontend must not call Gemini directly.

Admin routes must require authenticated admin users. Admin status is controlled by role/email configuration and should not be trusted from frontend state alone.

## 13. Implementation Guardrails

- Do not break `POST /plans`.
- Do not break saved plan notes, replay, or delete.
- Do not break Mapbox.
- Do not break Open-Meteo condition flows.
- Do not break Gemini generation.
- Do not replace backend ranking with frontend random selection.
- Do not remove auth-protected saved plan behaviour.
- Do not expose admin routes to non-admin users.
- Keep Create Plan as the main create action.
