import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
  interpolate, Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { SPRING } from '../../constants/motion';
import { haptic } from '../../lib/haptic';

interface WishlistHeartProps {
  active: boolean;
  onToggle: () => void;
  size?: number; // 아이콘 크기 (기본 18)
  containerSize?: number; // 원형 컨테이너 크기 (기본 30)
  withBorder?: boolean; // 원형 테두리 (기본 true)
  style?: StyleProp<ViewStyle>;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
}

/**
 * 위시리스트 하트 — 토스풍 celebration 애니메이션.
 * - 탭: 하트 scale 1 → 1.35 → 1 (스프링 오버슈트)
 * - 채워질 때: 6개 작은 하트 파티클이 방사형으로 burst 후 페이드아웃
 * - 모든 토글에 medium haptic
 */
export const WishlistHeart: React.FC<WishlistHeartProps> = ({
  active, onToggle, size = 18, containerSize = 30, withBorder = true, style, hitSlop,
}) => {
  const scale = useSharedValue(1);
  const burst = useSharedValue(0); // 0..1, 채워질 때만 트리거

  // active 상태가 바뀔 때마다 scale punch
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.35, { damping: 8, stiffness: 220, mass: 0.6 }),
      withSpring(1, SPRING.bouncy),
    );
    if (active) {
      // 채워질 때만 burst
      burst.value = 0;
      burst.value = withTiming(1, { duration: 520 });
    }
  }, [active]);

  const handlePress = () => {
    haptic(active ? 'light' : 'medium');
    onToggle();
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} hitSlop={hitSlop} style={style}>
      <View
        style={[
          styles.container,
          { width: containerSize, height: containerSize },
          withBorder && styles.containerBorder,
        ]}
      >
        {/* Burst 파티클 — 채워질 때만 잠깐 보임 */}
        {PARTICLE_ANGLES.map((angle, i) => (
          <BurstParticle key={i} angle={angle} burst={burst} size={size} />
        ))}

        <Animated.View style={iconStyle}>
          <Ionicons
            name={active ? 'heart' : 'heart-outline'}
            size={size}
            color={active ? COLORS.accentInk : COLORS.gray400}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
};

// 6방향 정렬된 파티클 (60도 간격)
const PARTICLE_ANGLES = [0, 60, 120, 180, 240, 300];

interface BurstParticleProps {
  angle: number;
  burst: SharedValue<number>;
  size: number;
}

const BurstParticle: React.FC<BurstParticleProps> = ({ angle, burst, size }) => {
  const style = useAnimatedStyle(() => {
    // burst 0 → 1 동안: distance 0→이동거리, opacity 1→0, scale 0.6→0
    const distance = interpolate(burst.value, [0, 1], [0, size * 1.2], Extrapolation.CLAMP);
    const opacity = interpolate(burst.value, [0, 0.15, 1], [0, 1, 0], Extrapolation.CLAMP);
    const s = interpolate(burst.value, [0, 0.3, 1], [0.4, 1, 0.3], Extrapolation.CLAMP);
    const rad = (angle * Math.PI) / 180;
    return {
      opacity,
      transform: [
        { translateX: Math.cos(rad) * distance },
        { translateY: Math.sin(rad) * distance },
        { scale: s },
      ],
    };
  });

  return (
    <Animated.View style={[styles.particle, style]} pointerEvents="none">
      <Ionicons name="heart" size={Math.max(6, size * 0.45)} color={COLORS.accentInk} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible', // 파티클이 컨테이너 밖으로 나갈 수 있도록
  },
  containerBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
});
