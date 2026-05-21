import React, { useEffect, useState, useRef } from 'react';
import {
  Modal, View, Image, Pressable, StyleSheet, FlatList,
  useWindowDimensions, Text,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { SPRING } from '../../constants/motion';

interface ImageViewerProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

/**
 * 풀스크린 이미지 뷰어.
 * - 좌/우 스와이프로 이미지 간 전환 (FlatList paging)
 * - 위/아래 스와이프로 dismiss (배경 fade)
 * - 우상단 X 버튼 / Android back / 백드롭 영역 탭으로도 닫힘
 * - 페이지 인디케이터 (이미지 2장 이상일 때)
 */
export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible, images, initialIndex = 0, onClose,
}) => {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIndex(initialIndex);
      translateY.value = 0;
      opacity.value = withTiming(1, { duration: 220 });
    } else if (mounted) {
      opacity.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
      translateY.value = withTiming(0, { duration: 180 });
    }
  }, [visible]);

  // 위/아래 드래그로 dismiss — 가로 스와이프(FlatList paging)와 충돌 안 나도록
  // activeOffsetY로 vertical만 활성, failOffsetX로 horizontal에 양보
  const dismissPan = Gesture.Pan()
    .activeOffsetY([-14, 14])
    .failOffsetX([-12, 12])
    .onUpdate((e) => {
      translateY.value = e.translationY;
      const progress = Math.min(Math.abs(e.translationY) / (H * 0.5), 1);
      opacity.value = 1 - progress * 0.85;
    })
    .onEnd((e) => {
      const dismissed =
        Math.abs(e.translationY) > H * 0.18 ||
        Math.abs(e.velocityY) > 800;
      if (dismissed) {
        const dir = e.translationY >= 0 ? 1 : -1;
        translateY.value = withTiming(dir * H, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) scheduleOnRN(onClose);
        });
      } else {
        translateY.value = withSpring(0, SPRING.snappy);
        opacity.value = withSpring(1, SPRING.snappy);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const onMomentumScrollEnd = (e: any) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / W);
    if (next !== index) setIndex(next);
  };

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <GestureDetector gesture={dismissPan}>
          <Animated.View style={[styles.stage, stageStyle]}>
            <FlatList
              ref={listRef}
              data={images}
              horizontal
              pagingEnabled
              keyExtractor={(uri) => uri}
              initialScrollIndex={initialIndex}
              getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <View style={[styles.page, { width: W, height: H }]}>
                  <Image
                    source={{ uri: item }}
                    style={{ width: W, height: H * 0.84 }}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
          </Animated.View>
        </GestureDetector>

        {/* 닫기 버튼 */}
        <Pressable
          style={[styles.closeBtn, { top: insets.top + 8 }]}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={24} color={COLORS.white} />
        </Pressable>

        {/* 페이지 인디케이터 */}
        {images.length > 1 && (
          <View style={[styles.counter, { bottom: insets.bottom + 18 }]}>
            <Text style={styles.counterText}>
              {index + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  stage: { flex: 1 },
  page: { justifyContent: 'center', alignItems: 'center' },
  closeBtn: {
    position: 'absolute',
    right: 14,
    width: 40, height: 40,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  counterText: { color: COLORS.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
});
