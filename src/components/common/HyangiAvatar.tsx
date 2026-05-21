import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, Easing,
} from 'react-native-reanimated';

interface HyangiAvatarProps {
  size?: number;
  bob?: boolean;
  sparkles?: boolean;
}

/**
 * Hyangi 마스코트 — claude_design/assets/hyangi-avatar.svg 스펙을 정확히 구현.
 * - 단일 SVG로 렌더링 → 픽셀 hitbox 이슈 없음, 어떤 크기에서도 선명
 * - 굵은 3.6px 외곽선(상대 비율 유지), 평면 컬러, 4개 디테일만(잎·눈·입·볼)
 * - bob: 부드러운 위/아래 호흡 (UI 스레드)
 * - sparkles: 좌우 별 반짝임 (UI 스레드)
 */
export const HyangiAvatar: React.FC<HyangiAvatarProps> = ({
  size = 80,
  bob = false,
  sparkles = false,
}) => {
  const bobY = useSharedValue(0);
  const sparkA = useSharedValue(0);
  const sparkB = useSharedValue(0);
  const sparkC = useSharedValue(0);

  useEffect(() => {
    if (bob) {
      bobY.value = withRepeat(
        withSequence(
          withTiming(-Math.max(2, size * 0.045), { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }
    if (sparkles) {
      const loop = (val: typeof sparkA, delay: number) => {
        val.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
            ),
            -1,
            false,
          ),
        );
      };
      loop(sparkA, 0);
      loop(sparkB, 500);
      loop(sparkC, 1000);
    }
  }, [bob, sparkles, size]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value }],
  }));

  const sparkStyleA = useAnimatedStyle(() => ({
    opacity: sparkA.value * 0.9,
    transform: [{ scale: 0.6 + sparkA.value * 0.5 }],
  }));
  const sparkStyleB = useAnimatedStyle(() => ({
    opacity: sparkB.value * 0.9,
    transform: [{ scale: 0.6 + sparkB.value * 0.5 }],
  }));
  const sparkStyleC = useAnimatedStyle(() => ({
    opacity: sparkC.value * 0.9,
    transform: [{ scale: 0.6 + sparkC.value * 0.5 }],
  }));

  const containerH = Math.round(size * 1.06);

  return (
    <View style={[styles.container, { width: size, height: containerH }]}>
      {sparkles && (
        <>
          <Animated.View style={[styles.sparkleAbs, { top: size * 0.04, left: -size * 0.02 }, sparkStyleA]}>
            <Sparkle size={size * 0.14} color="#5A9E72" />
          </Animated.View>
          <Animated.View style={[styles.sparkleAbs, { top: size * 0.22, right: -size * 0.02 }, sparkStyleB]}>
            <Sparkle size={size * 0.12} color="#3F7A53" />
          </Animated.View>
          <Animated.View style={[styles.sparkleAbs, { top: size * 0.56, left: -size * 0.04 }, sparkStyleC]}>
            <Sparkle size={size * 0.10} color="#7DBE91" />
          </Animated.View>
        </>
      )}

      <Animated.View style={bobStyle}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          {/* 바닥 그림자 */}
          <Ellipse cx="100" cy="186" rx="48" ry="5" fill="#1F3A2A" opacity={0.12} />
          {/* 달걀 몸통 */}
          <Path
            d="M100 28 C 56 28, 30 70, 30 118 C 30 162, 58 188, 100 188 C 142 188, 170 162, 170 118 C 170 70, 144 28, 100 28 Z"
            fill="#F2FBF5"
            stroke="#1F3A2A"
            strokeWidth={3.6}
          />
          {/* 잎 + 줄기 */}
          <G transform="translate(100 26)">
            <Path
              d="M0 4 Q -2 -2 2 -8"
              stroke="#1F3A2A"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M2 -8 Q 22 -16 22 -2 Q 14 6 2 -8 Z"
              fill="#7DBE91"
              stroke="#1F3A2A"
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <Path
              d="M4 -7 Q 12 -5 20 -3"
              stroke="#1F3A2A"
              strokeWidth={1.4}
              fill="none"
              strokeLinecap="round"
              opacity={0.5}
            />
          </G>
          {/* 볼 (blush) */}
          <Circle cx="60" cy="118" r="10" fill="#FFB3A1" opacity={0.85} />
          <Circle cx="140" cy="118" r="10" fill="#FFB3A1" opacity={0.85} />
          {/* 눈 */}
          <Circle cx="78" cy="106" r="7" fill="#1F3A2A" />
          <Circle cx="122" cy="106" r="7" fill="#1F3A2A" />
          {/* 입 (호 형태 미소) */}
          <Path
            d="M93 128 Q 100 138 107 128"
            stroke="#1F3A2A"
            strokeWidth={3.6}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const Sparkle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2 L13 10 L21 12 L13 14 L12 22 L11 14 L3 12 L11 10 Z"
      fill={color}
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  sparkleAbs: { position: 'absolute' },
});
