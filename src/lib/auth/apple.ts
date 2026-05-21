import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { SocialAuthResult } from './types';

/**
 * Apple Sign-In (iOS 전용).
 *
 * - 사용자가 첫 로그인 시 이름과 이메일을 일회성으로 받아요.
 *   재로그인 시엔 user(stable ID)와 identityToken만 옴 — Apple HIG에 따라
 *   첫 응답에서 받은 닉네임을 서버에 저장해 두는 게 표준.
 * - `identityToken`은 백엔드에서 Apple 공개키로 검증해야 진짜 사용자임을 보장.
 *   현재는 로컬 store에 저장만 하고, 백엔드 도입 시 서버 검증을 추가하세요.
 *
 * @returns SocialAuthResult — 'ok'면 profile, 'cancel'은 사용자 취소.
 */
export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== 'ios') {
    return { status: 'error', message: 'Apple 로그인은 iOS에서만 지원돼요.' };
  }
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { status: 'error', message: '이 기기에선 Apple 로그인을 사용할 수 없어요.' };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // 이름은 첫 로그인에만 옴 — 비어 있으면 fallback.
    const fullName = credential.fullName;
    const nickname = [fullName?.familyName, fullName?.givenName]
      .filter(Boolean)
      .join('')
      .trim();

    return {
      status: 'ok',
      profile: {
        provider: 'apple',
        providerUserId: credential.user,
        email: credential.email ?? undefined,
        nickname: nickname || undefined,
        identityToken: credential.identityToken ?? undefined,
      },
    };
  } catch (err: unknown) {
    // Apple의 cancel은 code 'ERR_REQUEST_CANCELED'.
    const code = (err as { code?: string })?.code;
    if (code === 'ERR_REQUEST_CANCELED') return { status: 'cancel' };
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Apple 로그인 실패',
    };
  }
}
