import { createClient, SupabaseClient } from '@supabase/supabase-js';

// React Native + Expo: EXPO_PUBLIC_ 접두사가 붙은 env만 클라이언트 번들에 노출됨.
// anon key는 공개돼도 되는 키 — RLS 정책으로 데이터 보호.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 타입 안전성 전략:
//   - 클라이언트 자체는 untyped (Database 제네릭 없음) — Supabase CLI gen types로
//     자동 생성된 진짜 스키마가 들어오기 전까지는 그게 가장 안정적이에요.
//   - 대신 각 select 호출에서 `.returns<RowType>()`로 응답 형태를 명시.
//   - 결과: `as unknown as` 캐스트 사라지고 mapper 함수도 진짜 타입을 받음.
let _client: SupabaseClient | null = null;

/**
 * env가 설정되어 있으면 Supabase 클라이언트를 반환, 아니면 null.
 * Repository 레이어가 이 함수로 'mock vs live' 분기를 결정해요.
 */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // React Native에선 localStorage가 없어요. AsyncStorage 연동은
        // 인증 도입 시 추가하세요.
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}
