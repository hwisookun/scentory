import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { SPRING, TIMING } from '../../constants/motion';
import { haptic } from '../../lib/haptic';

export interface ContextAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  color?: string;
}

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ContextAction[];
}

/**
 * 토스 스타일 컨텍스트 메뉴.
 * - 백드롭 blur + 어둠
 * - 메뉴: 화면 중앙에 스프링으로 zoom-in
 * - 액션 탭 시 light haptic + onPress + 자동 닫힘
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible, onClose, title, actions,
}) => {
  const [mounted, setMounted] = useState(false);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        scale.value = withSpring(1, SPRING.snappy);
        opacity.value = withTiming(1, TIMING.fast);
      });
    } else if (mounted) {
      scale.value = withTiming(0.9, { duration: 160 });
      opacity.value = withTiming(0, { duration: 160 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleAction = (action: ContextAction) => {
    haptic(action.destructive ? 'warning' : 'light');
    action.onPress();
    onClose();
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
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.menu, menuStyle]}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          )}
          {actions.map((action, i) => (
            <React.Fragment key={action.label}>
              {i > 0 && <View style={styles.divider} />}
              <Pressable
                onPress={() => handleAction(action)}
                style={({ pressed }) => [
                  styles.actionRow,
                  pressed && styles.actionRowPressed,
                ]}
              >
                <Ionicons
                  name={action.icon}
                  size={18}
                  color={action.color ?? (action.destructive ? COLORS.error : COLORS.text)}
                />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: action.color ?? (action.destructive ? COLORS.error : COLORS.text),
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            </React.Fragment>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  menu: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 22,
    elevation: 16,
  },
  title: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg + 18 + SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    minHeight: TOUCH_TARGET_MIN + 4,
  },
  actionRowPressed: { backgroundColor: COLORS.gray100 },
  actionText: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
