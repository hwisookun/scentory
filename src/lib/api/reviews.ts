import { getSupabase } from '../supabase';
import { MOCK_REVIEWS } from '../mockData';
import type { Review } from '../../types';
import type { ReviewRow } from '../../types/database';

function rowToReview(r: ReviewRow): Review {
  return {
    id: r.id,
    user_id: r.user_id,
    perfume_id: r.perfume_id,
    rating: r.rating,
    comment: r.comment ?? '',
    nickname: r.nickname ?? undefined,
    images: r.images,
    created_at: r.created_at,
  };
}

/** 커서·페이지 응답 형태 — useInfiniteQuery가 그대로 받아 씀. */
export interface ReviewsPage {
  data: Review[];
  /** 다음 페이지 fetch에 넘길 ISO 타임스탬프. null이면 끝. */
  nextCursor: string | null;
}

const DEFAULT_PAGE = 20;

export interface ListReviewsParams {
  cursor?: string;   // created_at < cursor 인 결과만
  limit?: number;
}

/**
 * 특정 향수의 리뷰 — 최신순 + 커서 기반 페이지.
 *
 * 커서는 마지막 row의 created_at(ISO). 동시 시각 충돌은 프로토타입 범위에서
 * 허용. 정밀하게 다루려면 (created_at, id) 튜플 키셋 페이지네이션 RPC로.
 */
export async function listReviews(
  perfumeId: string,
  params: ListReviewsParams = {},
): Promise<ReviewsPage> {
  const limit = params.limit ?? DEFAULT_PAGE;
  const sb = getSupabase();

  if (!sb) {
    const all = MOCK_REVIEWS
      .filter((r) => r.perfume_id === perfumeId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const after = params.cursor
      ? all.filter((r) => r.created_at < params.cursor!)
      : all;
    const page = after.slice(0, limit);
    return {
      data: page,
      nextCursor: page.length === limit ? page[page.length - 1].created_at : null,
    };
  }

  let q = sb
    .from('reviews')
    .select('*')
    .eq('perfume_id', perfumeId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (params.cursor) q = q.lt('created_at', params.cursor);

  const { data, error } = await q.returns<ReviewRow[]>();
  if (error) throw error;
  const reviews = data.map(rowToReview);
  return {
    data: reviews,
    nextCursor: reviews.length === limit ? reviews[reviews.length - 1].created_at : null,
  };
}

/**
 * 커뮤니티 피드 — 전체 리뷰 최신순 + 커서.
 */
export async function listAllReviews(params: ListReviewsParams = {}): Promise<ReviewsPage> {
  const limit = params.limit ?? DEFAULT_PAGE;
  const sb = getSupabase();

  if (!sb) {
    const all = [...MOCK_REVIEWS].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const after = params.cursor
      ? all.filter((r) => r.created_at < params.cursor!)
      : all;
    const page = after.slice(0, limit);
    return {
      data: page,
      nextCursor: page.length === limit ? page[page.length - 1].created_at : null,
    };
  }

  let q = sb
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (params.cursor) q = q.lt('created_at', params.cursor);

  const { data, error } = await q.returns<ReviewRow[]>();
  if (error) throw error;
  const reviews = data.map(rowToReview);
  return {
    data: reviews,
    nextCursor: reviews.length === limit ? reviews[reviews.length - 1].created_at : null,
  };
}

export interface CreateReviewInput {
  perfume_id: string;
  rating: number;
  comment?: string;
  nickname?: string;
  images?: string[];
}

/**
 * 새 리뷰 작성.
 *
 * 0002 마이그레이션으로 `user_id`의 기본값이 `auth.uid()`라서 클라이언트는
 * user_id를 명시할 필요가 없어졌어요. RLS WITH CHECK도 자동으로 통과.
 *
 * Mock 모드(env 미설정)에선 throw — 호출 측이 try/catch로 분기하거나
 * useCreateReviewMutation의 fallback 경로를 사용하세요.
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase 미설정 — 리뷰 작성은 라이브 환경에서만 동작해요.');
  }
  // .single() 뒤엔 .returns<>를 못 붙임 — 셰이프는 ReviewRow와 동일.
  const { data, error } = await sb
    .from('reviews')
    .insert({
      perfume_id: input.perfume_id,
      rating: input.rating,
      comment: input.comment ?? null,
      nickname: input.nickname ?? null,
      images: input.images ?? [],
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToReview(data as ReviewRow);
}
