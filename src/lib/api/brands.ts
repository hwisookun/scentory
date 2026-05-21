import { getSupabase } from '../supabase';
import { MOCK_BRANDS } from '../mockData';
import type { Brand, PriceRange, PerfumeCountry } from '../../types';

interface BrandRow {
  id: string;
  name: string;
  description: string | null;
  official_url: string | null;
  logo_url: string | null;
  price_range: PriceRange;
  is_niche: boolean;
  country: PerfumeCountry;
}

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

  const { data, error } = await sb.from('brands').select('*').order('name');
  if (error) throw error;
  return (data as BrandRow[]).map(rowToBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const sb = getSupabase();
  if (!sb) return MOCK_BRANDS.find((b) => b.id === id) ?? null;

  const { data, error } = await sb.from('brands').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToBrand(data as BrandRow) : null;
}
