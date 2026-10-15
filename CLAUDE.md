# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server (Expo Go or dev build)
npx expo run:android    # Run on Android emulator/device
npx expo run:ios        # Run on iOS simulator/device
npx expo start --web    # Run in browser
```

TypeScript type-checking only (no test runner configured):
```bash
npx tsc --noEmit
```

## Architecture

**Scentory** (consumer brand: **맡다.**) is a React Native (Expo SDK 54) perfume recommendation app targeting Korean users. The app is in prototype stage. Screens read data through a repository layer in `src/lib/api/*` (TanStack Query hooks in `hooks.ts`). When `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, it reads from Supabase (schema in `supabase/migrations/`, seed with `npm run seed`); otherwise it returns the mock data in `src/lib/mockData.ts`. Server-side token verification and a production perfume catalog are not done yet (see `PRD.md` §11–12).

### Navigation flow

`AppNavigator` controls the entire navigation tree:

1. **SplashScreen** renders first; calls `onFinish()` when done
2. Root stack decides initial route based on Zustand store state:
   - `!isAuthenticated` → `Login`
   - `isAuthenticated && !onboarding.isCompleted` → `Onboarding`
   - else → `Main` (bottom tab navigator)
3. Screen transitions after auth/onboarding use `navigation.reset()` — the navigator's `initialRouteName` is set only once at mount.

**Bottom tabs (Main):** 찾아보기 (Explore) / 위시리스트 (Wishlist) / 커뮤니티 (Community) / 향이 (Chatbot) / 마이페이지 (MyPage)

Each of the first three tabs wraps its content in a nested Stack navigator sharing `PerfumeDetailScreen`. The Explore stack also hosts `Events`, `Search`, `MoodQuiz`, `PerfumeDiary`, `ScentLibrary` and `ScentGacha`.

### State management

Single Zustand store at `src/store/useAppStore.ts` holds all app state:
- Auth: `user`, `isAuthenticated`, `isGuest`
- Onboarding: multi-step preferences (purpose, price range, brands, scents, notes)
- User data: `wishlist`, `collections`, `brandSubscriptions`
- UI: `toast` (auto-hides after 2200 ms), `notificationSettings`

State is persisted with Zustand `persist` + AsyncStorage (see the `persist` config at the bottom of the store for exactly which slices are kept). Toast and other transient UI state are not persisted.

### Design system

All design tokens live in `src/constants/theme.ts`:
- `COLORS` — brand palette (`primary: #A8D5BA` pastel 연두, `primaryDark: #6FB88F`, `primaryInk: #3E7E62`), semantic colors, social login colors. The visual source of truth is `claude_design/` (README + `colors_and_type.css`); keep `theme.ts` in sync with it.
- `SPACING` — xs/sm/md/lg/xl/xxl (4–48 px scale)
- `BORDER_RADIUS` / `SHADOW` — sm/md/lg variants
- `SCENT_COLORS` / `SCENT_TEXT_COLORS` — per-tag background and text colors for the 18 scent tags

Always use these constants instead of raw values.

### Domain types

Defined in `src/types/index.ts`. Key types:
- `Perfume` — includes `top_notes`, `middle_notes`, `base_notes`, `tags: ScentTag[]`, `concentration: Concentration`
- `ScentTag` — union of 18 Korean-named scent categories
- `UserProfile` — `loginType: 'kakao' | 'naver' | 'google' | 'guest' | 'email'`

### Chatbot ("향이" tab)

`ChatbotScreen.tsx` calls Claude Haiku 4.5 through `src/lib/chatClient.ts` (plain `fetch` to the Anthropic Messages API; the official SDK breaks Metro bundling, see `PRD.md` ADR-02). The persona and brand-voice rules live in the system prompt there. If `EXPO_PUBLIC_ANTHROPIC_API_KEY` is empty, it falls back to the keyword-matched `BOT_RESPONSES`. The key is bundled into the client, so this is prototype-only; move the call behind a backend proxy before release.

### Mock data

`src/lib/mockData.ts` exports `MOCK_BRANDS`, `MOCK_PERFUMES`, `MOCK_REVIEWS`, and `MOCK_SPOTS`. Perfume images use `https://picsum.photos/seed/{seed}/400/500`. These exports are the fallback when the Supabase env vars are empty, and the source data for `npm run seed`. Screens should not import them directly; go through `src/lib/api/*`.
