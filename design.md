# BeachPlease Design System and Implementation Guide

## 1. Product Feel

BeachPlease should feel like a quiet, tactile Sydney beach curator. The main product experience is visual, coastal, editorial, and mood-led. It should not feel like a travel booking site, generic beach directory, chatbot, or enterprise dashboard.

Core adjectives:

- airy
- coastal
- local
- editorial
- tactile
- calm
- slightly cheeky
- precise
- image-led
- premium but unflashy

The user-facing canvas should feel like a coastal image archive shuffling possible beach days into focus.

## 2. Current Experience Architecture

The current app includes these major surfaces:

- Cloud opening / landing intro
- Canvas-first explore experience
- Circular/scattered beach image canvas
- Beach tile hover/click interactions
- Right-side `BeachInfoTile`
- Mood input and Create Plan flow
- Generated plan result
- Saved plans shelf and detail pages
- Mapbox beach map
- Cluster stack browsing
- Auth/profile flows
- Admin dashboard at `/admin`

The main user-facing experience should stay quiet and visual. Admin is allowed to be denser and more operational.

## 3. Primary User Flow

1. User lands on the cloud opening screen.
2. User clicks `ENTER EXPERIENCE`.
3. Canvas experience appears.
4. Beach image tiles form a circular/scattered visual field.
5. User hovers a tile for beach name/basic details.
6. User clicks a tile to open `BeachInfoTile`.
7. User enters a mood or uses existing selected beach context.
8. User creates a beach plan.
9. Generated plan appears.
10. Authenticated user can save the plan.
11. Saved plans can be replayed, annotated, or deleted.
12. Map mode provides spatial coastal context.
13. Cluster mode provides stack-based beach browsing.

## 4. Visual System

### Background

Use warm off-white coastal backgrounds.

```css
background-color: #F8F6EF;
```

Avoid heavy gradients, bokeh orbs, decorative blobs, and generic SaaS section cards.

### Typography

Use Instrument Sans across the website.

```css
font-family: 'Instrument Sans', sans-serif;
```

Text should be regular or light by default. Use heavier weight sparingly for active nav, important headings, and admin metrics.

Avoid returning to Geist Mono as the main site font.

### Navigation

Navigation should be small and calm.

- Brand at top-left.
- Audio toggle near brand.
- Main nav at top-right.
- Active nav may be darker, but avoid heavy bold weight.
- Avoid underlines on top nav toggles unless specifically used as a tiny active affordance.

### Canvas

The canvas is the hero of the product.

- Full viewport presence.
- Circular/scattered beach image formation.
- Subtle 3D depth.
- Smooth, slow motion.
- No jitter.
- No aggressive casino-style spinning.
- Cards should retain a consistent visual orientation during rotation.
- Respect `prefers-reduced-motion`.

### Beach Tiles

Beach tiles should be image-led.

Default:

- image visible
- small radius
- no heavy outlines
- subtle shadow/depth
- consistent orientation

Hover:

- subtle lift/parallax
- reveal beach name/basic info
- do not dim or blur unrelated tiles unless a beach is selected

Selected:

- background tiles may blur/fade subtly
- info tile opens clearly
- selected state should feel intentional, not noisy

### BeachInfoTile

The beach info tile should be readable and minimal.

It may show:

- beach image
- name
- vibe/crowd/context
- live conditions
- facilities
- best time
- what to bring
- Create Plan / Generate Plan action

Keep action buttons consistent with the main black rounded button style.

### Create Plan

Create Plan is the primary creation action.

The form can collect:

- mood
- companion
- locality/coastal area
- activity
- food/cafe/bar preference
- extra notes/preferences

The UI should feel like directing a beach day, not filling a bureaucratic form.

## 5. Cluster Design

Cluster mode uses stacked/coverflow-style beach browsing.

Goals:

- beach stacks feel tactile and collectable
- cards can expand from image-only to fuller info
- carousel should have edge opacity/fade for offscreen cards
- avoid hard clipping without fade
- preserve the same quiet coastal language as the canvas

Cluster examples:

- swim
- surf
- relax
- walk
- solo
- partner

## 6. Map Design

Map mode uses Mapbox GL JS.

Guidelines:

- keep map styling minimal
- reduce default map clutter where possible
- highlight live beach condition markers
- keep tooltip text compact
- preserve selected beach context across modes where practical

Do not replace Mapbox with Leaflet or static SVG for production map mode.

## 7. Saved Plan Design

Saved plans should feel like a personal coastal archive.

- readable list/card layout
- plan title and beach visible quickly
- notes should be easy to edit
- replay should feel lightweight
- delete should ask for confirmation

Saved plans are functional records, not purely decorative postcards.

## 8. Admin Design

The latest main merge adds an admin dashboard. Admin is intentionally more operational than the public canvas experience.

Admin design goals:

- dense but readable
- clear sections for dashboard, users, plans, beaches, and activity
- visible metrics and small charts
- simple tables/lists
- obvious destructive actions with confirmation
- role changes must be clear
- beach create/update forms must make required fields obvious

Admin can use cards and panels more freely than the main experience because it is a tool surface. Still keep it visually restrained and consistent with the rest of the app.

## 9. Forms And Inputs

Use clean inputs with calm spacing.

- labels should be concise
- required fields should be marked clearly
- buttons should not shift on hover
- avoid text overflow inside buttons
- use centered primary actions where appropriate
- use side-by-side buttons only when both actions are equal and fit comfortably

## 10. Motion Policy

Allowed:

- slow canvas rotation
- subtle hover lift
- parallax tilt
- opacity fades
- card reveal
- panel slide/fade
- cluster coverflow movement
- plan reveal

Avoid:

- fast jittery spins
- random-feeling axis changes
- harsh scale jumps
- distracting background blur unless selected state requires it
- motion that continues for users with reduced motion enabled

Respect `prefers-reduced-motion`.

## 11. Latest Merge Design Impact

Added:

- admin dashboard visual system
- admin stat cards and charts
- admin data tables/forms
- activity log surface
- beach management form patterns
- suburb search-backed profile/locality input support

Removed / deprecated:

- old 4-stage funnel as the main visible experience
- old candidate selector mock UI
- old unused landing page component
- heavy directory/card-first beach browsing
- Geist Mono as the main font direction

## 12. Implementation Guardrails

- Keep the public app canvas-first.
- Keep admin visually separate as a utility surface.
- Do not make the main user journey feel like admin/data management.
- Do not add new UI libraries unless necessary.
- Preserve Mapbox.
- Preserve Create Plan and saved plan flows.
- Preserve auth/admin route protection.
- Never expose secrets in UI or docs.
