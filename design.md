# Design System and Implementation Guide

Project: Beach Moodboard Galaxy  
Source inspected: `BeachFigma.zip` Figma Make React export  
Purpose: Use this file as the single visual and interaction reference when rebuilding or integrating the frontend with the existing backend.

---

## 1. Product Feel

Beach Moodboard Galaxy should feel like a quiet, poetic, map-based beach curator rather than a normal beach directory.

The interface is built around three ideas:

1. A soft canvas world that users can drag, explore, and filter by mood.
2. Tiny beach image objects that feel like scattered postcards, pins, or mood fragments.
3. A minimal monospaced editorial system that makes the app feel calm, precise, and slightly archival.

Avoid making the UI look like a travel booking website, dashboard, or generic map app. The current visual language is much closer to a printed postcard, museum label, soft map, and moodboard combined.

Core adjectives:

- quiet
- airy
- editorial
- poetic
- cartographic
- tactile
- restrained
- slightly nostalgic
- precise
- soft coastal

---

## 2. Core User Flow

The app should keep a single-page app feeling. The user should not feel like they are moving through traditional pages. Instead, they are switching canvas states.

### Primary flow

1. User lands on a soft off-white interface.
2. User enters the experience.
3. User sees an infinite or large draggable canvas of beach image tiles.
4. Top-right mode toggle allows switching between:
   - mood
   - saved
   - map
5. Bottom input asks: `what kind of beach day do you need?`
6. User types a mood phrase.
7. Matching beach clusters become prominent, non-matching beaches fade down.
8. User hovers a beach tile to reveal name and condition metadata.
9. User clicks a beach tile.
10. A right-side detail panel slides in.
11. User can generate a postcard.
12. The postcard opens as a centered modal with save and share actions.
13. Saved postcards appear in the saved view.

---

## 3. Page Architecture

The app is structured around three mode states. Treat each as a page-like view, but do not route to a new browser page unless required by backend architecture.

```ts
type AppMode = 'mood' | 'saved' | 'map';
```

### Map mode

Purpose: Geographic exploration.

Visual behavior:

- Uses Sydney coastline SVG as a soft base map.
- Beach thumbnails sit to the right or along the coast.
- User can drag to pan.
- User can wheel-scroll to zoom.
- Hover opens a small metadata bubble.
- Selected beach gets stronger border, shadow, and glow.

### Mood mode

Purpose: Emotional exploration.

Visual behavior:

- Large moodboard canvas with image tiles scattered by vibe.
- Tiles are subtly rotated.
- User drags the world like an infinite canvas.
- Mood input highlights matching clusters.
- Non-matching tiles fade but remain visible.

### Saved mode

Purpose: Personal archive of generated beach postcards.

Visual behavior:

- Saved postcards are displayed as physical cards.
- Cards preserve the postcard visual system.
- The bottom mood input should be hidden in this mode.
- Removing a saved postcard should feel lightweight, not destructive or heavy.

---

## 4. Layout System

### App shell

The root shell is fixed to the full viewport.

```css
position: fixed;
inset: 0;
background-color: #F8F6EF;
font-family: 'Instrument Sans', sans-serif;
overflow: hidden;
```

Do not use a centered content wrapper for the main experience. The canvas must occupy the full screen.

### Header

The header is fixed and minimal.

```css
position: fixed;
top: 0;
left: 0;
right: 0;
height: 56px;
z-index: 40;
display: flex;
align-items: center;
justify-content: space-between;
padding: 0 44px;
background-color: #F8F6EF;
```

Header contents:

- Left: a small 7px black dot.
- Right: mode toggle group.

### Mode toggle

The mode toggle is deliberately tiny. It should feel like a small map control, not a big navigation bar.

```css
font-family: 'Instrument Sans', sans-serif;
font-size: 11px;
letter-spacing: 0.05em;
border-bottom: 1px solid transparent;
background: none;
border-top: none;
border-left: none;
border-right: none;
padding: 2px 0;
```

Active state:

```css
color: #222;
border-bottom-color: #222;
```

Inactive state:

```css
color: #C8C8C8;
border-bottom-color: transparent;
```

Saved badge:

```css
position: absolute;
top: -6px;
right: -12px;
font-size: 8px;
color: #FFF;
background-color: #111;
border-radius: 10px;
padding: 1px 5px;
letter-spacing: 0.02em;
line-height: 1.5;
```

### Canvas area

The canvas area fills the viewport under the header and behind the bottom input.

```css
position: fixed;
inset: 0;
overflow: hidden;
```

Each mode is absolutely positioned:

```css
position: absolute;
inset: 0;
```

Mode transitions fade in and out over `0.45s`.

### Bottom mood input bar

The input bar is fixed to the bottom. It is hidden in saved mode.

```css
position: fixed;
bottom: 0;
left: 0;
height: 80px;
display: flex;
align-items: center;
gap: 28px;
padding: 0 44px;
background-color: #F8F6EF;
z-index: 35;
```

When the detail panel is open, the input bar should stop before the panel.

```css
right: selectedBeach ? 380px : 0;
transition: right 0.45s cubic-bezier(0.22, 1, 0.36, 1);
```

Input style:

```css
flex: 1;
border: none;
border-bottom: 1px solid #D8D4CA;
outline: none;
padding: 6px 0;
font-size: 13px;
font-family: 'Instrument Sans', sans-serif;
color: #1A1A1A;
background-color: transparent;
letter-spacing: 0.01em;
transition: border-color 0.2s;
```

Input focus:

```css
border-bottom-color: #333;
```

Placeholder text:

```txt
what kind of beach day do you need?
```

Primary input action:

```txt
Find My Beach
```

Button style:

```css
background: none;
border: none;
border-bottom: 1px solid #333;
padding: 6px 0;
font-size: 11px;
font-family: 'Instrument Sans', sans-serif;
color: #333;
letter-spacing: 0.07em;
white-space: nowrap;
```

Hover behavior:

```css
opacity: 0.4;
```

Clear button:

```css
font-size: 10px;
color: #CCCCCC;
letter-spacing: 0.05em;
background: none;
border: none;
```

---

## 5. Type System

### Font family

Use Instrument Sans everywhere.

```css
font-family: 'Instrument Sans', sans-serif;
```

This is central to the visual identity. Do not mix with Inter, system sans, serif fonts, or decorative display fonts unless a very specific feature needs it.

### General type principles

- Use lowercase labels for beach names and interface microcopy.
- Use small uppercase labels for metadata sections.
- Use generous letter spacing on labels.
- Use negative letter spacing only for larger beach names.
- Keep line-height relaxed for poetic text.
- Avoid bulky headings.

### Type scale

| Use case | Size | Weight | Letter spacing | Notes |
|---|---:|---:|---:|---|
| Header nav | 11px | 500 | 0.05em | Small toggle links |
| Input text | 13px | 400 | 0.01em | Bottom mood input |
| Tiny labels | 8px to 10px | 400 or 500 | 0.04em to 0.10em | Metadata, stamp labels |
| Section labels | 11px | 500 | 0.08em | Uppercase panel labels |
| Tile label | 10px to 11px | 400 | -0.01em | Hover or caption labels |
| Body metadata | 11px to 13px | 400 | 0.01em to 0.02em | Conditions, facilities |
| Detail title | 20px | 400 or 500 | -0.02em | Beach detail panel title |
| Postcard title | 22px | 400 or 500 | -0.03em | Beach name on postcard |
| Match score | 28px | 400 or 500 | -0.04em | Large percentage |
| Postcard poem | 12px | 400 | 0.01em | Line-height 1.75 |

### Casing rules

Use lowercase for:

```txt
curl curl beach
active · sydney
what kind of beach day do you need?
save postcard
posted from
```

Use uppercase for small metadata labels:

```txt
MATCH
CONDITIONS
FACILITIES
BEST TIME
WHAT TO BRING
TEMP
WAVES
CROWD
NSW
```

### Text color system

| Role | Color |
|---|---|
| Primary text | `#111` |
| Strong text | `#222` |
| Body text | `#333` or `#444` |
| Secondary metadata | `#777` |
| Muted metadata | `#999` |
| Pale metadata | `#AAA` |
| Disabled or quiet UI | `#BBB`, `#C8C8C8`, `#CCCCCC` |
| Divider | `#F0F0F0` or `#D8D4CA` |

---

## 6. Colour System

### Base palette

The app is not pure white. It uses warm paper tones.

```css
--app-bg: #F8F6EF;
--paper: #FDFCF8;
--panel: #FFFFFF;
--soft-panel: #F8F8F6;
--line-soft: #F0F0F0;
--line-warm: #D8D4CA;
--text-primary: #111111;
--text-secondary: #444444;
--text-muted: #999999;
--text-pale: #BBBBBB;
--map-coastline: #A2A2A2;
--ocean: #ADD0EE;
```

### Background rules

Use `#F8F6EF` for the app, header, map background, input bar, and postcard paper fill.

Use `#FFFFFF` only for:

- right-side detail panel
- photo card surfaces
- saved postcard card surfaces where needed

Use `#FDFCF8` for tooltip or info bubbles.

### Vibe accent palette

Each beach vibe has one strong accent color. These colors are used for tile glow, selected borders, dots, stamps, and match emphasis.

```ts
const VIBE_COLORS = {
  solo: '#ADD0EE',
  social: '#032F98',
  calm: '#004724',
  adventure: '#FF3900',
  active: '#91C059',
  family: '#FEC200',
  artistic: '#ECBCEE',
};
```

Usage rules:

- Do not use accent colors as large background panels.
- Use accents as dots, glows, borders, stamps, or tiny highlights.
- Selected states can use the accent as a 2px border.
- Glow should use alpha versions like `${color}44`, `${color}55`, `${color}60`, or `${color}25`.
- Keep the overall UI warm and neutral. Accent colors should feel like signals, not branding blocks.

### Ocean and coastline

Map mode uses a soft water fill and a thin coastline stroke.

```css
ocean-fill: #ADD0EE;
ocean-opacity: 0.40;
coastline-stroke: #A2A2A2;
stroke-width: 1px adjusted by zoom;
```

The ocean must feel like a calm wash, not a saturated map polygon.

---

## 7. Spacing and Geometry

### Global spacing

Use generous whitespace. The design should never feel cramped.

Important fixed spacings:

```css
header-height: 56px;
page-horizontal-padding: 44px;
bottom-input-height: 80px;
input-gap: 28px;
detail-panel-width: 380px;
detail-panel-padding: 48px 40px 48px;
```

### Border radius

The app uses mixed radius depending on physical metaphor.

| Element | Radius |
|---|---:|
| Small map thumbnail | 8px |
| Mood tile | 10px |
| Photo inside postcard | 12px |
| Info bubble | 10px |
| Saved badge | 10px |
| Round dots | 50% |
| Postcard action buttons | 30px |
| Postcard stamp shape | SVG stamp edge, not CSS radius |

### Shadows

Shadows are subtle and mostly used to create paper or photo depth.

Default tile shadow:

```css
box-shadow: 0 1px 6px rgba(0,0,0,0.07);
```

Hover tile shadow:

```css
box-shadow: 0 3px 16px rgba(0,0,0,0.14);
```

Selected mood tile shadow:

```css
box-shadow: 0 6px 32px ${color}44, 0 2px 8px rgba(0,0,0,0.10);
```

Selected map tile shadow:

```css
box-shadow: 0 6px 32px ${color}55, 0 2px 8px rgba(0,0,0,0.12);
```

Info bubble shadow:

```css
box-shadow: 0 4px 20px rgba(0,0,0,0.10);
```

Postcard shadow:

```css
filter: drop-shadow(1px 4px 8px rgba(0,0,0,0.18));
```

---

## 8. Components

## 8.1 Beach tile, mood canvas

Mood canvas tile size:

```ts
const TILE_W = 160;
const TILE_H = 120;
const TILE_RADIUS = 10;
```

Tile visual:

```css
width: 160px;
height: 120px;
border-radius: 10px;
overflow: hidden;
border: 1px solid rgba(0,0,0,0.06);
box-shadow: 0 1px 6px rgba(0,0,0,0.07);
```

Hover:

```css
scale: 1.06;
border: 1.5px solid accentColor80;
box-shadow: 0 3px 16px rgba(0,0,0,0.14);
```

Selected:

```css
scale: 1.12;
border: 2px solid accentColor;
box-shadow: 0 6px 32px accentColor44, 0 2px 8px rgba(0,0,0,0.10);
```

Name label:

```css
position: absolute;
top: tileHeight + 6px;
left: 50%;
transform: translateX(-50%);
font-size: 11px;
color: #1A1A1A;
letter-spacing: -0.01em;
white-space: nowrap;
line-height: 1;
opacity: 0 by default;
```

Name label appears on hover or selection.

Hover condition bubble:

```css
font-size: 10px to 11px;
color: #555, #888, #AAA;
line-height: 2;
white-space: nowrap;
pointer-events: none;
```

Bubble content order:

```txt
84% match
20°C · 1.1m · moderate
32 min · 5 postcards today
```

### Mood canvas placement

The mood canvas is large and draggable.

```ts
const WORLD_W = 2900;
const WORLD_H = 2000;
```

Initial pan should center the beach cluster:

```ts
setPan({
  x: viewportWidth / 2 - WORLD_W * 0.50,
  y: viewportHeight / 2 - WORLD_H * 0.44,
});
```

Tile rotation should be deterministic, not random per render.

```ts
return ((seed % 13) - 6) * 0.42; // approx -2.5deg to +2.5deg
```

Do not make tiles rotate wildly. The rotation should feel like hand-placed photographs.

## 8.2 Beach tile, map canvas

Map tile size:

```ts
const S = 36;
const R = 8;
```

Default:

```css
width: 36px;
height: 36px;
border-radius: 8px;
border: 1px solid rgba(0,0,0,0.07);
box-shadow: 0 1px 6px rgba(0,0,0,0.08);
```

Hover:

```css
scale: 1.08;
border: 1.5px solid accentColor90;
box-shadow: 0 3px 16px rgba(0,0,0,0.16);
```

Selected:

```css
scale: 1.15;
border: 2px solid accentColor;
box-shadow: 0 6px 32px accentColor55, 0 2px 8px rgba(0,0,0,0.12);
```

Map popup:

```css
position: absolute;
left: 46px;
top: 0;
background-color: #FDFCF8;
border: 1px solid accentColor55;
border-radius: 10px;
padding: 10px 14px;
box-shadow: 0 4px 20px rgba(0,0,0,0.10);
min-width: 180px;
white-space: nowrap;
pointer-events: none;
```

Important behavior: the popup should counter-scale against map zoom so it stays readable.

```ts
const popupScale = 1 / zoom;
transform: `scale(${popupScale})`;
transformOrigin: 'top left';
```

## 8.3 Right-side detail panel

The detail panel slides from the right.

```css
position: fixed;
right: 0;
top: 0;
bottom: 0;
width: 380px;
background-color: #fff;
border-left: 1px solid #F0F0F0;
z-index: 60;
font-family: 'Instrument Sans', sans-serif;
overflow-y: auto;
padding: 48px 40px 48px;
display: flex;
flex-direction: column;
```

Motion:

```ts
initial: { x: '100%', opacity: 0 }
animate: { x: 0, opacity: 1 }
exit: { x: '100%', opacity: 0 }
transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
```

Header row:

- 28px accent dot with glow.
- Beach name at 20px.
- Metadata at 11px.

Accent dot:

```css
width: 28px;
height: 28px;
border-radius: 50%;
background-color: accentColor;
box-shadow: 0 0 12px 6px accentColor60, 0 0 28px 10px accentColor25;
```

Section structure:

Each section uses:

```css
margin-bottom: 28px;
padding-bottom: 20px;
border-bottom: 1px solid #F0F0F0;
```

Section label:

```css
font-size: 11px;
color: #999;
letter-spacing: 0.08em;
text-transform: uppercase;
margin-bottom: 8px to 12px;
```

Panel content order:

1. Close button.
2. Accent dot, beach name, vibe, distance.
3. Match score, only if mood input exists.
4. Conditions.
5. Facilities.
6. Best time.
7. What to bring.
8. Generate Postcard button.

Generate Postcard button:

```css
background-color: #000;
color: #fff;
border: none;
padding: 14px 24px;
font-size: 12px;
letter-spacing: 0.08em;
width: 100%;
cursor: pointer;
```

Hover:

```css
background-color: #111;
```

## 8.4 Postcard modal

The postcard modal is the emotional payoff of the experience. It should feel like a generated physical keepsake.

Backdrop:

```css
position: fixed;
inset: 0;
z-index: 100;
background-color: rgba(176, 214, 223, 0.70);
backdrop-filter: blur(12px);
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
gap: 20px;
```

Backdrop motion:

```ts
initial: { opacity: 0 }
animate: { opacity: 1 }
exit: { opacity: 0 }
transition: { duration: 0.3 }
```

Postcard card motion:

```ts
initial: { scale: 0.88, opacity: 0, y: 20 }
animate: { scale: 1, opacity: 1, y: 0 }
exit: { scale: 0.92, opacity: 0 }
transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
```

Postcard dimensions:

```ts
const CW = 453.839;
const CH = 530;
```

Postcard uses a stamp-shaped SVG, not a normal rectangle.

Postcard photo:

```css
position: absolute;
left: 34.84px;
top: 26px;
width: 383.839px;
height: 180px;
border-radius: 12px;
overflow: hidden;
object-fit: cover;
```

Tear line:

```css
position: absolute;
left: 16.84px;
top: 240px;
width: 420.001px;
stroke: #2A2A2A;
stroke-dasharray: 8.88 8.88;
stroke-width: 0.807069px;
```

Content area:

```css
position: absolute;
top: 254px;
left: 32px;
right: 32px;
bottom: 16px;
display: flex;
flex-direction: column;
```

Postcard hierarchy:

1. Small uppercase label: `Beach Moodboard Galaxy`
2. Beach name, lowercased.
3. Vibe and Sydney label.
4. Stamp badge with accent dot and `NSW`.
5. Divider.
6. Optional mood quote.
7. Poetic vibe text.
8. Conditions block.
9. Posted-from and date footer.

Postcard condition block:

```css
background-color: #F8F8F6;
padding: 9px 12px;
display: flex;
gap: 20px;
margin-bottom: 10px;
```

Postcard action buttons:

```css
display: flex;
align-items: center;
gap: 7px;
padding: 9px 22px;
background: #111;
border: none;
border-radius: 30px;
font-size: 11px;
letter-spacing: 0.04em;
color: #FFF;
```

Action button hover:

```ts
whileHover: { scale: 1.05, y: -2 }
whileTap: { scale: 0.97 }
transition: { duration: 0.17 }
```

---

## 9. Motion System

Motion should feel light and responsive. No bouncy cartoon easing. Use soft ease-out and subtle transforms.

### Global motion values

```ts
const EASE_SOFT = [0.22, 1, 0.36, 1];
const EASE_PHOTO = [0.25, 0.46, 0.45, 0.94];
```

### Timing rules

| Interaction | Duration | Easing |
|---|---:|---|
| Mode fade | 0.45s | ease-out |
| Bottom input enter | 0.30s | ease-out |
| Detail panel slide | 0.45s | `[0.22, 1, 0.36, 1]` |
| Postcard backdrop fade | 0.30s | ease-out |
| Postcard card enter | 0.40s | `[0.22, 1, 0.36, 1]` |
| Tile hover scale | 0.20s to 0.22s | easeOut |
| Tile label reveal | 0.16s | easeOut |
| Hover popup reveal | 0.14s to 0.15s | easeOut |
| Photo hover zoom | 0.30s | ease |
| Button hover/tap | 0.15s to 0.17s | easeOut |
| Drag hint fade | 0.60s | ease-out, delayed |

### Page mode transition

Use opacity only.

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.45 }}
/>
```

### Bottom input transition

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3 }}
/>
```

### Tile hover motion

Mood tile:

```ts
scale: selected ? 1.12 : hovered ? 1.06 : 1;
transition: { duration: 0.22, ease: 'easeOut' };
```

Map tile:

```ts
scale: selected ? 1.15 : hovered ? 1.08 : 1;
transition: { duration: 0.2, ease: 'easeOut' };
```

### Interaction hints

Show `drag to explore` on canvas entry, then fade it out after about 3.2 seconds.

```css
position: absolute;
bottom: 24px;
left: 50%;
transform: translateX(-50%);
font-size: 10px;
color: #BBBBBB;
letter-spacing: 0.06em;
pointer-events: none;
```

---

## 10. Interaction Rules

### Drag versus click

A drag should not accidentally select a beach.

Implementation rule:

- On pointer down, store starting x and y.
- If movement exceeds 4px, mark as active drag.
- While dragging, cursor becomes `grabbing`.
- On click, only select if drag was not active.

```ts
if (!drag.active && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
  drag.active = true;
}
```

### Canvas cursor

```css
cursor: isDragging ? 'grabbing' : 'grab';
```

Tile cursor:

```css
cursor: isDragging ? 'grabbing' : 'pointer';
```

### Map zoom

Wheel zoom should be centered on the cursor position.

Rules:

- Prevent default browser scroll.
- Use zoom factor `1.1` in and `1 / 1.1` out.
- Clamp zoom between `0.2` and `5.0`.
- Adjust pan so the world coordinate under cursor remains stable.

```ts
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5.0;
```

### Escape key behavior

Escape should close the topmost overlay first.

Priority:

1. If postcard is open, close postcard.
2. Else if detail panel is open, close detail panel.

```ts
if (e.key === 'Escape') {
  if (showPostcard) setShowPostcard(false);
  else if (selectedBeach) setSelectedBeach(null);
}
```

### Mood filtering

The mood input does not run a rigid quiz. It interprets loose words.

Matching behavior:

- If input is empty, show all beaches normally.
- If input matches vibe keywords, highlight that vibe cluster.
- Matching beaches stay at opacity `1`.
- Non-matching beaches fade to opacity `0.14`.

```ts
return hasInput ? (matched ? 1 : 0.14) : 1;
```

Match score behavior:

- If empty input, score is `0`.
- If matched, score starts around `55` and increases with hits.
- Cap at `98`.

```ts
Math.min(98, 55 + hits * 18);
```

Do not show fake precision as if it is scientific. It should feel like a playful mood match.

### Saving

Saved postcards are persisted locally for prototype behavior.

```ts
localStorage.setItem('bmg_saved', JSON.stringify(savedIds));
```

For backend integration, map this to the `beach_plans` or saved postcard entity while preserving the same interaction.

---

## 11. Data Model Expectations

The frontend currently expects beach data with this shape:

```ts
interface Beach {
  id: string;
  name: string;
  vibe: 'solo' | 'social' | 'calm' | 'adventure' | 'active' | 'family' | 'artistic';
  moodPos: { x: number; y: number };
  mapPos: { x: number; y: number };
  temp: number;
  waves: number;
  crowd: 'quiet' | 'moderate' | 'busy' | 'packed';
  distanceMin: number;
  postcards: number;
  facilities: string[];
  bestTime: string;
  whatToBring: string[];
}
```

Backend integration should preserve this frontend contract or adapt API responses into this shape before rendering.

Recommended backend adapter shape:

```ts
function normalizeBeach(apiBeach): Beach {
  return {
    id: apiBeach.id,
    name: apiBeach.name,
    vibe: apiBeach.vibe,
    moodPos: apiBeach.moodPos,
    mapPos: apiBeach.mapPos,
    temp: apiBeach.conditions?.temp ?? apiBeach.temp,
    waves: apiBeach.conditions?.wave_m ?? apiBeach.waves,
    crowd: apiBeach.crowd,
    distanceMin: apiBeach.distanceMin,
    postcards: apiBeach.postcards ?? 0,
    facilities: apiBeach.facilities ?? [],
    bestTime: apiBeach.bestTime ?? '',
    whatToBring: apiBeach.whatToBring ?? [],
  };
}
```

---

## 12. Copywriting Rules

The app voice should be poetic but not cheesy. It should feel like a calm recommendation from someone who knows Sydney beaches well.

### UI microcopy examples

Use:

```txt
what kind of beach day do you need?
Find My Beach
clear
drag to explore
Generate Postcard
save postcard
share
copied ✓
saved ✓
```

Avoid:

```txt
Search beaches
Submit
Filter results
Beach details
AI recommendation
Top matching destination
```

### Poetic vibe copy

Current vibe poems:

```ts
solo: 'a quiet place where the sea asks nothing of you.\nonly that you stay awhile.'
calm: 'somewhere between the horizon and here,\nthe mind finds its waterline.'
adventure: 'the kind of wave that reminds you\nwhat your body was made for.'
active: 'salt-stung and full of it -\nthis is what moving feels like.'
family: 'wide sand, shallow edges, and enough time\nto forget everything else.'
social: 'packed with possibility -\neveryone loose and warm and sunlit.'
artistic: 'light doing its most complex work,\nthe water a mirror it keeps rewriting.'
```

Note: keep these short. Two lines is the ideal length.

---

## 13. Responsive Behavior

The current Figma Make export is desktop-first. Preserve desktop quality first, then adapt.

### Desktop

- Header fixed at 56px.
- Bottom input fixed at 80px.
- Detail panel fixed at 380px.
- Canvas fills all remaining space.
- Map supports pan and zoom.
- Mood canvas supports pan.

### Tablet

Recommended changes:

- Keep full canvas.
- Detail panel can reduce to 340px.
- Header padding can reduce from 44px to 28px.
- Bottom input padding can reduce from 44px to 28px.

### Mobile

Recommended changes:

- Detail panel should become a bottom sheet instead of right panel.
- Bottom input should remain sticky at bottom.
- Header toggle should stay top-right but with smaller gap.
- Postcard should scale down to fit viewport width.
- Disable overly aggressive hover-only information. Use tap to reveal.

Mobile postcard scale:

```css
transform: scale(min(1, calc((100vw - 32px) / 453.839)));
transform-origin: center;
```

---

## 14. Implementation Dependencies

Preserve these dependencies because they directly support the current interaction model:

```json
{
  "motion": "12.23.24",
  "lucide-react": "0.487.0",
  "html-to-image": "^1.11.13",
  "vite": "6.3.5",
  "react": "18.3.1",
  "react-dom": "18.3.1"
}
```

Optional dependencies that are present but not core to this design:

- MUI
- Leaflet
- React Leaflet
- Recharts
- many Radix UI components

Do not introduce a heavy design library for the main canvas unless necessary. This design works because most elements are hand-composed and lightweight.

---

## 15. Build Rules for Codex

### Preserve

- Instrument Sans across the full app.
- Warm off-white background `#F8F6EF`.
- Three canvas states: mood, saved, map.
- Tiny top-right mode toggle.
- Bottom mood input bar.
- Right-side detail panel at 380px.
- Postcard modal with stamp/card feel.
- Vibe accent colors.
- Drag canvas interaction.
- Hover reveal interaction.
- Mood-based highlighting and fading.
- Soft motion durations and easing.

### Improve carefully

- Backend data integration.
- Real beach condition data.
- Real saved plans in database.
- Real generated postcard copy from backend or AI.
- Mobile layout.
- Accessibility labels and keyboard navigation.

### Avoid

- Generic map UI markers.
- Bright app-store style gradients.
- Large navigation bars.
- Cards with heavy rounded corners everywhere.
- Sans-serif body font mixed with mono.
- Overusing vibe colors.
- Turning the experience into a filter form.
- Making all pages separate routes if it breaks the continuous canvas feeling.
- Replacing the postcard with a generic modal card.

---

## 16. Suggested File Structure

```txt
src/
  app/
    App.tsx
    components/
      MapCanvas.tsx
      MoodCanvas.tsx
      SavedPostcards.tsx
      DetailPanel.tsx
      PostcardView.tsx
      BeachTile.tsx
      ModeToggle.tsx
      MoodInputBar.tsx
  data/
    beachData.ts
    vibeTokens.ts
  styles/
    theme.css
    fonts.css
    index.css
  lib/
    beachMatching.ts
    api.ts
    storage.ts
```

Keep visual primitives separate from data fetching. Codex should not mix API calls deeply into canvas rendering components.

---

## 17. Backend Integration Notes

The existing backend should feed the design, not reshape the design into a dashboard.

Recommended API flow:

1. `GET /beaches` or local seed returns beach metadata and stable positions.
2. `GET /conditions/map` returns live condition snapshots.
3. Frontend merges metadata with live conditions.
4. Mood input runs local matching first for instant feedback.
5. `POST /plans` sends mood phrase, selected beach, and condition snapshot.
6. Backend returns generated plan/postcard content.
7. `GET /plans` powers the saved view.
8. `DELETE /plans/:id` removes saved cards.

Frontend state should stay optimistic. The UI should respond instantly, then sync with backend.

---

## 18. Exact Setup Commands

From a clean machine or fresh clone:

```bash
# 1. Go into the project folder
cd BeachFigma

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev

# 4. Open the local URL printed in the terminal
# Usually: http://localhost:5173
```

If integrating this design into the existing full-stack project:

```bash
# Frontend
cd frontend
npm install
npm run dev
```

```bash
# Backend, if using FastAPI
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If using environment variables:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

```bash
# backend/.env
MONGODB_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_gemini_key
```

---

## 19. Codex Prompt

Use this prompt when asking Codex to implement or update the frontend:

```txt
You are working on my Sydney Beach Moodboard Galaxy full-stack app.

Read design.md carefully and treat it as the source of truth for visual design, layout, typography, motion, and interaction behavior.

Task:
Integrate the current backend data into the Figma-inspired frontend without breaking the visual language.

Core requirements:
1. Preserve the full-screen warm off-white canvas experience.
2. Preserve Instrument Sans everywhere.
3. Preserve the top-right mode toggle: mood, saved, map.
4. Preserve the bottom mood input bar except in saved mode.
5. Preserve the right-side 380px detail panel.
6. Preserve the postcard modal visual system.
7. Preserve drag-to-pan behavior on mood/map canvases.
8. Preserve hover reveal and selected beach states.
9. Use backend data for beach conditions and saved plans where available.
10. Keep local UI feedback instant, then sync with the backend.

Do not:
- Turn this into a generic map app.
- Replace image tiles with normal pins.
- Replace the postcard with a generic modal.
- Add a large navbar.
- Change the font away from Instrument Sans.
- Use bright gradients or saturated backgrounds.
- Overuse accent colors.

Implementation approach:
- Create a clean API adapter layer.
- Normalize backend beach data into the Beach interface described in design.md.
- Keep canvas components mostly visual and interaction-focused.
- Keep backend fetching outside low-level tile components.
- Make changes incrementally and explain files modified.

After implementing:
- Run npm run dev.
- Check mood, map, saved, detail panel, postcard generation, save, share, drag, hover, Escape close.
```

---

## 20. Final Design Principle

The beach recommendation should feel like the user is exploring a living coastal moodboard, not filling out a form.

Every visual decision should support that feeling.
