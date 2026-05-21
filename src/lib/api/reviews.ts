import { getSupabase } from '../supabase';
import { MOCK_REVIEWS } from '../mockData';
import type { Review } from '../../types';

interface ReviewRow {
  id: string;
  user_id: string;
  perfume_id: string;
  rating: number;
  comment: string | null;
  nickname: string | null;
  images: string[] | null;
  created_at: string;
}

function rowToReview(r: ReviewRow): Review {
  return {
    id: r.id,
    user_id: r.user_id,
    perfume_id: r.perfume_id,
    rating: r.rating,
    comment: r.comment ?? '',
    nickname: r.nickname ?? undefined,
    images: r.images ?? undefined,
    created_at: r.created_at,
  };
}

export async function listReviews(perfumeId: string): Promise<Review[]> {
  const sb = getSupabase();
  if (!sb) {
    return MOCK_REVIEWS.filter((r) => r.perfume_id === perfumeId);
  }

  const { data, error } = await sb
    .from('reviews')
    .select('*')
    .eq('perfume_id', perfumeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

/**
 * 커뮤니티 피드용 — 전체 리뷰를 최신순으로.
 * Supabase 모드에선 server-side에 limit 걸어요.
 */
export async function listAllReviews(limit = 100): Promise<Review[]> {
  const sb = getSupabase();
  if (!sb) return MOCK_REVIEWS;

  const { data, error } = await sb
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

export interface CreateReviewInput {
  perfume_id: string;
  rating: number;
  comment?: string;
  nickname?: string;
  images?: string[];
}

/**
 * 새 리뷰 작성. user_id는 auth.uid()에서 자동으로 세팅돼야 하므로
 * RLS 정책이 INSERT 시 with check (auth.uid() = user_id)을 강제.
 * 따라서 호출 측은 로그인 상태여야 하고, user_id를 명시적으로 전달해 줘야 해요.
 */
export async function createReview(
  input: CreateReviewInput & { user_id: string },
): Promise<Review> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase 미설정 — 리뷰 작성은 라이브 환경에서만 동작해요.');
  }
  const { data, error } = await sb
    .from('reviews')
    .insert({
      user_id: input.user_id,
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
