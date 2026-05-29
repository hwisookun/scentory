import { getSupabase } from '../supabase';
import { MOCK_SPOTS } from '../mockData';
import type { ScentorySpot } from '../../types';
import type { SpotRow } from '../../types/database';

function rowToSpot(r: SpotRow): ScentorySpot {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    type: r.type,
    is_verified: r.is_verified,
  };
}

export async function listSpots(): Promise<ScentorySpot[]> {
  const sb = getSupabase();
  if (!sb) return MOCK_SPOTS;

  const { data, error } = await sb
    .from('spots')
    .select('*')
    .order('name')
    .returns<SpotRow[]>();
  if (error) throw error;
  return data.map(rowToSpot);
}
