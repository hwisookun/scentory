/**
 * 모든 소셜 로그인 프로바이더가 반환하는 공통 프로필.
 * 화면 코드는 provider에 따라 분기할 필요 없이 이 형태만 다룸.
 */
export interface SocialProfile {
  provider: 'apple' | 'kakao' | 'naver';
  providerUserId: string;
  email?: string;
  nickname?: string;
  // 서버 검증·세션 발급용 토큰. 백엔드 도입 시 그대로 전달.
  identityToken?: string;
  accessToken?: string;
}

/**
 * 로그인 시도 결과 — 모든 provider 함수가 이걸 반환해요.
 *  - 'ok'     : 정상 로그인. profile 사용.
 *  - 'cancel' : 사용자가 직접 취소 (Apple의 sheet 닫기, 카카오의 backbutton 등).
 *               UI는 토스트 없이 조용히 처리.
 *  - 'error'  : 실패. message로 사용자에게 알려요.
 */
export type SocialAuthResult =
  | { status: 'ok'; profile: SocialProfile }
  | { status: 'cancel' }
  | { status: 'error'; message: string };
