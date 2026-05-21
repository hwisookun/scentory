import { getSupabase } from '../supabase';
import { MOCK_PERFUMES } from '../mockData';
import type { Perfume, ScentTag, Concentration, PerfumeCategory } from '../../types';

interface PerfumeRow {
  id: string;
  name: string;
  brand_id: string;
  concentration: Concentration;
  top_notes: string[] | null;
  middle_notes: string[] | null;
  base_notes: string[] | null;
  tags: ScentTag[] | null;
  price_krw: number;
  image_url: string | null;
  rating: number | null;
  review_count: number;
  category: PerfumeCategory | null;
  gender: '남성' | '여성' | '유니섹스' | null;
  created_at: string;
  brand: {
    id: string;
    name: string;
    description: string | null;
    official_url: string | null;
    logo_url: string | null;
    price_range: Perfume['brand']['priceRange'];
    is_niche: boolean;
    country: Perfume['brand']['country'];
  };
}

function rowToPerfume(r: PerfumeRow): Perfume {
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
    top_notes: r.top_notes ?? [],
    middle_notes: r.middle_notes ?? [],
    base_notes: r.base_notes ?? [],
    tags: r.tags ?? [],
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
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as PerfumeRow[]).map(rowToPerfume);
}

export async function getPerfumeById(id: string): Promise<Perfume | null> {
  const sb = getSupabase();
  if (!sb) return MOCK_PERFUMES.find((p) => p.id === id) ?? null;

  const { data, error } = await sb
    .from('perfumes')
    .select(SELECT_WITH_BRAND)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPerfume(data as unknown as PerfumeRow) : null;
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
  const { data, error } = await q.order('rating', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data as unknown as PerfumeRow[]).map(rowToPerfume);
}
