# BeachPlease — Product Requirements Document

## 1. Product Name

**BeachPlease**

BeachPlease is a Sydney beach recommendation web app that helps people decide where to go based on mood, live coastal conditions, and local beach knowledge.

The app should feel playful, local, visual, and experience-led. It should not feel like a directory, travel app, chatbot, or ordinary filter form.

---

## 2. Product Vision

BeachPlease helps users read the coast without opening fourteen tabs, pretending to understand surf reports, or defaulting to Bondi because their brain gave up.

The app combines:

- A visual, mood-led beach discovery interface
- Live weather and marine conditions
- Stable beach knowledge
- AI-generated beach plans
- Saved and downloadable postcard-style recommendations

The core experience should feel like:

> A calm but slightly cheeky Sydney beach mate, wrapped in a visual coastal map of moods, images, and live conditions.

---

## 3. Core Product Principle

BeachPlease should be structured underneath, playful on the surface.

The backend can remain logical, data-driven, and reliable.

The frontend should feel exploratory, emotional, visual, and local.

The app should avoid:

- ordinary filter panels
- dropdown-heavy forms
- generic beach directory cards
- tourism brochure language
- chatbot-style interfaces
- Google Maps-style clutter
- overexplaining the technology

The app should feel like:

- an infinite beach mood canvas
- a coastal discovery instrument
- a visual recommendation engine
- a printed beach postcard generator
- a local mate who knows when Bondi is cooked

---

## 4. Major Product Direction Update

The old 4-stage funnel-first interface is deprecated as the primary user experience.

Previous model:

```txt
LandingIntro
→ MainExperience
→ 4-stage funnel
→ Mapbox support
→ Gemini ticket result
```

New model:

```txt
LandingIntro
→ Mood Canvas Experience
→ Infinite draggable beach image canvas
→ Mood-based cluster highlighting
→ Beach info tile
→ Generate Postcard
→ AI-generated beach plan/postcard
→ Save/download/share
```

The old structured fields still matter, but they are now hidden backend intent fields rather than visible form steps.

Old visible funnel fields:

```txt
region
activity
companion
mood_phrase
preferred_beach_slug
```

New visible interaction model:

```txt
mood input
beach image canvas
optional companion/activity hints
selected beach
highlighted beach cluster
generated postcard
```

The frontend should translate the new interaction model into the backend payload.

---

## 5. Final Experience Flow

```txt
LandingIntro
→ Enter Experience
→ Mood mode opens by default
→ Infinite beach image canvas
→ Hover beach image for name/basic info
→ Click beach image to open right-side info tile
→ Type mood at bottom
→ App highlights relevant beach clusters
→ Optional companion/activity hints refine the cluster
→ Generate Postcard
→ Backend generates AI beach plan
→ Postcard result appears
→ User can save and download postcard image
→ Saved mode shows saved postcards
→ Map mode shows Mapbox spatial view
```

---

## 6. LandingIntro

The existing Codex cloud opening animation should remain.

Landing requirements:

- Cinematic cloud video background
- Looping MP4 cloud video
- Text and “ENTER EXPERIENCE” button
- On click:
  - landing text fades out quickly
  - cloud video moves upward
  - cloud video scales slightly
  - white/cloud veil fades in near the end
  - Mood Canvas Experience is revealed underneath
- No route cut
- Respect `prefers-reduced-motion`
- Keep the current Codex cloud animation unless a specific improvement is required

The cloud opening animation is part of the Codex app and should not be replaced by the Figma prototype.

---

## 7. Main Experience: Mood Canvas

After the user clicks “Enter Experience”, the default mode is **Mood**.

The screen should show:

```txt
Top-right:
Saved | Mood | Map toggle

Main area:
Infinite draggable canvas of Sydney beach images

Right side:
Beach info tile appears when a beach is selected

Bottom:
Mood/vibe input
Generate Postcard action
Optional companion/activity hint chips
```

The interface should feel visual first, not form first.

---

## 8. Top-Right Modes

The top-right toggle should show:

```txt
Saved | Mood | Map
```

These are internal modes, not separate route changes.

Use shared app state so selected beach, mood phrase, highlighted beaches, and generated results can persist between modes.

Recommended state shape:

```js
{
  activeMode: "mood",
  moodPhrase: "",
  selectedBeachSlug: null,
  highlightedBeachSlugs: [],
  suggestedBeachSlug: null,
  activityHint: null,
  companionHint: null,
  generatedPlan: null
}
```

---

## 9. Mood Mode

Mood mode is the default experience.

Mood mode should include:

- Infinite draggable canvas
- Beach image tiles mapped across a large visual field
- Mood input at the bottom
- Optional companion/activity hint chips
- Highlighted beach clusters
- Right-side info tile when a beach is selected
- Generate Postcard action

Mood mode should not look like a traditional quiz or filter form.

---

## 10. Saved Mode

Saved mode shows saved postcards/plans.

It should use the existing backend saved plans system.

Saved mode should support:

- viewing saved postcards
- opening a saved postcard
- replaying/regenerating a plan if supported
- deleting a saved plan
- downloading postcard image if available

The visual style should follow the Figma saved postcard direction, but the data should come from the Codex backend.

Do not use localStorage as the primary saved plan system.

---

## 11. Map Mode

Map mode shows the existing Mapbox spatial view.

Map mode should:

- use Mapbox GL JS
- show Sydney beaches spatially
- sync with selected beach state
- show live condition markers
- allow clicking a beach marker to open the same right-side info tile
- highlight selected or mood-matched beaches if available

Do not replace Mapbox with Leaflet.

Mapbox remains the spatial map technology.

---

## 12. Infinite Beach Canvas

The infinite canvas is the new primary interaction surface.

Requirements:

- Large draggable/pannable canvas
- Beach images arranged as visual/mood clusters
- Each beach appears as an image tile
- Tile placement can be manually designed initially
- Tiles should feel like a mood map, not a strict geographic map
- Canvas should be smooth and responsive
- Hover reveals basic beach information
- Click selects beach and opens right-side tile

The canvas does not need to be geographically accurate. Geographic accuracy belongs to Map mode.

Canvas should feel like:

```txt
a visual board of Sydney beach possibilities
```

not:

```txt
a literal map
```

---

## 13. Beach Image Tile

Each beach tile should show an image.

Default state:

- beach image visible
- subtle border or shadow
- calm/off-white visual context
- no heavy text clutter

Hover state:

- image subtly lifts/scales/moves
- beach name appears
- basic info appears
- optionally show region, vibe tag, wave/wind/UV snippet
- cursor suggests interactivity

Click state:

- selected tile becomes visually active
- right-side Beach Info Tile opens
- selected beach slug updates in app state

The image interaction should follow the Figma visual language.

---

## 14. Beach Info Tile

Clicking a beach opens a right-side tile/panel.

The tile should show:

- beach name
- region/suburb
- image
- short description or vibe summary
- live condition summary
- good for / avoid when
- crowd estimate if available
- Generate Postcard button
- optional safety/condition warning

The info tile should feel editorial and minimal, not like a database card.

It should use the Figma layout, type, spacing, and colour system.

---

## 15. Mood Input

The mood input remains available at the bottom of Mood mode.

Purpose:

- let the user describe what they want
- highlight matching clusters
- guide AI postcard generation
- allow generation even without selecting a beach

Example placeholders:

```txt
I need somewhere calm but not boring
quiet swim, no Bondi chaos
soft date energy, easy walk after
somewhere to disappear for a bit
big arvo with mates, but not cooked
proper swim, no nonsense
```

The mood input should not feel like a chatbot.

It should feel like a small note to the coast.

---

## 16. Mood Clustering

When the user types a mood, the app should highlight relevant clusters first.

Behaviour:

1. User types mood/vibe.
2. App analyses mood locally or through simple frontend heuristics initially.
3. Matching beach clusters become visually stronger.
4. Non-matching beaches fade slightly.
5. If companion/activity hints exist, the cluster can be refined further.
6. The app may suggest a best beach, but should not aggressively auto-select unless needed.

Confirmed behaviour:

```txt
Highlight clusters first.
If user adds companion/activity, split or refine the highlighted cluster.
```

Mood clustering should support both:

- selected beach generation
- no-selection generation

---

## 17. Optional Companion/Activity Hints

The old funnel asked for activity and companion as required stages.

The new canvas should not do that.

Instead, use optional chips near the mood input.

Possible companion hints:

```txt
solo
partner
family
dog
mates
```

Possible activity hints:

```txt
swim
surf
relax
snorkel
walk
```

These should feel like lightweight modifiers, not form steps.

Example:

```txt
Mood: "I need somewhere calm"
Chips: [solo] [swim]
```

This can refine the highlighted cluster and improve backend payload quality.

---

## 18. Generate Postcard

The main action is:

```txt
Generate Postcard
```

or a more voice-led variant:

```txt
SORT MY BEACH →
MAKE THE POSTCARD →
RIGHTO, PICK ONE →
```

The app should allow postcard generation in two cases.

### Case A: Beach Selected

User clicks a beach tile, then generates postcard.

Payload can include:

```js
{
  region: selectedBeach.region_key,
  activity: activityHint || inferredActivity || "relax",
  companion: companionHint || inferredCompanion || "solo",
  mood_phrase: moodPhrase,
  preferred_beach_slug: selectedBeach.slug
}
```

### Case B: No Beach Selected

User types mood and clicks Generate Postcard.

The app should choose or suggest the best beach from the highlighted cluster.

Payload can include:

```js
{
  region: inferredRegion || null,
  activity: activityHint || inferredActivity || "relax",
  companion: companionHint || inferredCompanion || "solo",
  mood_phrase: moodPhrase,
  preferred_beach_slug: suggestedBeachSlug || null
}
```

Backend should still handle the final ranking and validation.

The frontend should not call Gemini directly.

---

## 19. Backend Integration

The backend remains the Codex architecture.

Keep:

- FastAPI
- MongoDB
- Gemini
- Open-Meteo
- Mapbox data support
- JWT auth
- saved plans
- replay
- delete
- CRUD endpoints

Expected backend payload for plan generation can remain:

```json
{
  "region": "manly",
  "activity": "relax",
  "companion": "solo",
  "mood_phrase": "I need somewhere calm but not boring",
  "preferred_beach_slug": "shelly-beach-manly"
}
```

The frontend now derives those values from:

- selected beach
- mood phrase
- optional activity hint
- optional companion hint
- suggested beach
- highlighted cluster

Backend should:

1. Receive structured input.
2. Load beach data.
3. Fetch/read live conditions.
4. Rank/shortlist beaches.
5. Send top candidates to Gemini.
6. Validate Gemini selected beach.
7. Save or return the generated postcard/plan.

---

## 20. AI / Gemini Behaviour

Gemini should not randomly choose from all beaches.

Gemini should recommend only from backend-provided candidates.

Tone:

```txt
You are BeachPlease, a Sydney beach curator.
Sound like a witty Sydney local who knows the beaches properly.
Be warm, practical, specific, and lightly funny.
Use occasional Australian phrasing naturally.
Do not overdo slang.
Do not sound like a tourism brochure.
Do not sound like a chatbot.
Do not make safety warnings jokey.
Return only valid JSON.
Recommend only from provided candidates.
```

Expected generated structure:

```json
{
  "mood_reading": {
    "energy": "",
    "social_level": "",
    "desired_feeling": "",
    "pace": "",
    "summary": ""
  },
  "selected_beach": {
    "name": "",
    "slug": "",
    "reason": ""
  },
  "plan": {
    "where": "",
    "when": "",
    "why": "",
    "bring": [],
    "conditions_summary": "",
    "gentle_warning": ""
  },
  "rejected_beaches": [
    {
      "name": "",
      "reason": ""
    }
  ],
  "confidence": 0,
  "recommendation_type": "beach_postcard"
}
```

---

## 21. Final Postcard

The final generated result should be a postcard, not a generic card.

Postcard should include:

- selected beach image
- beach name
- mood reading
- where
- when
- why
- bring list
- live conditions summary
- gentle warning
- maybe rejected beaches or “why not the others”
- small BeachPlease branding
- date/time generated
- visual style from Figma

The postcard should feel like:

```txt
a generated artefact you would want to save, screenshot, or send to a friend
```

not:

```txt
a block of AI text
```

---

## 22. Save Behaviour

Generated postcards can be saved.

If user is logged in:

- save postcard/plan to backend
- show in Saved mode

If user is not logged in:

- show auth prompt/sheet
- explain saving is optional
- keep generated postcard visible

Copy example:

```txt
want to keep this? save your plan — free, takes 20 seconds.
```

Use existing auth/save architecture from Codex.

---

## 23. Download Postcard Image

The user should be able to download the generated postcard as an image.

Requirement:

- button on final postcard
- exports visible postcard component as PNG or JPEG
- filename should include beach name and date if possible

Example filename:

```txt
beachplease-shelly-beach-2026-05-09.png
```

Implementation may require a dependency such as:

```txt
html-to-image
```

or similar.

Do not add this dependency until implementing postcard export.

---

## 24. Share Behaviour

Primary share behaviour for now:

```txt
Download postcard image
```

Future share possibilities:

- copy text summary
- native Web Share API
- shareable URL
- social image export

But current requirement is postcard image download.

---

## 25. Visual Language

Figma is the source of truth for:

- layout
- type system
- colour system
- spacing
- mood map feeling
- image tile interaction
- info tile styling
- final postcard styling
- saved postcard styling
- minimal animations

Codex is the source of truth for:

- backend
- architecture
- API contracts
- auth
- saved plans
- Mapbox
- Gemini
- Open-Meteo
- cloud landing animation

The final app should preserve the Figma visual language while using Codex’s working architecture.

---

## 26. Typography

Use Geist Mono across the app unless explicitly changed in `DESIGN.md`.

Typography direction:

- small uppercase labels
- restrained headings
- mono UI text
- editorial spacing
- minimal but expressive copy
- no generic travel-app tone

---

## 27. Copy / Voice

Voice should sound like:

```txt
a witty Sydney local who knows the coast properly
```

Rules:

- practical first
- funny second
- light Aussie phrasing
- do not overdo slang
- do not joke about safety warnings
- do not insult the user
- avoid tourism brochure language
- keep labels short

Good copy examples:

```txt
RIGHTO, CHECKING THE COAST
same mood, fresh coast.
want to keep this? save your plan — free, takes 20 seconds.
Bondi is probably carrying on.
quiet swim, no nonsense
big arvo energy, but not Bondi chaos
```

Avoid:

```txt
Discover your perfect coastal escape
Unlock hidden gems
AI-powered coastal experiences
Stunning beach destination
```

---

## 28. Animation Policy

Animations should preserve the Figma interaction feel.

Allowed:

- subtle hover lift
- image scale on hover
- opacity fades
- tile reveal motion
- panel slide-in
- smooth mode transitions
- draggable canvas movement
- selected tile emphasis
- postcard entrance animation

Dependencies from Figma may be integrated only if they directly support the final interaction.

Do not blindly import Figma dependencies.

Avoid:

- unused heavy dependencies
- replacing Mapbox with Leaflet
- adding MUI unless absolutely necessary
- adding full animation libraries for simple transitions
- breaking existing Codex architecture

---

## 29. Technical Architecture

### Frontend

Keep:

```txt
React + Vite
React Router if currently used
Axios
Tailwind CSS
shadcn/ui where useful
Geist Mono
Mapbox GL JS
```

Potential future additions:

```txt
html-to-image
```

only when implementing postcard image download.

### Backend

Keep:

```txt
FastAPI
Motor
MongoDB Atlas
JWT with python-jose
passlib bcrypt
httpx
Open-Meteo
Gemini
APScheduler if implemented
```

---

## 30. Existing Core Backend Endpoints

Keep or align with:

```txt
GET    /health
GET    /db-check

POST   /auth/register
POST   /auth/login

GET    /users/me
PATCH  /users/me
DELETE /users/me

GET    /beaches
GET    /beaches/{id}
GET    /beaches/slug/{slug}

GET    /conditions
GET    /conditions/{slug}
GET    /conditions/map
GET    /conditions/test

POST   /rank/test
POST   /ai/test-plan

POST   /plans
GET    /plans
GET    /plans/{id}
PATCH  /plans/{id}
PATCH  /plans/{id}/replay
DELETE /plans/{id}
```

---

## 31. CRUD Mapping

| CRUD | User Action | Endpoint | Collection |
|---|---|---|---|
| Create | Register account | POST /auth/register | users |
| Create | Generate/save postcard | POST /plans | beach_plans |
| Read | View profile | GET /users/me | users |
| Read | View saved postcards | GET /plans | beach_plans |
| Read | View one postcard | GET /plans/{id} | beach_plans |
| Read | Read live conditions | GET /conditions | cache/Open-Meteo |
| Update | Edit profile | PATCH /users/me | users |
| Update | Edit postcard notes | PATCH /plans/{id} | beach_plans |
| Update | Replay postcard | PATCH /plans/{id}/replay | beach_plans |
| Delete | Delete postcard | DELETE /plans/{id} | beach_plans |
| Delete | Delete account | DELETE /users/me | users |

---

## 32. Data Collections

### users

```txt
email
password_hash
suburb
companions
travel_mode
created_at
updated_at
```

### beaches

```txt
name
slug
suburb
region
region_key
lat
lng
map_x
map_y
image_url
attribution
vibe_tags
best_for
avoid_when
facilities
access_tags
dog_access
accessibility
crowd_level_default
ideal_times
water_type
exposure
swim_suitability
surf_suitability
walk_suitability
created_at
updated_at
```

### beach_plans

```txt
user_id
region
activity
companion
mood_phrase
preferred_beach_slug
selected_beach_name
selected_beach_slug
image_url
mood_reading
plan
conditions
candidate_snapshot
rejected_beaches
confidence
recommendation_type
input_context
user_notes
created_at
updated_at
replayed_at
```

---

## 33. Conditions Pipeline

Conditions should still expose:

```txt
GET /conditions
GET /conditions/{slug}
GET /conditions/map
```

Target behaviour:

1. Fetch conditions for all beaches.
2. Cache in memory.
3. Refresh every 30 minutes if scheduler is implemented.
4. `/conditions` returns cached full list.
5. `/conditions/{slug}` returns one beach.
6. `/conditions/map` returns map/canvas-friendly subset.
7. Crowd is estimated, not real API.

Open-Meteo data:

- temperature
- wind speed
- wind direction
- UV index
- wave height
- wave period

Crowd heuristic:

- default popularity
- weekend
- time of day
- temperature
- wind

Crowd is live/derived, not permanently stored.

---

## 34. Implementation Notes

The frontend should likely introduce or refactor these components:

```txt
LandingIntro
MoodCanvasExperience
InfiniteBeachCanvas
BeachImageTile
BeachInfoTile
MoodInputBar
ModeToggle
PostcardResult
SavedPostcards
MapMode
```

Existing components that may need to change:

```txt
MainExperience.jsx
StageFunnel.jsx
ResultExperience.jsx
BeachPlanTicket.jsx
Shelf.jsx
MapboxBeachMap.jsx
```

The old `StageFunnel` can be:

- deprecated
- removed later
- or transformed into hidden intent logic/helper functions

Do not remove backend payload logic.

---

## 35. Implementation Priority

Recommended order:

```txt
1. Update PRD.md and DESIGN.md
2. Preserve existing cloud landing
3. Create MoodCanvasExperience shell
4. Add top-right Saved | Mood | Map toggle
5. Add infinite draggable beach canvas
6. Add beach image tiles
7. Add hover reveal
8. Add click-to-open info tile
9. Add bottom mood input
10. Add mood clustering/highlighting
11. Add optional companion/activity chips
12. Wire Generate Postcard to existing POST /plans
13. Redesign final result as postcard
14. Add save flow
15. Add download postcard image
16. Polish Saved mode
17. Polish Map mode
18. Responsive pass
```

---

## 36. Risks

### Risk 1: Breaking working backend integration

Mitigation:

- do not change backend first
- keep API payload contract stable
- translate canvas state into backend fields

### Risk 2: Importing too many Figma dependencies

Mitigation:

- use Figma as design source
- add only dependencies required for final interactions
- avoid MUI, Leaflet, and unused packages

### Risk 3: Losing assessment CRUD clarity

Mitigation:

- keep saved postcards backed by MongoDB
- keep auth flow
- keep create/read/update/delete endpoints visible
- document CRUD clearly

### Risk 4: Mood clustering becoming too complex

Mitigation:

- start with simple frontend heuristics using beach tags
- later improve with backend ranking or AI
- do not make clustering block postcard generation

### Risk 5: Infinite canvas performance

Mitigation:

- limit initial number of image tiles
- lazy load images
- compress images
- avoid over-heavy animation
- keep Mapbox separate in Map mode

### Risk 6: Login feeling pointless

Mitigation:

- make login unlock saved postcards, notes, regenerated plans, profile-aware ranking, and future calendar actions
- return users to the main experience after login/signup
- keep profile onboarding lightweight and tied to recommendation quality

---

## 37. Recent Refinements

### Auth and Profile

- Profile suburb comes from the postcode API where available.
- Store postcode, suburb latitude, and suburb longitude when selected.
- Backend ranking should use profile suburb proximity against beach coordinates.
- Gemini should consider proximity when vibe and conditions are otherwise similar.
- Google OAuth should use Google Identity Services on the frontend and verify the returned ID token on the backend before issuing the app JWT.
- New Google users should be marked profile-incomplete until suburb, companion, and travel settings are saved.

### Mood Canvas Interaction

- BeachPlease should not auto-select a beach while the user is idle; selection should stay user-driven.
- When a beach is selected, the canvas should glide that tile toward the viewport centre without a hard jump.
- Rendering 50 beach tiles is acceptable for the current prototype, but image weight and animation cost must be watched as the dataset grows.
- Mobile layouts should avoid horizontal overflow, keep global navigation usable in two compact rows, and give auth/saved/profile/plan pages enough top padding below the fixed nav.

### Saved Plans and Clusters

- Saved generated plans should live at a dedicated URL, currently `/saved-plans`.
- Generating a plan should produce a preview first, not automatically save.
- A generated plan is stored in MongoDB `beach_plans` only after the user chooses Save.
- Saved plans should support previewing the saved postcard, opening a detail page, updating notes, and deleting the plan.
- Destructive actions such as deleting plans, clusters, or accounts should use a confirmation modal and red danger styling.
- Clusters are for upcoming beaches or loose shortlists, not for storing generated plans, and require login because they belong to a user profile.
- User-scoped frontend caches for clusters and saved plans must be cleared on login, logout, register, Google auth, and auth refresh failure so switching accounts cannot show another profile's data.
- The saved plans surface should feel exploratory and canvas-like over time, while still keeping clear update/delete controls.
- The Cluster tab should remain available as a favorites/shortlist surface.
- The top navigation should persist across all app pages, so separate back buttons are not needed.
- Generated plan preview should have its own route, currently `/generated-plan`, so switching to Mood or Map leaves the preview.

### Conditions and Imagery

- Live beach-level conditions are useful only when they affect a decision the user understands.
- Prefer plain-language condition labels such as "gentle swim", "windy", "high UV", or "better after 4pm" over raw metrics as the primary UI.
- Raw metrics like UV, temperature, and swell can be secondary details or tooltips, not the main reason to choose a beach.
- If public condition APIs rate-limit, cache condition responses and fall back to regional/day-level summaries rather than showing broken null values.
- Do not fetch every beach condition on initial canvas load. Fetch beach-level conditions when a user opens a beach or when plan generation needs final candidates.
- Failed condition fetches such as API 429 should not be cached forever; retry them after a short cooldown.
- Beach images do not need to be manually added one by one forever; use a pipeline that imports from licensed/static sources, then allows manual curation for hero-quality beaches.
- The first image pass should seed curated Wikimedia Commons images for high-traffic beaches, preserve attribution/license/source metadata, and keep deterministic fallback images for beaches not curated yet.

### Integrations

- Google OAuth is a lower-friction auth option, but should still lead into profile/suburb onboarding.
- Google Calendar is a strong future premium feature because it turns a generated beach plan into a scheduled trip.

---

## 38. Open Questions

These should be resolved during implementation:

1. Should beach canvas positions be manually designed or generated from mood tags?
2. How many beach image tiles should appear initially?
3. Should mood clustering be frontend-only at first?
4. Should activity/companion hints be visible chips or inferred silently?
5. What image source should be used for each beach?
6. Should postcard download use `html-to-image`?
7. Should Saved mode show generated postcards only, or also unfinished selected beaches?
8. Should Map mode be visually integrated into the canvas style, or remain more functional?

---

## 39. Current Decisions Locked

```txt
Default mode after entering: Mood

Top-right toggle:
Saved | Mood | Map

Mood behaviour:
Highlight clusters first.
Companion/activity can refine cluster into sub-clusters.

Generate postcard:
Allowed with or without selected beach.

Share:
Download postcard image.

Backend:
Keep Codex backend and architecture.

Visual language:
Use Figma visual system as source of truth.

Map:
Keep Mapbox. Do not replace with Leaflet.

Old funnel:
Deprecated as visible interface.
Transformed into hidden backend intent fields.
```
