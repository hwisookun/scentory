import { useQuery } from '@tanstack/react-query';
import { api } from './index';
import type { SearchPerfumesParams } from './perfumes';

// 화면에서 한 줄로 호출할 수 있는 표준 훅들.
// 키 컨벤션: ['리소스', ...식별자] — TanStack Query 표준.

export function usePerfumes() {
  return useQuery({
    queryKey: ['perfumes'],
    queryFn: api.getPerfumes,
  });
}

export function usePerfume(id: string | undefined) {
  return useQuery({
    queryKey: ['perfume', id],
    queryFn: () => api.getPerfumeById(id!),
    enabled: !!id,
  });
}

export function useSearchPerfumes(params: SearchPerfumesParams) {
  return useQuery({
    queryKey: ['perfumes', 'search', params],
    queryFn: () => api.searchPerfumes(params),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: api.getBrands,
  });
}

export function useReviews(perfumeId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', perfumeId],
    queryFn: () => api.listReviews(perfumeId!),
    enabled: !!perfumeId,
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: () => api.listAllReviews(),
  });
}

export function useSpots() {
  return useQuery({
    queryKey: ['spots'],
    queryFn: api.listSpots,
  });
}
