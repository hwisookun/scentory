import React from 'react';
import {
  Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import {
  COLORS, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, BUTTON_HEIGHT,
} from '../../constants/theme';
import type { HapticKind } from '../../constants/motion';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: HapticKind | null;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// claude_design 임베딩 기준 버튼 (claude_design/preview/buttons.html)
//  - primary: 파스텔 그라디언트(#BCE0CA→#A8D5BA) + 진녹색 텍스트 + 상단 inset 하이라이트 + 컬러 섀도우
//  - outline: 흰 배경 + primaryInk 텍스트 + 연한 그린 보더
//  - ghost: 투명 + textSecondary
// 앱 전체 primary CTA를 이 컴포넌트로 통일한다.
const PRIMARY_GRADIENT = ['#BCE0CA', '#A8D5BA'] as const;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight = false,
  disabled = false,
  loading = false,
  fullWidth = true,
  haptic = 'light',
  style,
  textStyle,
}) => {
  const minHeight = size === 'lg' ? BUTTON_HEIGHT.lg : BUTTON_HEIGHT.md;
  const isInert = disabled || loading;

  const textColor =
    variant === 'primary'
      ? (disabled ? '#9AACA4' : COLORS.primaryBtnText)
      : variant === 'outline'
      ? COLORS.primaryInk
      : COLORS.textSecondary;
  const iconColor = textColor;

  const Inner = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && !iconRight && <Ionicons name={icon} size={18} color={iconColor} />}
          <Text style={[styles.text, { color: textColor }, textStyle]} numberOfLines={1}>
            {title}
          </Text>
          {icon && iconRight && <Ionicons name={icon} size={18} color={iconColor} />}
        </>
      )}
    </>
  );

  // primary는 그라디언트(활성) 또는 회색(비활성) 서피스
  if (variant === 'primary') {
    return (
      <PressableScale
        onPress={isInert ? undefined : onPress}
        disabled={isInert}
        haptic={haptic}
        scaleTo={0.98}
        style={[
          styles.base,
          { minHeight, borderRadius: BORDER_RADIUS.lg },
          fullWidth && styles.fullWidth,
          !disabled && styles.primaryShadow,
          style,
        ]}
      >
        {disabled ? (
          <View style={[styles.fill, styles.disabledFill, { minHeight, borderRadius: BORDER_RADIUS.lg }]}>
            {Inner}
          </View>
        ) : (
          <LinearGradient
            colors={PRIMARY_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.fill, styles.primaryFill, { minHeight, borderRadius: BORDER_RADIUS.lg }]}
          >
            {Inner}
          </LinearGradient>
        )}
      </PressableScale>
    );
  }

  // outline / ghost
  return (
    <PressableScale
      onPress={isInert ? undefined : onPress}
      disabled={isInert}
      haptic={haptic}
      scaleTo={0.98}
      style={[
        styles.base,
        { minHeight, borderRadius: BORDER_RADIUS.lg },
        fullWidth && styles.fullWidth,
        variant === 'outline' && styles.outline,
        isInert && styles.inert,
        style,
      ]}
    >
      <View style={[styles.fill, { minHeight, borderRadius: BORDER_RADIUS.lg }]}>{Inner}</View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: { overflow: 'visible' },
  fullWidth: { width: '100%' },
  fill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  primaryFill: {
    // inset 하이라이트 근사 — 상단 얇은 흰 라인
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.55)',
  },
  primaryShadow: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  disabledFill: {
    backgroundColor: '#E3EBE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#C4E3D0',
  },
  inert: { opacity: 0.5 },
  text: {
    fontSize: FONT_SIZES.bodyLg,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.2,
  },
});
