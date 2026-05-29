import { getSupabase } from '../supabase';
import { MOCK_BRANDS } from '../mockData';
import type { Brand } from '../../types';
import type { BrandRow } from '../../types/database';

function rowToBrand(r: BrandRow): Brand {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    official_url: r.official_url ?? undefined,
    logo_url: r.logo_url ?? undefined,
    priceRange: r.price_range,
    isNiche: r.is_niche,
    country: r.country,
  };
}

export async function getBrands(): Promise<Brand[]> {
  const sb = getSupabase();
  if (!sb) return MOCK_BRANDS;

  const { data, error } = await sb
    .from('brands')
    .select('*')
    .order('name')
    .returns<BrandRow[]>();
  if (error) throw error;
  return data.map(rowToBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const sb = getSupabase();
  if (!sb) return MOCK_BRANDS.find((b) => b.id === id) ?? null;

  // 단일 결과 쿼리에는 .returns<>를 못 붙임(현재 supabase-js 타입 가드 제한).
  // 셰이프는 BrandRow 그대로라서 mapper 호출 시 캐스트.
  const { data, error } = await sb
    .from('brands')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToBrand(data as BrandRow) : null;
}
