# 맡다. Design System — Skill

Use this skill when designing for **맡다. (Matda)** — the Korean perfume recommendation mobile app. Load this file first whenever a 맡다. design task begins.

## Required reading (in order)
1. **`README.md`** at project root — full context: product, voice, color, type, spacing, shadows, iconography. Read start to finish.
2. **`colors_and_type.css`** — the source of truth for tokens. Link this CSS into every artifact rather than hard-coding hex values.
3. **`preview/*.html`** — visual references for logotype, mascot, scent-tag pills, chips, buttons, perfume card, banner, chat bubbles. Skim these before composing novel surfaces so components land in-system.
4. **`ui_kits/matda-app/`** — working React components + `index.html` prototype. Copy components from here when building new app screens; do not re-write them.

## Non-negotiables
- **Korean copy only** for UI text. Voice is warm / conversational / `-요` register (never `-니다`). Questions, not commands. See README "CONTENT FUNDAMENTALS".
- **Logotype is `맡다.`** in serif 900 — `맡` green `#5A9E72`, `다` dark `#1F3A2A`, trailing period rendered as a filled green circle ("향 droplet"). Import `var(--font-serif)`. Never replace with sans, never drop the period, never monotone it. Reference `preview/logotype.html` and `preview/logo-lockups.html`.
- **Primary is pastel `#A8D5BA` (연두)**, not the eucalyptus `#5E9E82` still present in older `ui_kits/matda-app` components. When building new surfaces, use the pastel via `var(--primary)`; use `var(--primary-dark)` `#6FB88F` for selected chips and white-text-on-fill situations. The eucalyptus tone is legacy product UI — do not mix palettes in a single new surface.
- **Shadows are warm** (`rgba(26,46,36,…)`), never neutral black. No colored shadows except on primary CTA lifts.
- **Mascot is 향이** — the illustrated perfume-bottle chibi with radial-green body, spray-cap tuft, chibi eyes with sparkles, peach blush, and floating scent wisps. See `preview/mascot.html`. Never substitute a plain 🍃 emoji or a generic leaf.
- **Icons are Ionicons-style line icons** (outline idle → solid active). Lucide is an acceptable substitute. No custom icon font.
- **No gradients** other than: the pastel mint on primary CTAs (`#A8D5BA → #BCE0CA`), the perfume-card backdrop (`#F0F8F3 → #DCF1E2`), and the deep-navy event banner (`#1E2A44 → #3E6890`). Nowhere else.
- **Scent-tag pills** use the 18 dedicated `--scent-*-bg` / `--scent-*-fg` variables. Do not invent new pairs.

## Starting points by task

- **New mobile screen** → copy the closest `ScreenX.jsx` from `ui_kits/matda-app/`, wrap in `<PhoneFrame>`, link the design-system CSS, then refactor type/color to the evolved tokens.
- **Marketing / web surface** → none exists yet; follow VISUAL FOUNDATIONS from scratch. Ask the user what the surface is before inventing structure.
- **Presentation deck about the product** → `copy_starter_component deck_stage.js`, then use the logotype + mascot from `preview/` and the brand ink `#1A2E24` on `#F7FAF8` background.
- **Logo / brand-mark variation** → start from `preview/logo-lockups.html` and respect the serif-wordmark + green-droplet-period construction.

## What is NOT in this system
- **No marketing website, no docs site, no dashboard.** If the user asks for one, ask whether to invent structure or reference an external example.
- **No Figma file, no brand guide.** The system was reverse-engineered + iterated through designer direction; flag uncertainty to the user rather than guessing.
- **No Latin display face bundled.** The serif logotype falls back through `Nanum Myeongjo → Noto Serif KR → Playfair Display → Georgia`. If perfect reproducibility matters, ask the user to provide a licensed serif.
