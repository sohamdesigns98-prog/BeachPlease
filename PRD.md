# BeachPlease PRD

## Product Summary

BeachPlease is a Sydney beach recommendation app that helps a user decide where to go today. It combines a cinematic cloud-video landing, a guided 4-stage decision funnel, an interactive Mapbox map, live Open-Meteo conditions, deterministic beach ranking, and Gemini-generated ticket-style beach plans.

The product should feel like a practical Sydney local with a dry sense of humour: specific, useful, lightly funny, and never like a generic travel brochure.

## Final Product Direction

BeachPlease includes:

- Cinematic cloud-video landing with an `ENTER EXPERIENCE` transition.
- Side-by-side main experience with a 4-stage decision funnel on the left and an interactive Mapbox map on the right.
- Optional mood input as a final vibe note.
- Live weather and marine conditions from Open-Meteo.
- Gemini-generated ticket-style `BeachPlanTicket`.
- Auth-later save flow after a ticket is generated.
- Saved plan shelf with notes, replay, and delete.

## Product Decisions

- Keep `shadcn/ui` for reusable primitives.
- Keep Geist Mono throughout the app.
- Keep the Aussie deadpan humour.
- Use Mapbox GL JS for the main interactive map.
- Keep the mood input visually present.
- Mood input is not the main directory input.
- Mood input enhances the 4-stage funnel as a final context note.

## User Flow

### 1. LandingIntro

- Fullscreen cloud video background.
- Landing copy in Geist Mono.
- `ENTER EXPERIENCE` button.
- Cinematic cloud transition into the app.

### 2. MainExperience

- Left panel: 4-stage decision funnel.
- Right panel: interactive Mapbox map of Sydney beaches.
- Map and funnel respond to each other as the user narrows intent.

### 3. Stage 0: Region

User chooses a coastal region:

- northern
- manly
- harbour
- eastern
- south
- cronulla

### 4. Stage 1: Activity

User chooses the beach-day activity:

- swim
- surf
- relax
- snorkel
- walk

### 5. Stage 2: Candidate Beaches and Companion

The app shows 2-3 candidate beaches with live conditions.

User chooses companion context:

- solo
- partner
- family
- dog
- mates

### 6. Stage 3: Optional Mood Note

User can add a final mood phrase:

> anything else the coast should know?

This note adds human context to the ranking and Gemini prompt. It does not behave like a directory filter.

### 7. Result

The app generates a ticket-style beach plan using the selected funnel state, live conditions, beach data, and optional mood note.

### 8. Save Flow

If the user is unauthenticated, a `SaveBar` appears after the ticket is generated.

Saving opens an `AuthSheet` without a route change. On successful auth, the JWT is stored and the generated plan is saved.

## Mood Input Role

The mood input is a final optional vibe note inside the 4-stage funnel. It exists to keep BeachPlease playful and human, not to act like a directory search box or filter system.

Examples:

- "I need somewhere quiet, no one I know."
- "Proper surf, not tourist slop."
- "Family day, low disaster please."

## Map Behaviour

- Stage 0 shows the whole Sydney coast.
- Selecting a region zooms or focuses the map.
- Selecting an activity changes beach suitability highlighting.
- Stage 2 highlights the candidate beaches.
- Typing a mood phrase subtly affects vibe and context.
- The final result locks the map onto the selected beach.

## Conditions Pipeline

Target behaviour:

1. Fetch conditions for all beaches.
2. Cache conditions in memory.
3. Refresh every 30 minutes if APScheduler is implemented.
4. `GET /conditions` returns the cached full list.
5. `GET /conditions/{slug}` returns one beach.
6. `GET /conditions/map` returns a map-focused subset.
7. Crowd is estimated with a heuristic, not a real crowd API.

Live data includes:

- Temperature
- Wind speed
- Wind direction
- UV index
- Wave height
- Wave period
- Fetch timestamp

## Recommendation Logic

BeachPlease should combine deterministic ranking with Gemini writing.

Deterministic ranking considers:

- Region
- Activity
- Companion context
- Optional mood phrase
- Beach suitability tags
- Live conditions
- Time of day
- Crowd heuristic

Gemini should only choose from provided candidate beaches and should return structured JSON that matches the Beach Plan schema.

## Voice Rules

BeachPlease voice:

- Sydney local.
- Deadpan.
- Specific.
- Useful first, funny second.
- Practical and warm.
- No generic travel brochure language.
- No phrases like "hidden gem", "perfect destination", or "crystal-clear waters".
- No safety jokes.

Safety advice must stay clear and serious.

## Stack

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
- APScheduler if implemented
- Open-Meteo
- Gemini

## Database

Collections:

- `users`
- `beaches`
- `beach_plans`

## API Endpoints

Current and planned endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- `GET /beaches`
- `GET /conditions`
- `GET /conditions/{slug}`
- `GET /conditions/map`
- `POST /plans`
- `GET /plans`
- `GET /plans/{id}`
- `PATCH /plans/{id}`
- `PATCH /plans/{id}/replay`
- `DELETE /plans/{id}`

## CRUD Mapping

### Create

- Register user.
- Generate and save plan.

### Read

- Read saved plans.
- Read one plan.
- Read profile.
- Read conditions.

### Update

- Edit plan notes.
- Replay plan with fresh conditions.
- Update profile.

### Delete

- Delete plan.
- Delete account.

## Auth-Later Save Flow

BeachPlease should not block the first recommendation behind login.

Target behaviour:

1. User completes the funnel.
2. App generates a Beach Plan ticket.
3. If unauthenticated, the ticket remains visible.
4. Save action opens an auth sheet in place.
5. On successful login or register, JWT is stored.
6. Plan is saved without losing the generated result.

## Known Limitations

- No real crowd API.
- Crowd level is currently heuristic.
- Mapbox needs a token.
- Gemini and Open-Meteo require network and API availability.
- Beach image fallbacks may be used.
- APScheduler should only be described as active once implemented.

## Non-Goals

- Do not remove `shadcn/ui`.
- Do not replace Geist Mono.
- Do not claim deployment unless deployed.
- Do not claim APScheduler is implemented unless it is.
- Do not add fictional features.
