# Design Brief

## Direction

SupportAI — AI-powered customer support SaaS with a calm, focused dark-mode interface for support teams.

## Tone

Dark editorial with ocean-blue depth and warm amber highlights — professional, grounded, and quietly confident.

## Differentiation

Warm amber accent against deep ocean blue creates an unmistakable "beacon in the deep" palette that avoids generic SaaS blue.

## Color Palette

| Token      | OKLCH           | Role                           |
| ---------- | --------------- | ------------------------------ |
| background | 0.145 0.014 255 | deep ocean dark (dark primary) |
| foreground | 0.95 0.01 255   | near-white text                |
| card       | 0.18 0.014 255  | elevated surface               |
| primary    | 0.45 0.16 255   | deep ocean blue                |
| accent     | 0.75 0.17 55    | warm amber highlight           |
| muted      | 0.22 0.02 255   | secondary surface              |

## Typography

- Display: Space Grotesk — headings, hero text, brand moments
- Body: Satoshi — UI labels, paragraphs, dense text
- Mono: Geist Mono — code, data, timestamps
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Layered surfaces with subtle warm-tinted shadows; cards float slightly above content with `shadow-subtle`, modals and dropdowns use `shadow-elevated`.

## Structural Zones

| Zone    | Background                 | Border      | Notes                        |
| ------- | -------------------------- | ----------- | ---------------------------- |
| Header  | `bg-card` + `border-b`     | `border`    | sticky, compact height       |
| Sidebar | `bg-sidebar` + `border-r`  | `border`    | collapsible on mobile        |
| Content | `bg-background`            | —           | alternate `bg-muted/30` rows |
| Footer  | `bg-muted/40` + `border-t` | `border`    | minimal, legal links only    |

## Spacing & Rhythm

Balanced density: section gaps `py-12 lg:py-20`, card padding `p-6`, micro-spacing `gap-2` for inline elements. Rhythm through alternating muted backgrounds.

## Component Patterns

- Buttons: `rounded-md`, primary uses `bg-primary`, ghost uses `bg-secondary`; hover lifts with `shadow-subtle`
- Cards: `rounded-lg`, `bg-card`, `border`, `shadow-subtle`; hover adds `shadow-elevated`
- Badges: `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium`; color maps to status (success/warning/destructive)

## Motion

- Entrance: `animate-slide-up` on main content, staggered 0.1s for children
- Hover: scale `1.02` + `shadow-elevated` on cards, `0.2s ease-out`
- Decorative: subtle pulse on active indicators, no ambient floating elements

## Constraints

- No raw color literals in components
- No arbitrary Tailwind color classes
- No full-page gradients
- Dark mode is primary; light mode is secondary

## Signature Detail

The amber accent dot on active navigation items and status badges — a warm beacon that guides attention without shouting.
