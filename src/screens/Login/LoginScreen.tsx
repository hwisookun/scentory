import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import {
  COLORS, SPACING, SHADOW, BORDER_RADIUS,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN, BUTTON_HEIGHT,
} from '../../constants/theme';
import { HyangiAvatar } from '../../components/common/HyangiAvatar';
import { signInWithApple, signInWithKakao, signInWithNaver } from '../../lib/auth';
import type { SocialAuthResult } from '../../lib/auth';

// Two-tone logotype: 맡(primaryInk) · 다(primaryDeep) · filled dot
function Logotype({ size = 52 }: { size?: number }) {
  const dotSize = Math.round(size * 0.2);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text style={{ fontSize: size, fontWeight: FONT_WEIGHTS.black, color: COLORS.primaryInk,
        letterSpacing: -2, lineHeight: size * 1.1 }}>맡</Text>
      <Text style={{ fontSize: size, fontWeight: FONT_WEIGHTS.black, color: COLORS.primaryDeep,
        letterSpacing: -2, lineHeight: size * 1.1 }}>다</Text>
      <View style={{ width: dotSize, height: dotSize, borderRadius: 9999,
        backgroundColor: COLORS.primaryInk, marginLeft: 2, marginBottom: Math.round(size * 0.08),
        shadowColor: '#3F7A53', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 0,
        elevation: 2 }} />
    </View>
  );
}

// 카카오 공식 말풍선 로고. SDK 의존을 피하기 위해 View로 단순 모사.
function KakaoBubble({ size = 18 }: { size?: number }) {
  return (
    <View style={{
      width: size, height: size * 0.86, borderRadius: size * 0.36,
      backgroundColor: COLORS.kakaoText,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.66, fontWeight: FONT_WEIGHTS.black, color: COLORS.kakao, marginTop: -1 }}>
        K
      </Text>
    </View>
  );
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const loginWithSocial = useAppStore((s) => s.loginWithSocial);
  const loginAsGuest = useAppStore((s) => s.loginAsGuest);
  const [busy, setBusy] = useState<'apple' | 'kakao' | 'naver' | null>(null);

  const goNext = () => {
    const isCompleted = useAppStore.getState().onboarding.isCompleted;
    navigation.reset({ index: 0, routes: [{ name: isCompleted ? 'Main' : 'Onboarding' }] });
  };

  const handleResult = (
    provider: 'apple' | 'kakao' | 'naver',
    result: SocialAuthResult,
  ) => {
    if (result.status === 'cancel') return; // 조용히 무시
    if (result.status === 'error') {
      Alert.alert('로그인 실패', result.message);
      return;
    }
    loginWithSocial(provider, {
      id: result.profile.providerUserId,
      nickname: result.profile.nickname,
      email: result.profile.email,
    });
    goNext();
  };

  const onApple = async () => {
    if (busy) return;
    setBusy('apple');
    try {
      handleResult('apple', await signInWithApple());
    } finally {
      setBusy(null);
    }
  };
  const onKakao = async () => {
    if (busy) return;
    setBusy('kakao');
    try {
      handleResult('kakao', await signInWithKakao());
    } finally {
      setBusy(null);
    }
  };
  const onNaver = async () => {
    if (busy) return;
    setBusy('naver');
    try {
      handleResult('naver', await signInWithNaver());
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.secondary, COLORS.background]}
        locations={[0, 0.4, 0.75]}
        style={styles.gradientBg}
      >
        <View style={styles.hero}>
          <HyangiAvatar size={130} bob sparkles />
          <View style={{ marginTop: SPACING.md }}>
            <Logotype size={52} />
          </View>
          <Text style={styles.tagline}>나의 향, 나의 기억</Text>
          <Text style={styles.desc}>나에게 꼭 맞는 향수를 찾아보세요</Text>
        </View>

        <View style={styles.buttons}>
          {/* Apple (iOS 전용) — Apple HIG 준수: 네이티브 버튼 컴포넌트 사용 */}
          {Platform.OS === 'ios' && (
            <View style={styles.appleWrap}>
              {busy === 'apple' ? (
                <View style={[styles.btn, styles.appleBusy]}>
                  <ActivityIndicator color={COLORS.white} />
                </View>
              ) : (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={BORDER_RADIUS.md}
                  style={styles.appleNative}
                  onPress={onApple}
                />
              )}
            </View>
          )}

          {/* Kakao */}
          <TouchableOpacity
            style={[styles.btn, styles.kakaoBtn, busy === 'kakao' && styles.btnBusy]}
            onPress={onKakao}
            activeOpacity={0.85}
            disabled={busy !== null}
          >
            {busy === 'kakao' ? (
              <ActivityIndicator color={COLORS.kakaoText} />
            ) : (
              <>
                <KakaoBubble size={18} />
                <Text style={styles.kakaoBtnText}>카카오로 계속하기</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Naver */}
          <TouchableOpacity
            style={[styles.btn, styles.naverBtn, busy === 'naver' && styles.btnBusy]}
            onPress={onNaver}
            activeOpacity={0.85}
            disabled={busy !== null}
          >
            {busy === 'naver' ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <View style={styles.naverIconBox}>
                  <Text style={styles.naverIconText}>N</Text>
                </View>
                <Text style={styles.naverBtnText}>네이버로 계속하기</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => { loginAsGuest(); goNext(); }}
            activeOpacity={0.7}
            disabled={busy !== null}
          >
            <Text style={styles.guestBtnText}>우선 들어갈래요 →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          계속 진행하면{' '}
          <Text style={styles.termsLink}>이용약관</Text>과{' '}
          <Text style={styles.termsLink}>개인정보처리방침</Text>에{'\n'}
          동의하는 것으로 간주됩니다.
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBg: { flex: 1, paddingHorizontal: SPACING.lg },
  hero: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: SPACING.xl, paddingBottom: SPACING.lg, gap: 14,
  },
  tagline: {
    fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: LINE_HEIGHTS.body,
  },
  desc: {
    fontSize: FONT_SIZES.small, color: COLORS.textLight, textAlign: 'center',
  },
  buttons: { gap: SPACING.sm, marginBottom: SPACING.md },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: BUTTON_HEIGHT.lg, borderRadius: BORDER_RADIUS.md, gap: SPACING.sm,
  },
  btnBusy: { opacity: 0.7 },

  // Apple — 네이티브 컴포넌트가 자체 렌더링하므로 width/height만 지정
  appleWrap: { width: '100%' },
  appleNative: { width: '100%', height: BUTTON_HEIGHT.lg },
  appleBusy: { backgroundColor: '#000000' },

  // Kakao — 공식 가이드: 노란색 #FEE500 배경 + 검정 텍스트 + 말풍선
  kakaoBtn: { backgroundColor: COLORS.kakao, ...SHADOW.sm },
  kakaoBtnText: { fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.kakaoText },

  // Naver — 공식 그린 #03C75A + 흰색 N 박스
  naverBtn: { backgroundColor: COLORS.naver, ...SHADOW.sm },
  naverIconBox: { width: 20, height: 20, borderRadius: 4, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center' },
  naverIconText: { fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.black, color: COLORS.naver, lineHeight: 14 },
  naverBtnText: { fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },

  guestBtn: { alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, minHeight: TOUCH_TARGET_MIN },
  guestBtnText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  terms: { fontSize: FONT_SIZES.caption, color: COLORS.textLight, textAlign: 'center',
    marginBottom: SPACING.lg, lineHeight: LINE_HEIGHTS.caption * 1.5 },
  termsLink: { textDecorationLine: 'underline', color: COLORS.textSecondary },
});
