import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SPRING } from '../../constants/motion';
import { haptic } from '../../lib/haptic';
import type { HapticKind } from '../../constants/motion';

interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleTo?: number;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
  disabled?: boolean;
  // Haptic feedback intensity. Default: 'light'. Pass null to disable.
  haptic?: HapticKind | null;
}

/**
 * 토스 스타일 스프링 스케일 피드백 버튼.
 * - Reanimated v4 — UI thread에서 동작, 메인 스레드 부하 없음
 * - onPressIn → scale 0.96 + 가벼운 haptic
 * - onPressOut → scale 1.0 (스프링 settle)
 *
 * Sizing 키(width, flex, margin*)는 외곽 TouchableOpacity로 분리해
 * 퍼센트 너비가 올바른 flex 부모 기준으로 해석되도록 한다.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  onPress,
  onLongPress,
  style,
  children,
  scaleTo = 0.96,
  hitSlop,
  disabled,
  haptic: hapticKind = 'light',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = () => {
    scale.value = withSpring(scaleTo, SPRING.snappy);
    if (hapticKind) haptic(hapticKind);
  };
  const pressOut = () => {
    scale.value = withSpring(1, SPRING.bouncy);
  };

  // sizing/layout은 outer로, visual은 inner로 분리
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const SIZING_KEYS: (keyof ViewStyle)[] = [
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'alignSelf', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'marginHorizontal', 'marginVertical',
  ];
  const outerStyle: ViewStyle = {};
  const innerStyle: ViewStyle = { ...flat };
  for (const key of SIZING_KEYS) {
    if (flat[key] !== undefined) {
      (outerStyle as any)[key] = flat[key];
      delete (innerStyle as any)[key];
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      hitSlop={hitSlop}
      disabled={disabled}
      style={outerStyle}
    >
      <Animated.View style={[innerStyle, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};
