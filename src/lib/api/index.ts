// 데이터 액세스 진입점.
// 화면 코드에서는 `import { api } from '../../lib/api'` 한 줄로 끝.
//
// 동작:
//   - EXPO_PUBLIC_SUPABASE_URL/KEY가 있으면 Supabase에 접근
//   - 없으면 mock 데이터를 그대로 반환 (개발/오프라인)
//
// 모든 함수는 동일한 TypeScript 시그니처 — 환경 차이는 호출 측에서 알 필요 없어요.

import * as brands from './brands';
import * as perfumes from './perfumes';
import * as reviews from './reviews';
import * as spots from './spots';

export const api = {
  ...brands,
  ...perfumes,
  ...reviews,
  ...spots,
};

export { isSupabaseConfigured } from '../supabase';
