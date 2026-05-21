export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'EDC';

export type ScentTag =
  | '플로럴' | '시트러스' | '우디' | '머스크' | '프레시' | '오리엔탈'
  | '아쿠아틱' | '구르망' | '스파이시' | '허벌' | '파우더리' | '레더'
  | '스모키' | '그린' | '푸제르' | '시프레' | '발사믹' | '아이리스';

export type PriceRange = 'under50k' | '50k_150k' | '150k_300k' | 'over300k';

export type Purpose =
  | '일상용'
  | '데이트'
  | '직장·비즈니스'
  | '선물'
  | '특별한 날'
  | '컬렉션';

export type PerfumeCategory = '니치' | '논니치' | '남성' | '여성' | '유니섹스';
export type PerfumeCountry = '프랑스' | '이탈리아' | '영국' | '미국' | '중동' | '스웨덴';

export interface Brand {
  id: string;
  name: string;
  description?: string;
  official_url?: string;
  logo_url?: string;
  priceRange: PriceRange;
  isNiche: boolean;
  country: PerfumeCountry;
}

export interface Perfume {
  id: string;
  name: string;
  brand: Brand;
  brand_id: string;
  concentration: Concentration;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  tags: ScentTag[];
  price_krw: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  category?: PerfumeCategory;
  gender?: '남성' | '여성' | '유니섹스';
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  perfume_id: string;
  rating: number;
  comment: string;
  created_at: string;
  nickname?: string;
  images?: string[]; // 첨부 이미지 URI 배열
}

export interface WishlistItem {
  id: string;
  user_id: string;
  perfume_id: string;
  perfume: Perfume;
  added_at: string;
}

export interface CollectionItem {
  id: string;
  user_id: string;
  perfume_id: string;
  perfume: Perfume;
  memo?: string;
  rating?: number;
}

export interface ScentorySpot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  is_verified: boolean;
}

export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  loginType: 'apple' | 'kakao' | 'naver' | 'guest' | 'email';
  purpose?: Purpose;
  price_range?: PriceRange;
  pref_scents: ScentTag[];
  pref_notes: string[];
  created_at: string;
  // 닉네임을 마지막으로 직접 변경한 시각(ISO). 30일 쿨다운 계산용.
  // OAuth 첫 로그인으로 받은 닉네임은 카운트하지 않으므로 undefined로 시작해요.
  nickname_changed_at?: string;
}

export interface BrandSubscription {
  brand_id: string;
  push: boolean;
  email: boolean;
}

export interface DiaryEntry {
  dateKey: string;            // YYYY-MM-DD
  perfumeId: string;
  rating: number;             // 0–5 (별점)
  note: string;               // 다섯 줄 일기 (최대 200자 권장)
  createdAt: string;
  updatedAt: string;
  calendarEventId?: string;   // 시스템 캘린더와 동기화된 이벤트 ID
}
