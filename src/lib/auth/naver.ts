import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import type { SocialAuthResult } from './types';

const NAVER_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;

const DISCOVERY = {
  authorizationEndpoint: 'https://nid.naver.com/oauth2.0/authorize',
  tokenEndpoint: 'https://nid.naver.com/oauth2.0/token',
};
const PROFILE_ENDPOINT = 'https://openapi.naver.com/v1/nid/me';

/**
 * 네이버 로그인 (OAuth 2.0 Authorization Code).
 *
 * 흐름:
 *   1. authorize URL을 in-app browser로 띄움 (state는 CSRF용 랜덤 문자열)
 *   2. 사용자가 동의 → matda://oauth/naver?code=...&state=... 로 리디렉트
 *   3. code + state + client_id + client_secret POST → access_token
 *   4. /v1/nid/me 호출 → nickname, email
 *
 * 환경 변수:
 *   EXPO_PUBLIC_NAVER_CLIENT_ID
 *   EXPO_PUBLIC_NAVER_CLIENT_SECRET — 클라이언트 번들에 들어가니 보안상 백엔드 프록시 권장.
 *                                     프로토타입에선 .env에 임시로 두고 사용.
 *
 * Naver Developers 콘솔 설정 필요:
 *   - 애플리케이션 등록
 *   - 서비스 환경 → '안드로이드/iOS 앱' 또는 'OAuth' 선택
 *   - Callback URL에 'matda://oauth/naver' 추가
 */
export async function signInWithNaver(): Promise<SocialAuthResult> {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.warn('[auth/naver] EXPO_PUBLIC_NAVER_CLIENT_ID/SECRET 미설정 — mock 프로필 반환');
    return {
      status: 'ok',
      profile: {
        provider: 'naver',
        providerUserId: 'naver_mock',
        nickname: '네이버 사용자',
        email: 'user@naver.com',
      },
    };
  }

  // CSRF state — Naver는 state 검증을 강하게 요구하지 않지만, OAuth 2.0 표준상 포함.
  const state = Crypto.randomUUID();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'matda', path: 'oauth/naver' });

  const request = new AuthSession.AuthRequest({
    clientId: NAVER_CLIENT_ID,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    state,
    scopes: [],
  });

  try {
    const result = await request.promptAsync(DISCOVERY);
    if (result.type === 'cancel' || result.type === 'dismiss') return { status: 'cancel' };
    if (result.type !== 'success') {
      return { status: 'error', message: '네이버 로그인을 끝마치지 못했어요.' };
    }
    const code = result.params.code;
    const returnedState = result.params.state;
    if (!code) return { status: 'error', message: '네이버 인증 코드를 받지 못했어요.' };
    if (returnedState !== state) {
      return { status: 'error', message: '네이버 state 불일치 — 다시 시도해 주세요.' };
    }

    // ── code → access_token ────────────────────────────────
    const tokenRes = await fetch(DISCOVERY.tokenEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code,
        state,
      }).toString(),
    });
    if (!tokenRes.ok) {
      return { status: 'error', message: `토큰 교환 실패 (HTTP ${tokenRes.status})` };
    }
    const tokenData = await tokenRes.json();
    const accessToken: string | undefined = tokenData.access_token;
    if (!accessToken) return { status: 'error', message: '네이버 토큰을 받지 못했어요.' };

    // ── 프로필 조회 ─────────────────────────────────────────
    const profileRes = await fetch(PROFILE_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return { status: 'error', message: `프로필 조회 실패 (HTTP ${profileRes.status})` };
    }
    const profileData = await profileRes.json();
    // 네이버 응답 스키마: { resultcode, message, response: { id, nickname, email, ... } }
    const naverResponse = profileData.response ?? {};
    return {
      status: 'ok',
      profile: {
        provider: 'naver',
        providerUserId: String(naverResponse.id ?? ''),
        nickname: naverResponse.nickname,
        email: naverResponse.email,
        accessToken,
      },
    };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : '네이버 로그인 실패',
    };
  }
}
