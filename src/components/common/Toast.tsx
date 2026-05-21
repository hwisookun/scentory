import React, { useEffect } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import {
  COLORS, BORDER_RADIUS, SPACING,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
} from '../../constants/theme';
import { SPRING, TIMING } from '../../constants/motion';

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

export const Toast: React.FC = () => {
  const { toast, hideToast } = useAppStore();
  const insets = useSafeAreaInsets();

  // 진입/이탈 방향 추적: y(아래→위 슬라이드 인), x(스와이프-닫기)
  const translateY = useSharedValue(40);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast.visible) {
      // entry: 스프링으로 위로 떠오르며 fade in
      translateX.value = 0;
      translateY.value = withSpring(0, SPRING.gentle);
      opacity.value = withTiming(1, TIMING.fast);
    } else {
      // exit: 천천히 내려가며 fade out
      translateY.value = withTiming(40, { duration: 220 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [toast.visible]);

  // 좌/우 스와이프로 즉시 닫기
  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      // 멀리 끌수록 옅어짐
      opacity.value = Math.max(0.3, 1 - Math.abs(e.translationX) / (SCREEN_W * 0.6));
    })
    .onEnd((e) => {
      const dismissed =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > 700;
      if (dismissed) {
        // 끌린 방향으로 화면 밖까지 보내고 → 상태 정리
        const dir = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(dir * SCREEN_W, { duration: 180 });
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) runOnJS(hideToast)();
        });
      } else {
        // 원위치 스프링 백
        translateX.value = withSpring(0, SPRING.snappy);
        opacity.value = withTiming(1, TIMING.fast);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  if (!toast.message) return null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.container,
          { bottom: 62 + Math.max(insets.bottom, 8) + 16 },
          animatedStyle,
        ]}
      >
        <Text style={styles.text}>{toast.message}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    maxWidth: '80%',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
