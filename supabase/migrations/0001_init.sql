-- 맡다. (Scentory) 초기 스키마
--
-- 적용 방법:
--   - Supabase Dashboard → SQL Editor에 통째로 붙여넣기 후 Run, 또는
--   - Supabase CLI: `supabase db push`
--
-- 설계 노트:
--   - perfume/brand id는 TEXT — mock 데이터의 'cr1', 'mm2' 같은 문자열 ID와 호환.
--     Supabase 자체 UUID를 쓰려면 별도 마이그레이션에서 컬럼 추가 + FK 교체 필요.
--   - reviews.user_id는 auth.users 참조 — 향후 인증 연동 시 자연스럽게 연결됨.
--   - tags/notes는 text[] 사용. GIN 인덱스로 태그 필터링 빠르게.

create extension if not exists "uuid-ossp";

-- ── brands ───────────────────────────────────────────────────
create table public.brands (
  id            text primary key,
  name          text not null,
  description   text,
  official_url  text,
  logo_url      text,
  price_range   text not null check (price_range in ('under50k','50k_150k','150k_300k','over300k')),
  is_niche      boolean not null default false,
  country       text not null,
  created_at    timestamptz not null default now()
);

-- ── perfumes ─────────────────────────────────────────────────
create table public.perfumes (
  id              text primary key,
  name            text not null,
  brand_id        text not null references public.brands(id) on delete restrict,
  concentration   text not null check (concentration in ('EDT','EDP','Parfum','EDC')),
  top_notes       text[] not null default '{}',
  middle_notes    text[] not null default '{}',
  base_notes      text[] not null default '{}',
  tags            text[] not null default '{}',
  price_krw       integer not null,
  image_url       text,
  rating          numeric(2,1),
  review_count    integer not null default 0,
  category        text check (category in ('니치','논니치','남성','여성','유니섹스')),
  gender          text check (gender in ('남성','여성','유니섹스')),
  created_at      timestamptz not null default now()
);
create index perfumes_brand_id_idx on public.perfumes (brand_id);
create index perfumes_tags_gin on public.perfumes using gin (tags);
create index perfumes_rating_idx on public.perfumes (rating desc nulls last);

-- ── reviews ──────────────────────────────────────────────────
create table public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  perfume_id    text not null references public.perfumes(id) on delete cascade,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  nickname      text,
  images        text[] not null default '{}',
  created_at    timestamptz not null default now()
);
create index reviews_perfume_id_idx on public.reviews (perfume_id, created_at desc);
create index reviews_user_id_idx on public.reviews (user_id, created_at desc);

-- ── spots (오프라인 매장) ────────────────────────────────────
create table public.spots (
  id            text primary key,
  name          text not null,
  address       text not null,
  lat           numeric(10,6) not null,
  lng           numeric(10,6) not null,
  type          text not null,
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now()
);
create index spots_geo_idx on public.spots (lat, lng);

-- ── RLS ──────────────────────────────────────────────────────
-- 향수 카탈로그는 누구나 읽을 수 있어요. 쓰기는 service_role 키만.
alter table public.brands enable row level security;
alter table public.perfumes enable row level security;
alter table public.spots enable row level security;
alter table public.reviews enable row level security;

create policy "brands read"   on public.brands   for select using (true);
create policy "perfumes read" on public.perfumes for select using (true);
create policy "spots read"    on public.spots    for select using (true);

-- reviews — 모두 읽기 가능, 본인 것만 쓰기/수정/삭제
create policy "reviews read"      on public.reviews for select using (true);
create policy "reviews insert"    on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews update"    on public.reviews for update using (auth.uid() = user_id);
create policy "reviews delete"    on public.reviews for delete using (auth.uid() = user_id);

-- ── 향수의 rating/review_count를 reviews 기반으로 자동 갱신 ─
-- 프로토타입에선 mock 값으로 시드하지만, 실제 운영 시 정합성 유지를 위해 트리거 추가.
create or replace function public.recompute_perfume_stats(p_perfume_id text)
returns void language plpgsql as $$
begin
  update public.perfumes p
  set
    rating = sub.avg_rating,
    review_count = sub.cnt
  from (
    select avg(rating)::numeric(2,1) as avg_rating, count(*) as cnt
    from public.reviews
    where perfume_id = p_perfume_id
  ) sub
  where p.id = p_perfume_id;
end $$;

create or replace function public.trg_reviews_stats()
returns trigger language plpgsql as $$
begin
  perform public.recompute_perfume_stats(coalesce(new.perfume_id, old.perfume_id));
  return null;
end $$;

create trigger reviews_stats_aiud
after insert or update or delete on public.reviews
for each row execute function public.trg_reviews_stats();

-- ── Storage: perfume-images bucket ──────────────────────────
-- 향수 이미지 호스팅 — 외부 핫링크 대신 자체 CDN으로 일관성·안정성 확보.
-- 공개 read 정책 — 누구나 이미지 조회 가능. 쓰기는 service_role(seed)만.
insert into storage.buckets (id, name, public)
values ('perfume-images', 'perfume-images', true)
on conflict (id) do nothing;

create policy "perfume-images public read"
on storage.objects for select
using (bucket_id = 'perfume-images');
