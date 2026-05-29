import { getSupabase } from '../supabase';
import { MOCK_PERFUMES } from '../mockData';
import type { Perfume, ScentTag } from '../../types';
import type { PerfumeRow, BrandRow } from '../../types/database';

// 조인 결과 — Supabase select('*, brand:brands(*)')의 응답 형태.
// Database 타입엔 join이 안 잡혀서 이 한 군데만 명시적 합성.
type PerfumeWithBrand = PerfumeRow & { brand: BrandRow };

function rowToPerfume(r: PerfumeWithBrand): Perfume {
  return {
    id: r.id,
    name: r.name,
    brand_id: r.brand_id,
    brand: {
      id: r.brand.id,
      name: r.brand.name,
      description: r.brand.description ?? undefined,
      official_url: r.brand.official_url ?? undefined,
      logo_url: r.brand.logo_url ?? undefined,
      priceRange: r.brand.price_range,
      isNiche: r.brand.is_niche,
      country: r.brand.country,
    },
    concentration: r.concentration,
    top_notes: r.top_notes,
    middle_notes: r.middle_notes,
    base_notes: r.base_notes,
    tags: r.tags,
    price_krw: r.price_krw,
    image_url: r.image_url ?? undefined,
    rating: r.rating ?? undefined,
    review_count: r.review_count,
    category: r.category ?? undefined,
    gender: r.gender ?? undefined,
    created_at: r.created_at,
  };
}

const SELECT_WITH_BRAND = '*, brand:brands(*)';

export async function getPerfumes(): Promise<Perfume[]> {
  const sb = getSupabase();
  if (!sb) return MOCK_PERFUMES;

  const { data, error } = await sb
    .from('perfumes')
    .select(SELECT_WITH_BRAND)
    .order('created_at', { ascending: false })
    .returns<PerfumeWithBrand[]>();
  if (error) throw error;
  return data.map(rowToPerfume);
}

export async function getPerfumeById(id: string): Promise<Perfume | null> {
  const sb = getSupabase();
  if (!sb) return MOCK_PERFUMES.find((p) => p.id === id) ?? null;

  // .maybeSingle() 뒤엔 .returns<>를 못 붙임 — 셰이프는 동일하므로 mapper에서 캐스트.
  const { data, error } = await sb
    .from('perfumes')
    .select(SELECT_WITH_BRAND)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPerfume(data as unknown as PerfumeWithBrand) : null;
}

export interface SearchPerfumesParams {
  query?: string;       // 이름·브랜드명에 포함되는 부분 문자열
  tags?: ScentTag[];    // 이 태그 중 하나라도 포함
  brandIds?: string[];
  limit?: number;
}

/**
 * 검색 + 필터 — Search 화면, ScentLibrary 등이 호출 대상.
 * Mock 모드에선 동일한 의미로 필터링해서 반환.
 */
export async function searchPerfumes(params: SearchPerfumesParams = {}): Promise<Perfume[]> {
  const sb = getSupabase();
  const limit = params.limit ?? 50;

  if (!sb) {
    let list = MOCK_PERFUMES;
    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.name.toLowerCase().includes(q),
      );
    }
    if (params.tags?.length) {
      const set = new Set(params.tags);
      list = list.filter((p) => p.tags.some((t) => set.has(t)));
    }
    if (params.brandIds?.length) {
      const set = new Set(params.brandIds);
      list = list.filter((p) => set.has(p.brand_id));
    }
    return list.slice(0, limit);
  }

  let q = sb.from('perfumes').select(SELECT_WITH_BRAND).limit(limit);
  if (params.query) {
    // 이름 부분 일치 (브랜드명 일치는 별도 RPC로 빼는 게 깔끔하지만,
    // 프로토타입 단계에선 ilike만으로 충분)
    q = q.ilike('name', `%${params.query}%`);
  }
  if (params.tags?.length) {
    q = q.overlaps('tags', params.tags);
  }
  if (params.brandIds?.length) {
    q = q.in('brand_id', params.brandIds);
  }
  const { data, error } = await q
    .order('rating', { ascending: false, nullsFirst: false })
    .returns<PerfumeWithBrand[]>();
  if (error) throw error;
  return data.map(rowToPerfume);
}
