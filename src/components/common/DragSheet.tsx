import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Modal, Dimensions, Keyboard,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import {
  GestureHandlerRootView, Gesture, GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';
import { SPRING, TIMING } from '../../constants/motion';
import { haptic } from '../../lib/haptic';

interface DragSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // 시트 최대 높이 (기본: 화면의 88%)
  maxHeightRatio?: number;
  // 드래그로 닫히는 임계점 (기본: 화면 높이의 22%)
  dismissDistanceRatio?: number;
  // 속도 기반 dismiss (기본: 800 px/s 이상)
  dismissVelocity?: number;
}

const SCREEN_H = Dimensions.get('window').height;

/**
 * 토스 스타일 드래그-닫기 시트.
 * - 손가락을 따라 시트가 따라옴
 * - Release 시 거리 또는 속도 기반으로 dismiss/스냅 결정
 * - 백드롭 fade + 탭으로 닫기
 * - 키보드 보호 (iOS padding, Android resize)
 */
export const DragSheet: React.FC<DragSheetProps> = ({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.88,
  dismissDistanceRatio = 0.22,
  dismissVelocity = 800,
}) => {
  const [mounted, setMounted] = useState(false);
  const translateY = useSharedValue(SCREEN_H);
  const backdropOpacity = useSharedValue(0);

  const dismissDistance = SCREEN_H * dismissDistanceRatio;
  const maxH = SCREEN_H * maxHeightRatio;

  // 열기/닫기 라이프사이클
  useEffect(() => {
    if (visible) {
      setMounted(true);
      // 다음 프레임에서 애니메이션 시작 — 레이아웃 잡힌 직후
      requestAnimationFrame(() => {
        translateY.value = withSpring(0, SPRING.gentle);
        backdropOpacity.value = withTiming(1, TIMING.base);
      });
    } else if (mounted) {
      Keyboard.dismiss();
      translateY.value = withTiming(SCREEN_H, { duration: 240 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
      backdropOpacity.value = withTiming(0, TIMING.fast);
    }
  }, [visible]);

  const close = () => {
    onClose();
  };

  // 시트 본체 pan gesture
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        // 드래그 진행에 따라 백드롭도 살짝 흐려짐
        const progress = Math.min(e.translationY / SCREEN_H, 1);
        backdropOpacity.value = 1 - progress * 0.6;
      }
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > dismissDistance || e.velocityY > dismissVelocity;

      if (shouldDismiss) {
        translateY.value = withTiming(SCREEN_H, { duration: 220 }, (finished) => {
          if (finished) runOnJS(close)();
        });
        backdropOpacity.value = withTiming(0, { duration: 220 });
        runOnJS(haptic)('light');
      } else {
        translateY.value = withSpring(0, SPRING.snappy);
        backdropOpacity.value = withTiming(1, TIMING.fast);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={close}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          pointerEvents="box-none"
        >
          {/* 백드롭 */}
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={{ flex: 1 }} onPress={close} />
          </Animated.View>

          {/* 시트 */}
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[styles.sheet, { maxHeight: maxH }, sheetStyle]}
            >
              <View style={styles.handleWrap}>
                <View style={styles.handle} />
              </View>
              {children}
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: 8,
    // 살짝 떠 있는 느낌
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
  },
});
