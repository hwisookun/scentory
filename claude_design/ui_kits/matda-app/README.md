# 맡다. Mobile App — UI Kit

Hi-fi click-through recreation of the `맡다.` mobile app (React Native / Expo source in `hwisookun/test`).

Open `index.html` for an interactive prototype. The kit is structured as React components loaded via Babel; each component is small, cosmetic-only, and composable.

## Components
- `PhoneFrame.jsx` — 390×844 device frame with status bar + home indicator (matches iPhone 14 Pro viewport the app targets)
- `TabBar.jsx` — bottom tab bar (찾아보기 · 위시리스트 · 커뮤니티 · 향이 · 마이페이지)
- `TopBar.jsx` — per-screen header with logotype or title + right-side icon
- `Chip.jsx` — selectable pill (+ "니치" sub-tag variant)
- `PerfumeCard.jsx` — product tile with scent tags, price, rating, heart
- `BrandChip.jsx` — brand button with 니치/니치·명품 badge
- `EventBanner.jsx` — dark-gradient horizontal-scroll promo banner
- `ChatBubble.jsx` + `HyangiAvatar.jsx` — chatbot turn + mascot
- `ScreenExplore.jsx` · `ScreenWishlist.jsx` · `ScreenCommunity.jsx` · `ScreenChatbot.jsx` · `ScreenMyPage.jsx` · `ScreenPerfumeDetail.jsx` · `ScreenLogin.jsx` · `ScreenOnboarding.jsx`
- `data.js` — mock perfumes, brands, scent-tag colors

## Coverage
- Login screen (guest + social buttons)
- Onboarding step 3 of 5 (price range survey — representative of the whole 5-step flow)
- Explore (home) with banner carousel, today's picks rail, editor's picks grid
- Perfume detail with notes pyramid and review list
- Wishlist tab with grid of favorited perfumes
- Chatbot (향이) with mock conversation
- MyPage profile summary

## Not covered / omitted
- Search + category filter sheets — not wired in the interactive version
- Full 5-step onboarding — only step 3 is shown (the rest share the same shell)
- Writing reviews, composing community posts — these are read-only in this kit
