# 맡다. (Scentory) — Product Requirements Document

**Status:** Prototype · v0.1
**Last updated:** 2026-05-21
**Owner:** ovadoz0806@gmail.com

> 이 PRD는 살아 있는 문서입니다. 코드와 결정이 바뀌면 같이 갱신해 주세요. 새로운 의사결정은 우선 PRD에 반영한 뒤 코드로 옮기는 것을 권장합니다.

---

## 1. 제품 개요

### 1.1 한 줄 정의
**나의 향, 나의 기억** — 한국어 사용자가 자기 취향에 맞는 향수를 발견하고, 매일의 향을 기록·공유하는 모바일 앱.

### 1.2 미션
향수를 처음 접하는 사용자에게 "내 향"을 찾는 과정을 부담 없이 만든다. 마니아에게는 자신의 컬렉션을 정리·기억하고 새로운 향을 발견하는 일상 도구가 된다.

### 1.3 현재 상태
- **단계**: 프로토타입(클라이언트 전 화면 동작, 데이터는 mock + Supabase 스카폴딩 완료, 인증·결제·CRM 미연동)
- **플랫폼**: iOS + Android(React Native / Expo SDK 54)
- **데이터**: 18개 향 계열 분류, 60여 개 mock 향수, 20개 mock 브랜드
- **출시 일정**: 베타 1단계는 백엔드(Phase 2) 완료 후 결정

---

## 2. 타겟 사용자

### 2.1 Primary Persona — "취향 탐색자"
- 20–30대 한국 거주
- 향수 입문 1~2년 차, 1~3병 보유
- 백화점 시향에서 헤매기 쉬움. "내가 뭘 좋아하는지" 정확히 모름
- 일상에 작은 의식(루틴)을 좋아함. SNS·뉴스레터 구독 활발
- 가격대 민감 — 10만 원대 부담 없는 선에서 시작

### 2.2 Secondary Persona — "향 컬렉터"
- 향수 마니아, 5병 이상 보유
- 신상·니치 브랜드 신제품을 빠르게 알고 싶어함
- 자신의 컬렉션을 정리하고 자랑하고 싶어함
- 가격대 무관, 30만 원 이상 니치도 사용

### 2.3 지역·언어
- **출시 시점**: 한국(KR), 한국어 단일
- **향후**: 일본·동남아 확장 시 i18n 도입(현재는 모든 문구 하드코딩)

---

## 3. 브랜드 아이덴티티

### 3.1 네이밍
- **코드명**: Scentory (영문)
- **소비자 노출명**: **맡다.** (한글 + 마침표 필수)
- **태그라인**: "나의 향, 나의 기억"
- 마침표(`.`)는 '향 방울' 아이덴티티 요소. ASCII period로 대체 금지.

### 3.2 톤 & 보이스
| 항목 | 규칙 |
|---|---|
| 어미 | `-요` (절대 `-니다` / `-야` 사용 안 함) |
| 인칭 | 1·2인칭 대화체 |
| 헤더 | 질문형 선호: "어떤 향수를 찾고 계세요?" |
| CTA | 부드럽게: "우선 들어갈래요", "오늘의 향 뽑기" |
| 이모지 | 챗봇(향이)에서만 🌿🍃. 그 외 UI는 아이콘 |
| 구분자 | `·` (중점) — `,` `|` 금지 |
| 화살표 | `→` — `>` 금지 |
| 향 계열 표기 | 한글 외래어 (플로럴, 시트러스, …) — 영문 금지 |
| 농도 표기 | 영문 약어 (EDT / EDP / Parfum / EDC) |
| 브랜드명 표기 | 원어 로마자 (Jo Malone, Tom Ford, Byredo, …) |

### 3.3 마스코트 — 향이 (Hyangi)
- Sanrio 스타일 납작 계란형 + 머리 위 잎사귀
- 챗봇 탭 아이덴티티 + 로그인 화면 히어로
- MoodQuiz 결과 화면의 추천 사유 말풍선 화자
- 부드러운 bob + sparkle 루프 애니메이션

### 3.4 분위기
조용한 부티크 + 지식 있는 친구. Calm · plant-forward · personal · slightly whimsical · editorial-cute.

---

## 4. 핵심 가치 제안

### 4.1 차별화
1. **취향 발견 도구로서의 친근함** — 노트·계열·브랜드 지식이 없어도 들어와 답하기만 하면 추천이 나옴
2. **일상 향 기록** — 향수 다이어리 + 캘린더 동기화. "오늘 어떤 향을 뿌렸는지" 자연스럽게 남는 흐름
3. **AI 챗봇 "향이"** — 키워드 검색 대신 자연어 상담 (Claude 기반)
4. **부드러운 게임화** — 매일 한 번 향 가챠, 18개 향 계열 도감
5. **한국어 네이티브** — 카카오·네이버 로그인 1순위, 한국 향수 가격대/브랜드 컨텍스트

### 4.2 경쟁 환경
- **글로벌**: Fragrantica(웹/커뮤니티 중심), Parfumo, Notino 앱
- **국내**: 무신사 향수관, 컬리·올리브영 코너 — 모두 커머스 중심, 발견·기록 부족
- **포지셔닝**: "발견 + 일상 기록"을 한 곳에 모은 한국어 네이티브 앱

---

## 5. 기능 범위

### 5.1 v0.1 (현재 완성) — 클라이언트 전 화면 동작

| 화면 | 핵심 기능 | 상태 |
|---|---|---|
| Splash | 2.6s 시퀀스 (Hyangi fall-in + 로고 cascade) | ✅ |
| Login | Apple · Kakao · Naver 3종 소셜 + 게스트 | ✅ UI 완료, OAuth는 dev build에서 실동작 |
| Onboarding (5단계) | 목적 · 가격대 · 브랜드 · 향 계열 · 노트 선호 | ✅ |
| Explore (메인) | 검색 · 배너 · 액션 4종 · 오늘의 향수 · 추천 · 브랜드 | ✅ |
| Search | 카테고리 + 향 계열 필터 + 텍스트 검색 | ✅ |
| PerfumeDetail | 노트 3단(탑·미들·베이스) + 리뷰 + 유사 향수 | ✅ |
| Wishlist | 폴더 분류 + 정렬 + 추천 | ✅ |
| Community | 한줄평 피드 + 작성 + 사진 첨부 | ✅ |
| MyPage | 통계 + 취향 분석 + 닉네임 변경(30일) + 알림 설정 | ✅ |
| Chatbot 향이 | Claude Haiku 4.5 + 페르소나 + 사용자 컨텍스트 | ✅ API 키 입력 시 실동작 |
| MoodQuiz | 5문항 + 매칭 추천 + 추천 사유 말풍선 + 노트 펼침 | ✅ |
| ScentLibrary (향 도감) | 18개 향 계열 그리드 + 보유 향수 분류 | ✅ |
| ScentGacha (오늘의 향) | 일 1회 랜덤 + 시간대별 스토리 + 14일 히스토리 | ✅ |
| PerfumeDiary | 캘린더 그리드 + 별점 + 5줄 일기 + 시스템 캘린더 동기화 | ✅ dev build 필요 |
| Events | 이벤트 리스트 + 상세 (상세 페이지 미완) | 🟡 부분 |

### 5.2 v1.0 (출시 전 필수)

| 항목 | 우선순위 |
|---|---|
| 실제 인증·세션 (Supabase Auth, OAuth 토큰 서버 검증) | P0 |
| 실제 향수 카탈로그 (Mock → 큐레이션 데이터) | P0 |
| 자체 이미지 호스팅 (picsum → Supabase Storage) | P0 |
| 푸시 알림 (오늘의 향 추천, 브랜드 신상) | P1 |
| 에러 리포팅 (Sentry) + 기본 애널리틱스 | P1 |
| 이용약관 / 개인정보처리방침 페이지 | P0 |
| 앱 아이콘 · 스플래시 자산 확정 | P0 |
| EAS Build + App Store / Play Store 자산 | P0 |

### 5.3 v1.x (출시 후 우선순위)
- 브랜드 구독 + 신상 입고 알림 (현재 placeholder)
- 향수 리뷰 평점 평균 · 신뢰도 표시
- 친구·팔로우 시스템
- 컬렉션 공개/비공개 + 공유 링크
- AR 시향(병 형태 시각화)

### 5.4 출시 범위에서 제외
- 다국어 (i18n) — 한국어 단일
- 실제 구매(커머스) — 외부 링크만, 인앱 결제 없음
- 웹 버전 — 모바일 단독
- 데스크탑 — N/A

---

## 6. 핵심 사용자 흐름

### 6.1 첫 실행 (Cold start)
```
Splash (2.6s) → Login (Apple/Kakao/Naver/게스트)
  → Onboarding 5단계 (목적·가격대·브랜드·계열·노트)
  → Main → Explore (오늘의 향수 + 추천)
```
**KPI**: Onboarding 완료율(목표 80%+)

### 6.2 반복 사용 (Habit loop)
```
앱 열기 → Explore → 검색·발견·하트 → 위시리스트 정리
       → 다이어리 탭으로 오늘 향 기록 → 캘린더 동기화
       → 챗봇 향이에게 질문
```
**KPI**: D7 retention, 주간 다이어리 작성 일수

### 6.3 발견 루프 (Discovery)
```
ScentGacha 일 1회 알림 → 오늘의 향 뽑기 → 자세히 보기
  → 위시리스트 담기 → ScentLibrary에서 18계열 진행도 갱신
```
**KPI**: 일 가챠 참여율, 18계열 도감 완성도

### 6.4 의사결정 (Decision)
```
사용자가 향수 고르고 싶음 → MoodQuiz 5문항
  → 향이가 추천 사유 말풍선과 함께 1개 추천
  → 노트 펼쳐 자세히 → 위시리스트 or 자세히 보기
```
**KPI**: 추천 → 위시리스트 전환율

---

## 7. 데이터 모델

### 7.1 도메인 엔티티

| 엔티티 | 핵심 필드 | 상태 |
|---|---|---|
| `users` | id · nickname · email · loginType · pref_scents · pref_notes · nickname_changed_at | Zustand persist (in-memory) |
| `brands` | id · name · priceRange · isNiche · country · official_url | Supabase 스키마 적용 가능 |
| `perfumes` | id · brand_id · concentration · top/middle/base_notes · tags · price_krw · image_url · rating | 동일 |
| `reviews` | id · user_id · perfume_id · rating · comment · images · created_at | 동일 + RLS |
| `wishlistFolders` | id · name · perfumeIds · createdAt | persist |
| `perfumeDiary` | dateKey · perfumeId · rating · note · calendarEventId | persist |
| `gacha` | lastPullDate · history (최대 30일) | persist |
| `brandSubscriptions` | brand_id · push · email | persist (미연동) |
| `spots` | id · name · address · lat/lng · type · is_verified | mock 3개 |

### 7.2 18개 향 계열 (불변)
플로럴 · 시트러스 · 우디 · 머스크 · 프레시 · 오리엔탈 · 아쿠아틱 · 구르망 · 스파이시 · 허벌 · 파우더리 · 레더 · 스모키 · 그린 · 푸제르 · 시프레 · 발사믹 · 아이리스

각 계열: 한글명 + 배경색(`SCENT_COLORS`) + 텍스트 색(`SCENT_TEXT_COLORS`) + 설명(`SCENT_TAG_INFO`).

---

## 8. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 클라이언트 | React Native + Expo SDK 54 + Hermes + New Architecture | 빠른 반복, 한 코드베이스로 iOS/Android |
| UI 상태 | Zustand 5 + `persist` middleware + AsyncStorage | 단일 store, 보일러플레이트 최소 |
| 서버 상태 | TanStack Query v5 | 캐시·재시도·재검증 통일 |
| 백엔드 | Supabase (Postgres + RLS + Storage + Auth) | RLS로 권한 표현, 인증 통합 |
| 인증 | Apple Native (expo-apple-authentication) + Kakao/Naver OAuth (expo-auth-session) | Apple HIG 준수, 한국 사용자 1순위 채널 |
| LLM | Claude Haiku 4.5 (Anthropic API · fetch 직접 호출) | 한국어 품질·비용 균형 |
| 캘린더 | expo-calendar (네이티브 iOS/Android Calendar) | 향수 다이어리 자체 캘린더 동기화 |
| 애니메이션 | react-native-reanimated v4 + worklets | 60fps UI 스레드 애니메이션 |
| 디자인 시스템 | 자체 토큰(`src/constants/theme.ts`) | 한국 향수 브랜드 톤에 맞춘 팔레트 |

### 8.1 디자인 시스템 핵심
- 색상: pastel mint primary (`#A8D5BA` → `#6FB88F` → `#3E7E62`) + coral accent
- 폰트: Pretendard (한글) · System fallback
- 버튼 높이: lg=48 / md=44 / sm=36
- 모서리: sm=8 / md=12 / lg=16 / xl=24 / full=9999

---

## 9. 비기능 요구사항

### 9.1 성능
- 콜드 스타트 < 3s (현재 splash 2.6s + 하이드레이션)
- Explore 메인 진입 < 500ms (캐시된 상태)
- Chatbot 응답 첫 토큰 < 1.5s (Haiku 4.5 + prompt cache)

### 9.2 접근성
- 모든 인터랙티브 요소 최소 44pt 터치 영역
- 다이내믹 타입(시스템 글자 크기) 대응 (현재 부분)
- VoiceOver 레이블 (현재 미흡 — Phase 5 대응)

### 9.3 보안
- 클라이언트 키(`EXPO_PUBLIC_*`)는 번들 노출 전제 → 진짜 비밀은 백엔드 프록시 필수
- Supabase RLS: `reviews`는 `auth.uid() = user_id` 강제, `brands/perfumes/spots`은 public read
- 닉네임: 한글 2~10자 / 영문·숫자 2~16자, 이모지·특수문자 불허, 30일 1회 변경
- Apple identityToken / Kakao access_token / Naver access_token → 백엔드에서 발급자 공개키로 검증 후 자체 세션 발급 (현재 미구현)

### 9.4 데이터 보존
- 위시리스트 · 폴더 · 다이어리 · 가챠 히스토리 · 온보딩 답변: AsyncStorage 영구 보존
- 로그아웃 시 모든 사용자 슬라이스 초기화
- 토스트·UI 임시 상태: 비저장

---

## 10. 성공 지표 (KPI)

### 10.1 Activation
- D0 가입자 중 Onboarding 5단계 완료율: **목표 80%+**
- D0 첫 위시리스트 추가율: **목표 40%+**

### 10.2 Engagement
- D1 / D7 / D30 retention
- WAU / DAU 비율 (목표 50%+)
- 주간 다이어리 작성 평균 일수
- 가챠 일 참여율 (목표 30%+)

### 10.3 Discovery
- 사용자 1인당 평균 위시리스트 수
- ScentLibrary 18계열 평균 완성도
- MoodQuiz 진입 → 추천 → 위시리스트 전환율

### 10.4 Content Health
- 한줄평 작성률 (위시 추가 대비)
- 신고 비율 (target < 1%)

---

## 11. 알려진 위험 / 미해결 항목

### 11.1 비즈니스
- **수익 모델 미확정** — 어필리에이트(쿠팡·올영·무신사 링크) vs 브랜드 광고 vs 구독제. 현재 가설은 어필리에이트 중심.
- **콘텐츠 라이선스** — 향수 데이터·이미지를 어디서 가져올지 미정. Fragrantica는 비공식 API, 브랜드 공식 자료는 협력 필요.
- **법적 검토** — 한국 화장품법, 개인정보보호법(닉네임·이메일 수집), 14세 미만 가입 제한.

### 11.2 기술
- 클라이언트 OAuth 토큰을 서버 검증 없이 그대로 사용 — 출시 전 백엔드 필수
- `EXPO_PUBLIC_NAVER_CLIENT_SECRET` 번들 노출 — 백엔드 프록시로 이전 필요
- 챗봇 비용 — Haiku 4.5 + cache로 절감했으나 사용량 폭증 시 한도 필요 (rate limit, 일일 무료 quota)
- 캘린더 동기화 — Android 일부 OEM에서 권한 다이얼로그 비일관

### 11.3 UX
- Explore 메인 1198 줄 — 컴포넌트 분할 필요 (Phase 5)
- 다이어리 30일 회고 / 월간 리포트 같은 가치 회수 루프 부재
- 챗봇이 향수 외 주제로 빠지면 어떻게 돌릴지 페르소나에만 의존

---

## 12. 로드맵

| Phase | 범위 | 예상 기간 |
|---|---|---|
| **0 — 현재** | 클라이언트 v0.1 + Supabase 스카폴딩 + 인증 라이브러리 | 완료 |
| **1** | env 채우기 + 스키마 적용 + 시드 + 첫 dev build 동작 검증 | 1–2일 |
| **2** | Supabase Auth · 세션 · RLS 확장 · 토큰 서버 검증 | 3–5일 |
| **3** | 실제 카탈로그 + 이미지 + 시드 파이프라인 | 1–2주 (콘텐츠 의존) |
| **4** | 푸시 · 애널리틱스 · Sentry · 법적 페이지 · 아이콘 자산 | 1주 |
| **5** | 테스트(Jest+RNTL) · 접근성 · 성능 · 화면 컴포넌트 분할 | 3–5일 |
| **6** | EAS Build · App Store / Play Store 자산 · 리뷰 제출 | 1주 + Apple 리뷰 큐 |

---

## 13. 비기능적 결정 기록 (ADR-lite)

### ADR-01: Zustand + AsyncStorage 채택
- **결정**: Redux 대신 Zustand, MMKV 대신 AsyncStorage
- **이유**: 보일러플레이트·번들 크기·익숙도 균형. MMKV는 native module 추가 비용 대비 현재 데이터 규모에 과한 선택.

### ADR-02: Anthropic SDK 대신 fetch 직접 호출
- **결정**: `@anthropic-ai/sdk` 제거, fetch + cache_control 직접 구성
- **이유**: SDK가 `node:fs`를 import해 Metro 번들 실패. fetch는 RN에서 안정적이고, 캐싱 기능은 JSON 필드 한 줄로 가능.

### ADR-03: Repository layer + react-query 채택
- **결정**: 화면이 `MOCK_PERFUMES`를 직접 import하지 않고 `src/lib/api/*` + `usePerfumes()`를 호출
- **이유**: env 유무에 따라 mock ↔ Supabase 자연 전환. 화면 코드는 분기 모름.

### ADR-04: Apple Sign-In 네이티브 컴포넌트 사용
- **결정**: 커스텀 버튼 대신 `AppleAuthentication.AppleAuthenticationButton`
- **이유**: Apple HIG 준수 + App Store 리뷰 기준 통과 보장. 커스텀 디자인 가능성과 trade-off.

### ADR-05: 닉네임 30일 쿨다운
- **결정**: 카카오·네이버·토스 통용 기준(2~10 한글 / 2~16 영문) + 30일 1회 변경
- **이유**: 정체성 안정성 + 어뷰즈 방지(욕설→정상→욕설 토글 차단). Discord(30분 쿨다운)보다 보수적.

---

## 14. 부록

### 14.1 환경 변수
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` — 챗봇
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — 데이터 읽기
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — 시드 스크립트 (서버 측만)
- `EXPO_PUBLIC_KAKAO_REST_API_KEY` — 카카오 OAuth
- `EXPO_PUBLIC_NAVER_CLIENT_ID` / `EXPO_PUBLIC_NAVER_CLIENT_SECRET` — 네이버 OAuth

### 14.2 외부 API 의존
| 서비스 | 용도 | 대체 가능? |
|---|---|---|
| Anthropic Claude | 챗봇 | 가능 (GPT, Gemini) — 페르소나·캐시 재작성 |
| Supabase | DB + Auth + Storage | 가능 (Firebase, 자체 Postgres) — 큰 리팩토링 |
| Apple Sign-In | 인증 | iOS 출시 시 필수 (Apple 가이드라인) |
| Kakao / Naver | 인증 | 한국 시장 사실상 필수 |

### 14.3 출시 전 체크리스트 (Phase 6 진입 직전)
- [ ] 모든 P0 기능 동작 검증
- [ ] 30개 이상 실제 향수 데이터로 카탈로그 시드
- [ ] 이용약관 · 개인정보처리방침 페이지 라이브
- [ ] 앱 아이콘 + 스플래시 자산 1024x1024 / Android 432x432 확정
- [ ] Apple Privacy Disclosure 작성 (이메일·닉네임·캘린더 권한 명시)
- [ ] Google Play Data Safety 작성
- [ ] 카카오·네이버 콘솔에 프로덕션 번들 ID 등록
- [ ] 푸시 알림 전송 테스트
- [ ] Sentry DSN + 기본 애널리틱스 이벤트 연결
- [ ] 30대 베타 사용자 D7 retention 측정
