import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface Props {
  size?: number;
  color?: string;
}

/**
 * 빈 상태용 살아있는 하트 일러스트:
 * - 무한 sway (위/아래 부드러운 호흡)
 * - 살짝의 회전 + 스케일 펄스
 */
export const EmptyHeartFloat: React.FC<Props> = ({ size = 88, color = COLORS.primaryLight }) => {
  const breathe = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    // 위/아래 호흡 — 2.6초 사이클
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    // 미세한 좌우 기울기 — 3.4초 사이클 (호흡과 비동기로 더 살아있는 느낌)
    tilt.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -6 + breathe.value * -10 }, // 위로 6~16px 떠올랐다가 내려옴
      { rotateZ: `${tilt.value * 4}deg` }, // ±4도
      { scale: 1 + breathe.value * 0.05 }, // 1.0 → 1.05
    ],
  }));

  return (
    <View style={[styles.wrap, { width: size + 16, height: size + 16 }]}>
      <Animated.View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Ionicons name="heart-outline" size={Math.round(size * 0.46)} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
