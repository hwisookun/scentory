/**
 * 맡다. Supabase seed script
 *
 * 1. .env에 다음 키를 채워 주세요:
 *      SUPABASE_URL=https://xxxxx.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY=eyJ... (Dashboard → Settings → API → service_role)
 *
 *    주의 — service_role 키는 RLS를 우회하는 마스터 키. 절대 클라이언트
 *    번들이나 git에 노출하지 마세요. .env는 이미 gitignore.
 *
 * 2. 마이그레이션 적용:
 *      Dashboard → SQL Editor → supabase/migrations/0001_init.sql 붙여넣고 Run
 *
 * 3. 실행:
 *      npm run seed              # 메타데이터만 (image_url은 외부 URL 그대로)
 *      npm run seed -- --with-images   # 이미지 다운로드 후 Storage에 업로드
 *
 * 멱등(idempotent) — 두 번 돌려도 안전. id 충돌 시 upsert.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MOCK_BRANDS, MOCK_PERFUMES, MOCK_SPOTS } from '../src/lib/mockData';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WITH_IMAGES = process.argv.includes('--with-images');
const IMAGE_BUCKET = 'perfume-images';
const IMAGE_CONCURRENCY = 4;

if (!URL || !KEY) {
  console.error('❌ .env에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 채워 주세요.');
  process.exit(1);
}

const sb = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── 동시성 제한 워커 ─────────────────────────────────────
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ── 이미지 한 장: 외부 URL → Storage → 새 public URL ─────
async function uploadPerfumeImage(perfumeId: string, sourceUrl: string): Promise<string> {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    console.warn(`  ⚠ ${perfumeId}: ${sourceUrl} fetch 실패 (${res.status}) — 원본 URL 유지`);
    return sourceUrl;
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  // 확장자는 content-type에서 추출. JPEG가 대부분.
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const path = `${perfumeId}.${ext}`;

  const { error } = await sb.storage.from(IMAGE_BUCKET).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.warn(`  ⚠ ${perfumeId}: 업로드 실패 (${error.message}) — 원본 URL 유지`);
    return sourceUrl;
  }
  const { data } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── 시드 단계들 ─────────────────────────────────────────
async function seedBrands() {
  const rows = MOCK_BRANDS.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description ?? null,
    official_url: b.official_url ?? null,
    logo_url: b.logo_url ?? null,
    price_range: b.priceRange,
    is_niche: b.isNiche,
    country: b.country,
  }));
  const { error } = await sb.from('brands').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ brands: ${rows.length}개`);
}

async function seedPerfumes() {
  // 이미지 모드면 먼저 모든 이미지를 Storage로 옮겨서 새 URL 맵을 만듦.
  let urlMap: Record<string, string> = {};
  if (WITH_IMAGES) {
    console.log(`↑ uploading ${MOCK_PERFUMES.length} images → ${IMAGE_BUCKET}`);
    let done = 0;
    const newUrls = await mapWithConcurrency(MOCK_PERFUMES, IMAGE_CONCURRENCY, async (p) => {
      if (!p.image_url) return null;
      const url = await uploadPerfumeImage(p.id, p.image_url);
      done++;
      if (done % 10 === 0 || done === MOCK_PERFUMES.length) {
        console.log(`  ${done}/${MOCK_PERFUMES.length}`);
      }
      return url;
    });
    MOCK_PERFUMES.forEach((p, i) => {
      if (newUrls[i]) urlMap[p.id] = newUrls[i]!;
    });
  }

  const rows = MOCK_PERFUMES.map((p) => ({
    id: p.id,
    name: p.name,
    brand_id: p.brand_id,
    concentration: p.concentration,
    top_notes: p.top_notes,
    middle_notes: p.middle_notes,
    base_notes: p.base_notes,
    tags: p.tags,
    price_krw: p.price_krw,
    image_url: urlMap[p.id] ?? p.image_url ?? null,
    rating: p.rating ?? null,
    review_count: p.review_count ?? 0,
    category: p.category ?? null,
    gender: p.gender ?? null,
    created_at: p.created_at,
  }));
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await sb.from('perfumes').upsert(chunk, { onConflict: 'id' });
    if (error) throw error;
  }
  console.log(`✓ perfumes: ${rows.length}개${WITH_IMAGES ? ' (image_url → Storage)' : ''}`);
}

async function seedSpots() {
  const rows = MOCK_SPOTS.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    type: s.type,
    is_verified: s.is_verified,
  }));
  const { error } = await sb.from('spots').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ spots: ${rows.length}개`);
}

async function main() {
  console.log(`Seeding → ${URL}${WITH_IMAGES ? '  (with image upload)' : ''}\n`);
  try {
    // 순서 중요: perfumes는 brands FK를 참조.
    await seedBrands();
    await seedPerfumes();
    await seedSpots();
    console.log('\n✓ 시드 완료');
  } catch (err) {
    console.error('\n❌ 실패:', err);
    process.exit(1);
  }
}

main();
