import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { COLORS, FONT_WEIGHTS, FONT_SIZES, LINE_HEIGHTS } from '../../constants/theme';
import { HyangiAvatar } from '../../components/common/HyangiAvatar';

interface Props {
  onFinish: () => void;
}

/**
 * Splash 시퀀스 (총 ~2.6s):
 * 1) 0ms — 그라데이션 배경만 표시 (정적)
 * 2) 150ms — Hyangi가 위에서 부드럽게 떨어지며 등장 + scale spring bounce
 * 3) 600ms — 로고 글자가 좌→우로 cascade fade-in (맡, 다, 점)
 * 4) 1100ms — 서브 카피 fade-in
 * 5) 2200ms — 전체 fade-out
 * 6) 2600ms — onFinish
 */
export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const outerOpacity = useSharedValue(1);

  // Hyangi
  const hyTranslate = useSharedValue(-60);
  const hyScale = useSharedValue(0.7);
  const hyOpacity = useSharedValue(0);

  // 로고 글자 3개 (맡 / 다 / 점)
  const ch1 = useSharedValue(0);
  const ch2 = useSharedValue(0);
  const ch3 = useSharedValue(0);

  const sub = useSharedValue(0);

  useEffect(() => {
    // 1. Hyangi 등장 (150ms 후)
    hyTranslate.value = withDelay(150, withSpring(0, { damping: 12, stiffness: 100, mass: 1 }));
    hyScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 140 }));
    hyOpacity.value = withDelay(150, withTiming(1, { duration: 320 }));

    // 2. 로고 글자 cascade (600ms)
    ch1.value = withDelay(600, withTiming(1, { duration: 360, easing: Easing.out(Easing.back(1.6)) }));
    ch2.value = withDelay(720, withTiming(1, { duration: 360, easing: Easing.out(Easing.back(1.6)) }));
    ch3.value = withDelay(840, withSpring(1, { damping: 9, stiffness: 200 }));

    // 3. 서브 카피 (1100ms)
    sub.value = withDelay(1100, withTiming(1, { duration: 400 }));

    // 4. 전체 fade-out (2200ms) → 2600ms에 onFinish
    outerOpacity.value = withDelay(
      2200,
      withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) scheduleOnRN(onFinish);
      })
    );
  }, []);

  const outerStyle = useAnimatedStyle(() => ({ opacity: outerOpacity.value }));
  const hyStyle = useAnimatedStyle(() => ({
    opacity: hyOpacity.value,
    transform: [{ translateY: hyTranslate.value }, { scale: hyScale.value }],
  }));
  const ch1Style = useAnimatedStyle(() => ({
    opacity: ch1.value,
    transform: [{ translateY: (1 - ch1.value) * 14 }],
  }));
  const ch2Style = useAnimatedStyle(() => ({
    opacity: ch2.value,
    transform: [{ translateY: (1 - ch2.value) * 14 }],
  }));
  const ch3Style = useAnimatedStyle(() => ({
    opacity: ch3.value,
    transform: [{ scale: 0.4 + ch3.value * 0.6 }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: sub.value,
    transform: [{ translateY: (1 - sub.value) * 6 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, outerStyle]}>
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.secondary, COLORS.background]}
        locations={[0, 0.45, 0.85]}
        style={styles.container}
      >
        <View style={styles.content}>
          <Animated.View style={hyStyle}>
            <HyangiAvatar size={140} bob sparkles />
          </Animated.View>

          <View style={styles.logotype}>
            <Animated.Text style={[styles.logoChar, { color: COLORS.primaryInk }, ch1Style]}>맡</Animated.Text>
            <Animated.Text style={[styles.logoChar, { color: COLORS.primaryDeep }, ch2Style]}>다</Animated.Text>
            <Animated.View style={[styles.logoDot, ch3Style]} />
          </View>

          <Animated.Text style={[styles.sub, subStyle]}>나의 향, 나의 기억</Animated.Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', gap: 14 },
  logotype: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  logoChar: {
    fontSize: 56,
    fontWeight: FONT_WEIGHTS.black,
    letterSpacing: -2,
    lineHeight: 60,
  },
  logoDot: {
    width: 11,
    height: 11,
    borderRadius: 9999,
    backgroundColor: COLORS.primaryInk,
    marginLeft: 3,
    marginBottom: 7,
    shadowColor: '#3F7A53',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },
  sub: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    lineHeight: LINE_HEIGHTS.body,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
