import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './index';
import type { SearchPerfumesParams } from './perfumes';
import type { CreateReviewInput, ReviewsPage } from './reviews';
import type { Review } from '../../types';

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

// ── Reviews ─────────────────────────────────────────────
// 두 가지 모양 제공:
//  · useReviews / useAllReviews — 첫 페이지만 (간단한 미리보기 용도)
//  · useInfiniteReviews / useInfiniteAllReviews — 무한 스크롤
// 둘 다 동일한 queryKey 패턴을 쓰지만 'infinite' 접미사로 구분해서
// invalidation이 양쪽에 다 닿도록 함.

export function useReviews(perfumeId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', perfumeId, 'first-page'],
    queryFn: async (): Promise<Review[]> => {
      const page = await api.listReviews(perfumeId!);
      return page.data;
    },
    enabled: !!perfumeId,
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ['reviews', 'all', 'first-page'],
    queryFn: async (): Promise<Review[]> => {
      const page = await api.listAllReviews();
      return page.data;
    },
  });
}

export function useInfiniteReviews(perfumeId: string | undefined) {
  return useInfiniteQuery<ReviewsPage>({
    queryKey: ['reviews', perfumeId, 'infinite'],
    queryFn: ({ pageParam }) =>
      api.listReviews(perfumeId!, { cursor: pageParam as string | undefined }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!perfumeId,
  });
}

export function useInfiniteAllReviews() {
  return useInfiniteQuery<ReviewsPage>({
    queryKey: ['reviews', 'all', 'infinite'],
    queryFn: ({ pageParam }) =>
      api.listAllReviews({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

/**
 * 리뷰 작성 mutation.
 *
 * 성공 시 첫 페이지·무한 페이지 양쪽 캐시를 invalidate해서 새 리뷰가
 * 자동으로 보이도록 함. 호출 측은 그냥 `mutate(input)` 또는 `mutateAsync`만.
 *
 * 호출 예:
 *   const create = useCreateReview();
 *   create.mutate({ perfume_id, rating, comment });
 *
 * Mock 모드(env 미설정)에선 onError로 떨어지므로 호출 측이
 * 로컬 pendingReviews 폴백을 유지하면 됨.
 */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.createReview(input),
    onSuccess: (_review, input) => {
      // 해당 향수의 리뷰 페이지들 + 커뮤니티 전체 피드 모두 새로고침
      qc.invalidateQueries({ queryKey: ['reviews', input.perfume_id] });
      qc.invalidateQueries({ queryKey: ['reviews', 'all'] });
    },
  });
}

export function useSpots() {
  return useQuery({
    queryKey: ['spots'],
    queryFn: api.listSpots,
  });
}
