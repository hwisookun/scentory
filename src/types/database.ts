/**
 * Supabase 스키마와 1:1 매칭되는 Database 타입.
 *
 * 이 파일은 supabase/migrations/0001_init.sql + 0002_constraints.sql의
 * 컬럼 정의를 그대로 옮겨 놓은 것. supabase-js 클라이언트에 generic으로
 * 주입하면 `.from('perfumes').select()` 결과가 자동 타입 추론됨.
 *
 * 향후 supabase CLI 도입 시 다음 명령으로 자동 생성된 파일로 교체:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * 그때까지 마이그레이션과 이 파일을 같이 변경해 주세요. drift 방지를 위해
 * 컬럼 추가/삭제 시 반드시 이 파일도 같이 갱신.
 */

import type {
  Concentration, ScentTag, PerfumeCategory, PriceRange, PerfumeCountry,
} from './index';

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          official_url: string | null;
          logo_url: string | null;
          price_range: PriceRange;
          is_niche: boolean;
          country: PerfumeCountry;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          official_url?: string | null;
          logo_url?: string | null;
          price_range: PriceRange;
          is_niche?: boolean;
          country: PerfumeCountry;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['brands']['Insert']>;
      };

      perfumes: {
        Row: {
          id: string;
          name: string;
          brand_id: string;
          concentration: Concentration;
          top_notes: string[];
          middle_notes: string[];
          base_notes: string[];
          tags: ScentTag[];
          price_krw: number;
          image_url: string | null;
          rating: number | null;
          review_count: number;
          category: PerfumeCategory | null;
          gender: '남성' | '여성' | '유니섹스' | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          brand_id: string;
          concentration: Concentration;
          top_notes?: string[];
          middle_notes?: string[];
          base_notes?: string[];
          tags?: ScentTag[];
          price_krw: number;
          image_url?: string | null;
          rating?: number | null;
          review_count?: number;
          category?: PerfumeCategory | null;
          gender?: '남성' | '여성' | '유니섹스' | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['perfumes']['Insert']>;
      };

      reviews: {
        Row: {
          id: string;
          user_id: string;
          perfume_id: string;
          rating: number;
          comment: string | null;
          nickname: string | null;
          images: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          // user_id는 0002 마이그레이션에서 auth.uid() 기본값을 받으므로 클라이언트에서 안 보내도 됨
          user_id?: string;
          perfume_id: string;
          rating: number;
          comment?: string | null;
          nickname?: string | null;
          images?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };

      spots: {
        Row: {
          id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          type: string;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          type: string;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['spots']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// 자주 쓰는 alias — 호출 측 짧게 import
export type BrandRow = Database['public']['Tables']['brands']['Row'];
export type PerfumeRow = Database['public']['Tables']['perfumes']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
export type SpotRow = Database['public']['Tables']['spots']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
