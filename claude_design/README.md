# 맡다. (Matda) Design System

**맡다.** — literally *"to smell"* in Korean — is a perfume recommendation mobile app for Korean users. The brand name plays on the double meaning *"맡다 (smell)"* / *"맡다 (to take on / to be in charge of)"* — positioning the app as a trusted companion that "takes charge of" your scent discovery journey. The tagline is **"나의 향, 나의 기억"** ("My scent, my memory").

The product was previously code-named **Scentory**; `맡다.` (slug: `matda`) is the current consumer-facing name.

## Products covered by this design system

Currently a single surface:

1. **맡다. Mobile app** — React Native (Expo) app. 5-tab bottom nav: 찾아보기 (Explore) / 위시리스트 (Wishlist) / 커뮤니티 (Community) / 향이 (Chatbot) / 마이페이지 (MyPage). Flow: Splash → Login → Onboarding (5-step preference survey) → Main tabs, with a shared PerfumeDetail screen accessible from most tabs.

A marketing website, docs site, or dashboard does **not** exist in the source and is therefore not covered here.

## Sources

- **GitHub repo:** `hwisookun/test` (branch `main`). Imported files for this design system: `src/constants/theme.ts`, all `src/screens/**`, `src/components/common/**`, `src/types/index.ts`, `src/navigation/AppNavigator.tsx`. Reference only — they are not copied into this project.
- **No Figma, no slide decks, no marketing assets, no brand guide** were attached. The design system evolved through iterative direction from the designer: the palette moved from the codebase's muted eucalyptus (`#5E9E82`) to a brighter pastel 연두, scent-tag colors were re-pigmented for emotional richness, and the mascot 향이 was developed from a simple emoji-glyph sketch into a fully illustrated perfume-bottle chibi.

## Index — files in this project

Root
- `README.md` — this file.
- `colors_and_type.css` — CSS variables for the complete color + type system, plus semantic classes (`.h1`, `.body`, `.caption`, …).
- `SKILL.md` — Claude Skill entry point.

Folders
- `fonts/` — **Pretendard** OTF files in all 9 weights (Thin → Black), uploaded by the designer. The React Native app uses the platform `System` font; **Pretendard is the chosen web-equivalent** for the UI type and ships with this design system. Wired up in `colors_and_type.css` via `@font-face`. The **serif logotype** pulls from a web-safe Korean serif stack (Nanum Myeongjo → Noto Serif KR → Playfair Display → Georgia) — declared via `--font-serif`; not bundled.
- `assets/` — logo lockups, mascot (향이 — "Hyang-i"), and brand marks rebuilt from code + direction (the Expo-default icon placeholders in the repo are not real brand assets and are excluded).
- `preview/` — cards that populate the Design System tab.
- `ui_kits/matda-app/` — hi-fi click-through recreation of the mobile app with modular JSX components.

## CONTENT FUNDAMENTALS

All UI copy is **Korean**. Tone is **warm, soft, conversational, curious**, addressing the user with the polite informal *-요* ending — never the stiff `-니다` register. It feels like a friendly sommelier, not a salesperson.

### Voice principles
- **"We" and "you" are gentle.** The product speaks *to* the user ("~해보세요", "~어떠세요?") rather than *at* them ("~하세요", "~하십시오").
- **Questions over commands.** Screens are framed as open invitations: "어떤 향수를 찾고 계세요?" ("What kind of perfume are you looking for?"), "나는 무슨 향을 좋아할까?" ("What scent would I like?"), "이런 향수는 어떠세요?" ("How about these perfumes?").
- **First-person interior monologue.** Headers sometimes speak *as* the user, not to them: "나는 무슨 향을 좋아할까?" — reinforcing that the app is a tool for self-discovery.
- **Softened CTAs.** The guest-mode button reads "우선 들어갈래요" ("I'll just go in for now"), not "Skip" or "Continue as guest". Empty states encourage ("첫 번째 한줄평을 남겨보세요!" — "Leave the first review!") rather than flag absence.
- **Emoji only on the chatbot.** 🌿 / 🍃 appear in the `향이` chatbot's greeting bubble as a nostalgic callback — elsewhere the brand uses the illustrated 향이 mascot instead. Icons, not emoji, do the lifting in product UI.
- **Korean loanwords for perfume taxonomy.** 18 scent families use transliterated Korean (플로럴, 시트러스, 우디, 머스크, 프레시, 오리엔탈, 아쿠아틱, 구르망, 스파이시, 허벌, 파우더리, 레더, 스모키, 그린, 푸제르, 시프레, 발사믹, 아이리스). Concentrations use the English abbreviations (EDT / EDP / Parfum / EDC). Brands stay in their original romanization (Jo Malone, Tom Ford, Byredo …).

### Casing / punctuation
- **Logotype** is `맡다.` — always with the trailing period. The period is **the 향 droplet**, rendered as a filled green circle; never drop it, never substitute an ASCII `.`
- **Sentence case** for everything else (not Title Case).
- Korean body copy uses a **middle dot (·)** as the soft separator — e.g. "선택한 가격대의 브랜드예요 · 복수 선택 가능". Never `|`, never `,` for this purpose.
- Arrow CTAs end with **`→`** (full-width or half-width ASCII) rather than `>` — e.g. "지금 보러가기 →".
- Section sub-labels are short parentheticals or subtitles: "오늘의 향수" / "에디터 추천", "이런 향수는 어떠세요?" / "취향 기반 추천".

### Vibe summary
Calm · plant-forward · personal · slightly whimsical · editorial-cute. More like a quiet boutique with a knowledgeable friend behind the counter than a marketplace. Think: morning light through a eucalyptus leaf, with a chubby little perfume-bottle spirit on the shelf.

## VISUAL FOUNDATIONS

### Color
- **Primary:** `#A8D5BA` — a **bright pastel 연두** (soft spring-green). Cute, light, emotional — the hero color. Used on the app icon gradient, hero backgrounds, and primary buttons (as a soft top-stop in a gradient with `#BCE0CA`).
- **Primary-dark:** `#6FB88F` — mid-green, for text-on-white, 1.5 px borders, and selected-chip fills where the pastel would wash out.
- **Primary-ink:** `#3E7E62` (also `#1F3A2A` for the deepest wordmark ink). The darkest green — reserved for small uppercase labels, active icon strokes, and the second character `다` of the logotype.
- **Primary-light:** `#D4EDE0` and **secondary:** `#F0F8F3` — ultra-soft mint surfaces for selected rows, the chatbot avatar backdrop, and hover tints.
- **Accent coral:** pastel `#FFB3A1` (idle heart outlines in warm areas) and saturated `#FF8A70` (filled wishlist heart). These are the only warm colors in the system — used sparingly and only for "personal love / wishlist" semantics.
- **Background:** `#F7FAF8` — a barely-green off-white. Never pure white for page backgrounds; pure white (`#FFFFFF`) is reserved for cards, the tab bar, and input surfaces so they read as slightly lifted.
- **Text ink:** `#1A2E24` — a very dark green-black. Never pure black.
- **Neutrals** are a **green-tinted gray scale** (`#F4F6F5 → #3E4E48`), not neutral gray. Subtle but important — it keeps every surface in the same botanical family.
- **18 scent-tag colors.** Each tag (플로럴, 시트러스, 우디…) has a dedicated **pale desaturated background + saturated matching-hue text** pair (e.g. 플로럴 is `#FBDCE8` bg / `#C94277` text, 우디 is `#EADFCF` bg / `#6E4B2E` text). The palette is intentionally warmer / dustier than a typical bright tag set so scents feel *emotional* rather than *categorical*. These are the only pure-hue colors in the system and they appear exclusively inside tag pills.
- **Semantic:** success `#43A047`, warning `#FB8C00`, error `#E53935`, star (rating) `#FFB800`. Social: Kakao `#FEE500`, Naver `#03C75A`.

### Type
- **UI family:** **Pretendard** (shipped in `fonts/`, all 9 weights). The React Native source renders with the platform `System` font — iOS SF Pro / Apple SD Gothic Neo, Android Roboto / Noto Sans KR — which Pretendard matches closely in cadence and Korean glyph width.
- **Logotype family:** **serif** (Nanum Myeongjo / Noto Serif KR / Playfair Display / Georgia, `--font-serif`). The brand mark `맡다.` uses a **heavy serif at weight 900** with `−1.5 px` tracking — this is the sole place serifs appear in the system, giving the wordmark an editorial perfume-house feel against an otherwise geometric Pretendard UI.
- **Weights used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black). Section titles use 800 extrabold; body is 400.
- **Scale (mobile px):** caption 11 · small 12 · bodySm 13 · body 14 · bodyLg 15 · h4 16 · h3 18 · h2 20 · h1 26 · display 32. Line height ratio 1.5 (tighter 1.25–1.3 at display sizes).
- **Logotype treatment:** `맡다.` in serif 900, `맡` in `#5A9E72`, `다` in `#1F3A2A`, the trailing period rendered as a **filled `#5A9E72` circle** (the "향 droplet") with a `0 2px 0 #3F7A53` drop. Never pure text, never monotone.
- **UPPERCASE + 0.5–1px tracking** for tiny labels: brand name on cards, note-group labels ("탑 노트", "미들 노트", "베이스 노트"), and the mascot's identifying `HYANG-I` subline.

### Spacing & radii
- **Spacing scale** (multiples of 4): `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48`. `md` (16) is the default everything-to-everything gap.
- **Border radii:** `sm 8 · md 12 · lg 16 · xl 24 · full 9999`. Capsules (full) on chips + buttons; `xl` (24) on hero cards, banners, and modals; `lg` (16) on standard cards and CTA buttons; perfume cards use a slightly rounder `22 px`.
- **Touch targets:** minimum 44 px — enforced on every interactive element via `TOUCH_TARGET_MIN`.

### Shadows
Three elevation tiers, all using the text-ink color (`#1A2E24`) for warmth:
- **sm** — subtle lift on inputs, chips, sort pills. `0 1px 4px rgba(26,46,36,0.06)`.
- **md** — cards, CTA buttons, tab bar. `0 4px 8px rgba(26,46,36,0.10)`.
- **lg** — modals, tooltips. `0 8px 16px rgba(26,46,36,0.15)`.

Primary buttons layer an additional **colored shadow** (`0 6px 14px rgba(111,184,143,.35)`) to give the pastel fill lift. Coral CTAs layer `rgba(255,138,112,.3)`. Outside those two, shadows are always the warm near-black above — no colored shadows, no inner shadows.

### Backgrounds & imagery
- Page background is the `#F7FAF8` tint; **no patterns, no textures, no illustrations** fill the page.
- Hero/perfume imagery uses **real product photography** (the app points at `https://picsum.photos/seed/{seed}/400/500` placeholders in mock data, which in prod becomes perfume bottle shots on clean backgrounds). Images are always `object-fit: cover` inside a fixed-height container with `#F0F8F3` as the fallback; perfume cards layer a pastel mint→cream gradient (`#F0F8F3 → #DCF1E2`) with a ghosted bottle silhouette behind the photo area.
- **Event banners** are a signature editorial surface: a **deep navy/plum base** (`#1E2A44 → #3E6890` gradient) with a left-edge darkening scrim for text legibility, a **soft overlay-mix grain** (radial-dot pattern at 15 % opacity, `mix-blend-mode: overlay`), a **frosted badge** (`rgba(255,255,255,0.14)` + `backdrop-filter: blur(10px)` + `1 px white border`), a **ghosted perfume bottle silhouette** pushed to the right and rotated `-6°`, and a **pastel-peach pill CTA** (`#FFDAC9` fill, `#1E2A44` text, `26 px` circular arrow token) pinned bottom-right. This is the **only** dark-surface treatment in the product — do not replicate the deep-navy gradient elsewhere.
- **Mascot illustrations.** The mascot **향이 (Hyang-i)** is an illustrated SVG character drawn in a **Sanrio-inspired flat style**: a soft mint-white egg body (`#F2FBF5`) with a thick `3.6 px` dark-green outline (`#1F3A2A`), a single green leaf perched on top (`#7DBE91` with matching outline), two simple solid-dot eyes, soft peach blush circles (`#FFB3A1`), and a tiny rounded smile. Flat colors, no gradients, no sparkle/iris detail — the personality comes from extreme simplicity. The mascot bobs gently (±1.5° rotation, ~4 px Y) at a 3.4 s loop. See `preview/mascot.html`, `preview/logo-lockups.html`, and `assets/hyangi-avatar.svg`.

### Motion
- **Spring for navigation transitions.** iOS-style horizontal slide at `{stiffness: 260, damping: 28, mass: 1}`. Fades for auth-flow switches at `280ms open / 200ms close`.
- **Spring for splash entry:** opacity + scale 0.85→1 with `speed:10, bounciness:6`, then 1 s hold, then 400 ms fade-out.
- **Mascot bob:** 3.2 s `ease-in-out infinite`, translateY `0 → −6 px` and rotate `−1° ↔ +1°`. Scent sparkles around the mascot float on a 4 s loop with staggered delays (`0 / 0.8 / 1.6 / 2.4 s`).
- **No other bouncy / overshooting UI animations.** No scroll-triggered reveals. No Lottie.
- **Banner carousel auto-advances every 3.5 s.** Dots widen to 18 px for the active slide.

### Hover / press states
- **Press:** `activeOpacity` between **0.7–0.9** on most buttons; the `PressableScale` helper shrinks interactive cards to `scale(0.97)` and heart buttons to `scale(0.85)` on press.
- **Hover:** not applicable in the RN codebase. For **web artifacts**, we standardize on: opacity `0.85` on links, a 1-tick darker tint on filled buttons (move gradient stop to `--primary-dark: #6FB88F`), and `transform: translateY(-2px)` + `shadow-lg` on perfume cards.
- **Disabled:** replace primary fill with `gray300` (`#D4DDD8`); keep near-white text (`#9AACA4`). No reduced opacity; no grayed-out text.

### Selected vs idle chip states
A signature pattern: **idle chips are white with a 1.5 px border in `border` color and a tiny `sm` shadow**. **Selected chips are filled with `primary-dark` (`#6FB88F`)**, border matches the fill, text goes to white, weight bumps from semibold to bold. (The pastel `#A8D5BA` primary is too light to carry white text, so selected states step down to primary-dark.) This pattern repeats across onboarding, sort pills, brand chips, and filter rails.

### Borders
- Border color: `#E0EBE5` — a ghosted green. Used at 1 px for input fields / tab bar top edge, 1.5 px for chip outlines.
- **Focus ring:** `0 0 0 3px rgba(168,213,186,0.25)` — a 3 px soft pastel halo outside a solid `#A8D5BA` border. Never a hard black border, never blue.

### Cards
- White (`#FFFFFF`) fill, radius **xl (24) for hero/feature cards**, **22 px for perfume cards**, or **lg (16) for standard list cards**, `SHADOW.sm` or `SHADOW.md`, optional `1 px rgba(111,184,143,0.10)` hairline border, no heavy outline. Review cards use `md` (12) radius + `sm` shadow.

### Transparency & blur
- `backdrop-filter: blur(10px)` appears on the event banner's frosted badge; nowhere else in the product.
- Overlays (modals): `rgba(46,64,54,0.38)` for the backdrop and `rgba(46,64,54,0.58)` for deeper modals — **tinted with the text-ink color**, not neutral black.

### Layout rules
- Fixed header per tab: logo (찾아보기) or screen title (나머지) on the left, a single icon button on the right.
- Fixed bottom tab bar: white, 62 px + safe-area padding, `SHADOW.md`, icons 22 px.
- Horizontal-scroll rails for "today's picks" and brands; grid (2 cols) for category/wishlist results.
- Section rhythm: `padding: md (16)` on sections, `marginBottom: md` between sections, section headers are `h3 (18) extrabold`.

### Iconography
See the **ICONOGRAPHY** section below.

## ICONOGRAPHY

The app uses **Ionicons** (via `@expo/vector-icons`) as its sole icon system. Icons are **monochromatic line icons** by default (`*-outline` variant) and **flip to solid** when a tab / state is active.

**Observed usage:**
- `search / search-outline` (찾아보기 tab, search bar)
- `heart / heart-outline` (위시리스트 tab, wishlist toggles — filled `#FF8A70` coral when active, outlined `#B0BDB8` when idle)
- `chatbubbles / chatbubbles-outline` (커뮤니티 tab)
- `leaf / leaf-outline` (향이 chatbot tab — reinforces the botanical motif; historical callback to the mascot's earliest 🍃 sketch)
- `person / person-outline` (마이페이지 tab)
- `notifications-outline`, `arrow-back`, `arrow-forward`, `chevron-forward`, `close`, `star`, `pencil`, `add`, `add-circle-outline`, `checkmark-circle`, `flower`, `flower-outline`, `log-out-outline`, `send`

**Standard size:** 22 px in top bars, 18 px in CTAs, 16 px on buttons, 14 px on small chips, 12 px inline. **Color inherits `currentColor`** — typically `COLORS.text` for idle, `COLORS.primary-dark` (`#6FB88F`) for active, `COLORS.accent-ink` (`#FF8A70`) for favorited.

**Brand marks on social login buttons:** Kakao and Naver login buttons use tiny SVG-shape brand glyphs (speech bubble for Kakao, a stylized `N` for Naver) rather than full SDK logo SVGs — intentional choice to avoid dependencies.

**No custom icon font, no SVG sprite, no PNG icon set** ships in the repo. For web artifacts, **Ionicons via CDN** (`https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.esm.js`) or the `@expo/vector-icons` package locally; alternatively, **Lucide** is a close visual match (same stroke weight, same rounded line terminators) and can substitute without flagging.

---
*This design system was reverse-engineered from the `hwisookun/test` codebase and iterated with the designer's direction on palette, mascot, and wordmark. No Figma or brand guide was provided — please attach any that exist to refine further.*
