import * as AuthSession from 'expo-auth-session';
import type { SocialAuthResult } from './types';

const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

const DISCOVERY = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};
const PROFILE_ENDPOINT = 'https://kapi.kakao.com/v2/user/me';

/**
 * 카카오 로그인 (Kakao REST API · OAuth 2.0 Authorization Code).
 *
 * 흐름:
 *   1. authorize URL을 in-app browser로 띄움
 *   2. 사용자가 카카오 계정으로 동의 → matda://oauth/kakao?code=... 로 리디렉트
 *   3. code를 token endpoint에 POST → access_token 획득
 *   4. /v2/user/me 호출 → nickname, email 등 프로필 수집
 *
 * 환경 변수:
 *   EXPO_PUBLIC_KAKAO_REST_API_KEY — Developers 콘솔의 REST API 키.
 *   없으면 fallback (mock) 응답을 반환.
 *
 * Kakao 콘솔 설정 필요:
 *   - 플랫폼 → iOS/Android 패키지 등록
 *   - 카카오 로그인 활성화
 *   - Redirect URI에 'matda://oauth/kakao' 추가
 */
export async function signInWithKakao(): Promise<SocialAuthResult> {
  if (!KAKAO_CLIENT_ID) {
    // 개발 모드 fallback — 콘솔 키가 아직 안 들어왔을 때.
    console.warn('[auth/kakao] EXPO_PUBLIC_KAKAO_REST_API_KEY 미설정 — mock 프로필 반환');
    return {
      status: 'ok',
      profile: {
        provider: 'kakao',
        providerUserId: 'kakao_mock',
        nickname: '카카오 사용자',
        email: 'user@kakao.com',
      },
    };
  }

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'matda', path: 'oauth/kakao' });
  const request = new AuthSession.AuthRequest({
    clientId: KAKAO_CLIENT_ID,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    scopes: ['profile_nickname', 'account_email'],
  });

  try {
    const result = await request.promptAsync(DISCOVERY);
    if (result.type === 'cancel' || result.type === 'dismiss') return { status: 'cancel' };
    if (result.type !== 'success') {
      return { status: 'error', message: '카카오 로그인을 끝마치지 못했어요.' };
    }
    const code = result.params.code;
    if (!code) return { status: 'error', message: '카카오 인증 코드를 받지 못했어요.' };

    // ── code → access_token 교환 ────────────────────────────
    const tokenRes = await fetch(DISCOVERY.tokenEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });
    if (!tokenRes.ok) {
      return { status: 'error', message: `토큰 교환 실패 (HTTP ${tokenRes.status})` };
    }
    const tokenData = await tokenRes.json();
    const accessToken: string | undefined = tokenData.access_token;
    if (!accessToken) return { status: 'error', message: '카카오 토큰을 받지 못했어요.' };

    // ── 프로필 조회 ─────────────────────────────────────────
    const profileRes = await fetch(PROFILE_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return { status: 'error', message: `프로필 조회 실패 (HTTP ${profileRes.status})` };
    }
    const profileData = await profileRes.json();
    // 카카오 응답 스키마: { id, kakao_account: { email, profile: { nickname, ... } } }
    const kakaoId: number | string = profileData.id;
    const kakaoAccount = profileData.kakao_account ?? {};
    const nickname: string | undefined = kakaoAccount.profile?.nickname;
    const email: string | undefined = kakaoAccount.email;

    return {
      status: 'ok',
      profile: {
        provider: 'kakao',
        providerUserId: String(kakaoId),
        nickname,
        email,
        accessToken,
      },
    };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : '카카오 로그인 실패',
    };
  }
}
