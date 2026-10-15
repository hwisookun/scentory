# Scentory (맡다.) — Onboarding

> React Native (Expo) perfume recommendation app for Korean users. Codebase name: **Scentory**. Consumer-facing brand: **맡다.** (matda).

## What is this?

A prototype mobile app that helps Korean users discover perfumes through preference-based onboarding, scent tag exploration, a wishlist/collection system, a daily perfume diary, and an LLM chatbot ("향이", Claude Haiku 4.5). Screens read data through a repository layer (`src/lib/api/*`) that uses Supabase when its env vars are set and falls back to the mock data otherwise. The chatbot falls back to keyword matching when no API key is set.

**Status:** Prototype. Client state is persisted (Zustand + AsyncStorage). The Supabase schema, RLS policies and seed script exist, but no production catalog is loaded and server-side token verification is not implemented. No tests. See [PRD.md](PRD.md) §11–12 for open items and the roadmap.

---

## Quick Start

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | LTS (≥20) | |
| npx / npm | bundled | |
| Xcode | latest | iOS simulator |
| Android Studio | latest | Android emulator |
| Expo Go (optional) | latest | quick device preview |

### Setup

```bash
cd /Users/hwisoo/scentory
npm install
npx expo start            # dev server (QR for Expo Go / dev build)
npx expo run:ios          # iOS simulator (native build)
npx expo run:android      # Android emulator (native build)
npx expo start --web      # browser preview
npx tsc --noEmit          # type-check (no test runner configured)
```

### Verify it works

- [ ] Metro bundler starts without red errors
- [ ] Splash screen plays, then routes to Login (first launch)
- [ ] Guest login lands on Onboarding (5 steps), then Main (5 tabs)
- [ ] `npx tsc --noEmit` passes

---

## Architecture

### Top-level

```
App.tsx
  └── AppNavigator (src/navigation/AppNavigator.tsx)
        ├── SplashScreen (first render, calls onFinish)
        └── Root Stack (initialRoute decided once at mount)
              ├── Login         (when !isAuthenticated)
              ├── Onboarding    (when authed && !onboarding.isCompleted)
              └── Main (Bottom Tabs)
                    ├── 찾아보기  → ExploreStack
                    ├── 위시리스트 → WishlistStack
                    ├── 커뮤니티  → CommunityStack
                    ├── 향이      → ChatbotScreen
                    └── 마이페이지 → MyPageScreen
```

Tab→Stack flows share `PerfumeDetailScreen`. Auth/onboarding transitions use `navigation.reset()` because `initialRouteName` is only read once at mount.

### Tech Stack

| Layer | Library | Notes |
|-------|---------|-------|
| Runtime | Expo SDK 54, React Native 0.81, React 19 | |
| Navigation | @react-navigation v7 (stack + bottom-tabs) | custom tab bar in [src/navigation/CustomTabBar.tsx](src/navigation/CustomTabBar.tsx) |
| State | Zustand v5 — single store | [src/store/useAppStore.ts](src/store/useAppStore.ts) |
| Styling | StyleSheet + design tokens | [src/constants/theme.ts](src/constants/theme.ts) |
| Animation | react-native-reanimated v4, gesture-handler, worklets | |
| Native modules | expo-blur, expo-haptics, expo-image-picker, expo-linear-gradient, expo-location, expo-notifications, expo-font, expo-splash-screen | |
| Server state | TanStack Query v5 | hooks in [src/lib/api/hooks.ts](src/lib/api/hooks.ts) |
| Backend | @supabase/supabase-js | client in [src/lib/supabase.ts](src/lib/supabase.ts); returns `null` when env vars are empty, so the API layer serves mock data |
| Storage | @react-native-async-storage/async-storage | persists the Zustand store |
| Auth | expo-apple-authentication, expo-auth-session | Apple, Kakao, Naver in [src/lib/auth/](src/lib/auth/); Google is not implemented |
| LLM | Claude Haiku 4.5 via `fetch` | [src/lib/chatClient.ts](src/lib/chatClient.ts) |

### State management

Single Zustand store ([src/store/useAppStore.ts](src/store/useAppStore.ts)), persisted with `persist` + AsyncStorage (check the `persist` config at the bottom of the file for exactly which slices are kept):

- **Auth:** `user`, `isAuthenticated`, `isGuest`, `loginAsGuest`, `loginWithSocial`, `logout`
- **Onboarding:** `purpose`, `priceRange`, `preferredBrands`, `preferredScents`, `preferredNotes`, `isCompleted`
- **User data:** `wishlist`, `wishlistFolders`, `collections`, `brandSubscriptions`, `reviewCount`
- **UI:** `toast` (2200ms auto-hide), `notificationSettings`

### Data layer

- Screens never import mock data directly. They call the repository layer in [src/lib/api/](src/lib/api/) (`perfumes.ts`, `brands.ts`, `reviews.ts`, `spots.ts`) through the hooks in `hooks.ts`.
- If `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, the layer reads from Supabase; otherwise it returns [src/lib/mockData.ts](src/lib/mockData.ts) (`MOCK_BRANDS`, `MOCK_PERFUMES`, `MOCK_REVIEWS`, `MOCK_SPOTS`).
- Schema: [supabase/migrations/](supabase/migrations/) (`0001_init.sql` with RLS policies, `0002_constraints.sql`). Load the mock catalog into Supabase with `npm run seed` (idempotent, needs `SUPABASE_SERVICE_ROLE_KEY`).
- Perfume images use `https://picsum.photos/seed/{seed}/400/500` placeholders until real images are hosted.
- Chatbot: [src/screens/Chatbot/ChatbotScreen.tsx](src/screens/Chatbot/ChatbotScreen.tsx) calls Claude through [src/lib/chatClient.ts](src/lib/chatClient.ts) when `EXPO_PUBLIC_ANTHROPIC_API_KEY` is set, and falls back to keyword-matched `BOT_RESPONSES` otherwise.

### Domain types

Defined in [src/types/index.ts](src/types/index.ts):

- `Perfume` — `top_notes`, `middle_notes`, `base_notes`, `tags: ScentTag[]`, `concentration: Concentration`
- `ScentTag` — union of 18 Korean-named scent categories (플로럴, 시트러스, 우디 …)
- `Concentration` — `EDT | EDP | Parfum | EDC`
- `UserProfile.loginType` — `kakao | naver | google | guest | email`

### Design system

All tokens in [src/constants/theme.ts](src/constants/theme.ts). Always use these — never raw values.

- `COLORS` — brand palette (`primary: #5E9E82`), semantic, social-login colors
- `SPACING` — xs/sm/md/lg/xl/xxl (4–48 px scale)
- `BORDER_RADIUS`, `SHADOW` — sm/md/lg
- `SCENT_COLORS` / `SCENT_TEXT_COLORS` — per-tag bg + text for 18 scent tags
- Motion tokens in [src/constants/motion.ts](src/constants/motion.ts)

Reference HTML mockups (large, not bundled) live in [claude_design/](claude_design/).

---

## Key Files

| Path | Purpose |
|------|---------|
| [App.tsx](App.tsx) | Root: gesture handler, safe-area, status bar, navigator |
| [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx) | Splash → Auth → Onboarding → Main routing |
| [src/navigation/CustomTabBar.tsx](src/navigation/CustomTabBar.tsx) | Custom bottom tab bar |
| [src/store/useAppStore.ts](src/store/useAppStore.ts) | Single Zustand store |
| [src/types/index.ts](src/types/index.ts) | All domain types |
| [src/constants/theme.ts](src/constants/theme.ts) | Design tokens (use these, not raw values) |
| [src/lib/api/](src/lib/api/) | Repository layer + TanStack Query hooks (Supabase or mock) |
| [src/lib/mockData.ts](src/lib/mockData.ts) | Mock perfumes, brands, reviews, spots (fallback and seed source) |
| [src/lib/chatClient.ts](src/lib/chatClient.ts) | Claude chatbot client and persona prompt |
| [supabase/migrations/](supabase/migrations/) | Database schema and RLS policies |
| [PRD.md](PRD.md) | Product requirements, ADRs, roadmap, feedback history |
| [src/screens/](src/screens/) | One folder per screen (15 total) |
| [src/components/common/](src/components/common/) | Shared UI primitives (PerfumeCard, Toast, DragSheet, …) |
| [app.json](app.json) | Expo config |
| [CLAUDE.md](CLAUDE.md) | Project guidance for Claude Code |

### Screens

찾아보기 / 위시리스트 / 커뮤니티 / 향이 / 마이페이지 (5 tabs), plus PerfumeDetail (shared), Login, Onboarding, Splash, Search, Events, MoodQuiz, PerfumeDiary, ScentLibrary, ScentGacha.

---

## Common Developer Tasks

### Add a new screen

1. Create `src/screens/<Name>/<Name>Screen.tsx`, export a named React component.
2. Register it in the appropriate stack in [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx) (or root stack if it sits outside a tab).
3. Type the route params if you add params (extend the navigator's param list).
4. Use tokens from [src/constants/theme.ts](src/constants/theme.ts) for all styling.

### Add a new piece of app state

1. Extend the `AppState` interface in [src/store/useAppStore.ts](src/store/useAppStore.ts).
2. Add the initial value and the setter in the `create` body.
3. Consume via `const x = useAppStore((s) => s.x)`.

### Show a toast

`useAppStore.getState().showToast('메시지')` — auto-hides after 2200ms.

### Add a new scent tag color

Extend `SCENT_COLORS` and `SCENT_TEXT_COLORS` in [src/constants/theme.ts](src/constants/theme.ts), plus the `ScentTag` union in [src/types/index.ts](src/types/index.ts).

### Turn on Supabase

1. Copy `.env.example` to `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. Run the SQL in `supabase/migrations/` in the Supabase SQL Editor.
3. Fill `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run `npm run seed` (the service role key bypasses RLS; never ship it in the app).
4. Restart Metro. The API layer now reads from Supabase. To add a data source, extend the matching file in `src/lib/api/` and keep the same shapes (`Perfume`, `Brand`, `Review`, `ScentorySpot`) so screens don't change.

### Turn on the chatbot

Set `EXPO_PUBLIC_ANTHROPIC_API_KEY` in `.env`. Persona and tone rules are in the system prompt in [src/lib/chatClient.ts](src/lib/chatClient.ts). The key is bundled into the app, so move the call behind a backend proxy before any public build.

---

## Content & Brand Conventions

Important — these are enforced across copy and UI:

- **Logo:** `맡다.` — the period is intentional ("scent droplet"). Never omit or replace with ASCII variants.
- **Tone:** warm, conversational, `-요` endings. Never `-니다`. Questions as headers ("어떤 향수를 찾고 계세요?").
- **CTAs:** soft ("우선 들어갈래요", not "Skip"). Arrows use `→`, not `>`.
- **Casing:** all lowercase sentences (no Title Case).
- **Separator:** `·` (middle dot) — never `|` or `,`. e.g. "탑 노트 · 미들 노트".
- **Scent categories:** Korean transliteration (플로럴, 시트러스 …). 18 total.
- **Concentration:** English abbreviations only — EDT / EDP / Parfum / EDC.
- **Brand names:** original Roman script (Jo Malone, Tom Ford, Byredo).
- **Emojis:** only in the 향이 chatbot (🌿🍃). Rest of UI uses icons.

Tagline: **"나의 향, 나의 기억"**.

---

## Debugging Guide

### Common issues

- **White flash on auth/onboarding transition** — all root screens are always registered; transitions go through `navigation.reset()`. If you re-introduce conditional mounting, the flash returns. See comment in [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx#L122).
- **State not persisting after reload** — the store uses `persist` + AsyncStorage, so check that the slice is included in the `persist` config at the bottom of [src/store/useAppStore.ts](src/store/useAppStore.ts). To start clean during development, clear the app's storage or log out (logout resets user slices).
- **Reanimated worklet errors** — ensure `react-native-gesture-handler` is imported at the top of [App.tsx](App.tsx) (already is) and that you're using a dev build, not Expo Go, if you add new native modules.
- **Image not loading** — perfume images go through `picsum.photos`. Network-dependent during dev.
- **`.tmp.*` files in `src/`** — stray editor temp files (e.g., `AppNavigator.tsx.tmp.*`). Safe to delete; they're not imported. Two of them are currently committed and should be removed and added to `.gitignore`.

### Type-checking

```bash
npx tsc --noEmit
```

No test runner is configured. UI verification is manual via simulator/device.

---

## Audience-Specific Notes

### Junior developers
- Read [src/store/useAppStore.ts](src/store/useAppStore.ts) first — it's the entire app state surface.
- Then [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx) for the screen graph.
- Use tokens from `theme.ts` — never hardcode colors or spacing.
- Follow the content/brand conventions above when writing any user-facing copy.

### Senior engineers / tech leads
- Both integration points already exist behind stable shapes: the repository layer (`src/lib/api/*`, Supabase with mock fallback) and the chatbot client (`src/lib/chatClient.ts`). What still blocks productionization: a real perfume catalog and image hosting, server-side verification of Apple/Kakao/Naver tokens, and a backend proxy so no secret (`EXPO_PUBLIC_ANTHROPIC_API_KEY`, `EXPO_PUBLIC_NAVER_CLIENT_SECRET`) ships in the bundle.
- Client state is persisted locally, but nothing is synced to the server yet. Syncing wishlist and diary per user is the first real work after auth.
- No CI/tests. If formalizing, start with type-check + a smoke test on the navigator's initial-route decision.
- Large `claude_design/` asset bundle (≈25 MB of fonts + a 13 MB HTML reference) is checked in — consider moving out of the runtime tree if shipping.

### Contractors / scoped contributors
- Stay within a screen folder + shared components. Avoid changes to the navigator, store shape, or theme tokens without coordinating.
- New screens should plug into an existing stack rather than introducing top-level routes.
