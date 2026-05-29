-- 0002 — 추가 제약 + RLS 정합성
--
-- API design review (B- → A-)에서 발견된 3가지 보안·정합성 갭 채움:
--   1. perfumes.rating에 [0, 5] 범위 보장 — 트리거가 잘못 쓰면 침범 가능
--   2. reviews.images 길이 상한 — 어뷰즈/스토리지 폭증 방지
--   3. reviews.user_id 기본값을 auth.uid()로 — 클라이언트 호출 단순화 + 위변조 방지
--
-- 적용: Supabase Dashboard → SQL Editor에 통째로 붙여넣고 Run.

-- ── 1. perfumes.rating 범위 ─────────────────────────────────
alter table public.perfumes
  add constraint perfumes_rating_range
  check (rating is null or (rating >= 0 and rating <= 5));

-- ── 2. reviews.images 최대 5장 ─────────────────────────────
-- 한줄평 카드 UI가 3~5장까지 자연스럽게 처리, 그 이상은 어뷰즈 신호.
alter table public.reviews
  add constraint reviews_images_max
  check (images is null or cardinality(images) <= 5);

-- ── 3. user_id 기본값 + 명시 컬럼 안전성 ──────────────────
-- INSERT 시 user_id를 안 보내도 auth.uid()가 자동 채워짐 → 클라이언트는
-- 더 이상 user_id를 알 필요 없음. RLS WITH CHECK도 그대로 통과.
alter table public.reviews
  alter column user_id set default auth.uid();
