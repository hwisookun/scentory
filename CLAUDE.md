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

**Scentory** is a React Native (Expo) perfume recommendation app targeting Korean users. The app is currently in prototype stage with all data coming from `src/lib/mockData.ts`. Supabase (`@supabase/supabase-js`) is installed but not yet wired up.

### Navigation flow

`AppNavigator` controls the entire navigation tree:

1. **SplashScreen** renders first; calls `onFinish()` when done
2. Root stack decides initial route based on Zustand store state:
   - `!isAuthenticated` → `Login`
   - `isAuthenticated && !onboarding.isCompleted` → `Onboarding`
   - else → `Main` (bottom tab navigator)
3. Screen transitions after auth/onboarding use `navigation.reset()` — the navigator's `initialRouteName` is set only once at mount.

**Bottom tabs (Main):** 찾아보기 (Explore) / 위시리스트 (Wishlist) / 커뮤니티 (Community) / 향이 (Chatbot) / 마이페이지 (MyPage)

Each of the first three tabs wraps its content in a nested Stack navigator sharing `PerfumeDetailScreen`.

### State management

Single Zustand store at `src/store/useAppStore.ts` holds all app state:
- Auth: `user`, `isAuthenticated`, `isGuest`
- Onboarding: multi-step preferences (purpose, price range, brands, scents, notes)
- User data: `wishlist`, `collections`, `brandSubscriptions`
- UI: `toast` (auto-hides after 2200 ms), `notificationSettings`

State is persisted to `AsyncStorage` via Zustand's `persist` middleware (store name `matda-app-store`); `toast` and action functions are excluded from the persisted slice.

### Design system

All design tokens live in `src/constants/theme.ts`:
- `COLORS` — brand palette (`primary: #A8D5BA` pastel green, `primaryDark: #6FB88F`), semantic colors, social login colors
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

Currently uses hardcoded keyword-matched responses (`BOT_RESPONSES` in `ChatbotScreen.tsx`). No real AI API is connected. This is the planned integration point for Claude or another LLM.

### Mock data

`src/lib/mockData.ts` exports `MOCK_BRANDS`, `MOCK_PERFUMES`, `MOCK_REVIEWS`, and `MOCK_SPOTS`. Perfume images use `https://picsum.photos/seed/{seed}/400/500`. When connecting Supabase, these exports will be replaced by API calls.
