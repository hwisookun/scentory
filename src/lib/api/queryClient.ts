import { QueryClient } from '@tanstack/react-query';

// Mock 모드에서는 Promise.resolve가 즉시 풀리므로 staleTime이 거의 무의미하지만,
// Supabase 모드로 넘어가면 카탈로그 데이터(향수·브랜드)는 자주 안 바뀌므로 5분간 fresh로 유지.
// React Native에서는 'reconnect' 자동 리페치가 의미가 없어서 끔.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
