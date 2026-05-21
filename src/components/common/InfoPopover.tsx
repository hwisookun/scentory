import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
} from '../../constants/theme';
import { SPRING, TIMING } from '../../constants/motion';
import { ScentInfo } from '../../lib/scentInfo';

interface InfoPopoverProps {
  visible: boolean;
  onClose: () => void;
  title: string;       // 예: '플로럴' / '베르가못'
  badge?: string;      // 예: '향 계열' / '탑 노트'
  badgeColor?: string;
  info: ScentInfo;
}

/**
 * macOS Quick Look 스타일의 상세 설명 팝오버.
 * - 굵은 제목 + 4개 섹션 (특징 / 뉘앙스 / 원료 / 주로 쓰임)
 * - 백드롭 BlurView + 어둠
 * - 카드 spring scale-in
 */
export const InfoPopover: React.FC<InfoPopoverProps> = ({
  visible, onClose, title, badge, badgeColor, info,
}) => {
  const [mounted, setMounted] = useState(false);
  const scale = useSharedValue(0.86);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        scale.value = withSpring(1, SPRING.snappy);
        opacity.value = withTiming(1, TIMING.fast);
      });
    } else if (mounted) {
      scale.value = withTiming(0.92, { duration: 160 });
      opacity.value = withTiming(0, { duration: 160 }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              {badge && (
                <View style={[styles.badge, badgeColor ? { backgroundColor: badgeColor + '22' } : null]}>
                  <Text style={[styles.badgeText, badgeColor ? { color: badgeColor } : null]}>{badge}</Text>
                </View>
              )}
              <Text style={styles.title}>{title}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={COLORS.gray600} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>{info.description}</Text>

            <Section label="뉘앙스 · 무드" body={info.nuance} />
            <Section label="원료 · 추출원" body={info.origin} />
            <Section label="주로 쓰이는 곳" body={info.usage} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const Section: React.FC<{ label: string; body: string }> = ({ label, body }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <Text style={styles.sectionBody}>{body}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.34)' },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '78%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryInk,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: FONT_SIZES.bodyLg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.bodyLg * 1.4,
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.bodySm * 1.55,
  },
});
