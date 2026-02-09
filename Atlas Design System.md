Atlas Design System

Version: 1.0
Status: Living System
Philosophy: Cinematic Minimalism + Adaptive Tokens
Scope: Mobile-first (Expo React Native)

1. Design Principles

Content First
UI frames experience. It never competes with it.

Motion as Meaning
Animation communicates hierarchy and state.

Emotional Pacing
Quiet, intentional interaction over speed.

System Over Style
Tokens enable redesign without rewrites.

Accessibility by Default
Contrast, clarity, and legibility come first.

Adaptability
The system must support change without fragmentation.

2. System Architecture

The design system is layered:

Raw Tokens → Semantic Tokens → Components → Screens

Raw tokens = primitive values

Semantic tokens = intent-driven meaning

Components = reusable UI building blocks

Screens = layout compositions

No component references raw values directly.

3. Token Philosophy

Tokens define intent, not appearance.

Bad:

color: #000000


Good:

color: color.text.primary


All components consume semantic tokens.
Themes only modify token mappings.

4. Color System
4.1 Raw Color Tokens

color.black = #000000

color.white = #FFFFFF

color.gray.900 = #111111

color.gray.700 = #333333

color.gray.500 = #888888

color.gray.300 = #CCCCCC

color.blue.muted = #4A6FFF

color.green.muted = #4CAF50

color.purple.soft = #7C5CFF

4.2 Semantic Color Tokens

color.background.primary

color.background.secondary

color.text.primary

color.text.secondary

color.text.inverted

color.accent.primary

color.status.completed

color.status.planned

color.status.wishlist

color.border.subtle

color.overlay.blur

Default mapping:

background.primary → black

background.secondary → gray.900

text.primary → white

text.secondary → gray.500

accent.primary → blue.muted

status.completed → green.muted

4.3 Theme Layer

Themes override semantic tokens only.

Supported themes:

Dark (default cinematic)

Light editorial

High contrast accessibility

Seasonal/brand variants

Components remain unchanged.

5. Typography System

Typography is the main visual anchor.

5.1 Font Families

Primary: Editorial grotesk style sans-serif

Fallback: System UI sans-serif

Mono: System monospace

5.2 Type Scale

Hero: 72

Display Large: 48

Heading Large: 32

Heading Medium: 24

Body: 16

Body Small: 14

Caption: 12

5.3 Semantic Typography

text.hero

text.sectionTitle

text.body

text.caption

text.label

Components reference semantic types only.

5.4 Typography Rules

Maximum 3 font weights per screen

Tight letter spacing for editorial feel

Display text anchors layout

Avoid decorative fonts

6. Spacing System

8-point grid.

space.1 = 8

space.2 = 16

space.3 = 24

space.4 = 32

space.5 = 48

space.6 = 64

Semantic spacing:

component padding

screen margins

card gaps

section rhythm

Whitespace is intentional.

7. Radius System

Small: 8

Medium: 16

Large: 24

Hero: 32

Used for:

cards

modals

hero images

overlays

8. Elevation System

Depth hierarchy:

elevation.none

elevation.card

elevation.overlay

elevation.modal

Each defines:

shadow softness

opacity

blur

stacking order

Elevation expresses focus, not decoration.

9. Motion System

Motion defines emotional tone.

9.1 Duration Tokens

fast: 150ms

medium: 300ms

slow: 600ms

cinematic: 1200ms

9.2 Easing Tokens

standard ease

soft spring

heavy spring

cinematic glide

9.3 Motion Principles

no harsh snapping

motion must explain hierarchy

slow transitions for immersion

animation should feel weighted

Reduced motion mode must be supported.

10. Component System

Core components:

GoalCard

Carousel

TimelineItem

MapPin

FloatingActionButton

BlurOverlay

ModalSheet

ArchiveGridItem

HeaderOverlay

ImageHero

All components consume semantic tokens.

Rules:

no hardcoded spacing

no hardcoded color

motion tokens only

responsive layout

accessible touch targets

11. Layout System
11.1 Screen Zones

Hero Zone (dominant visual)

Content Zone (scroll body)

Overlay Zone (floating UI)

Navigation Layer

Each zone has defined spacing rhythm.

11.2 Grid Philosophy

asymmetrical editorial layouts

negative space as structure

typography defines alignment

No rigid 12-column web grid.

12. Accessibility System

WCAG AA contrast minimum

scalable typography

reduced motion option

gesture alternatives

color-blind safe indicators

minimum 44px touch targets

Accessibility overrides live at token level.

13. Adaptability Rules

When extending the system:

Add semantic tokens first

Never bypass tokens

Extend instead of patch

Preserve motion language

Maintain emotional pacing

System evolves without visual drift.

14. Dark / Light Strategy

Light mode is not inversion.

It is a reinterpretation that preserves mood.

Tokens remap intentionally:

background

text contrast

accent emphasis

Visual identity remains cinematic.

15. Future Extension Points

The system supports:

brand reskins

seasonal themes

premium visual packs

accessibility modes

experimental motion themes

Without rewriting components.

16. Governance

Changes require:

token-level addition

version increment

migration notes

visual regression testing

Design system is maintained as a product.

17. Definition of Success

The system succeeds if:

redesigns do not break components

features scale without chaos

UI remains emotionally consistent

developers ship faster

visual identity survives years

Atlas should feel cohesive across time.