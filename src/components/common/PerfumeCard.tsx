import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Perfume } from '../../types';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW, SCENT_COLORS, SCENT_TEXT_COLORS,
  FONT_WEIGHTS, FONT_SIZES,
} from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { PressableScale } from './PressableScale';
import { WishlistHeart } from './WishlistHeart';
import { ContextMenu, ContextAction } from './ContextMenu';
import { haptic } from '../../lib/haptic';

interface PerfumeCardProps {
  perfume: Perfume;
  onPress: () => void;
  style?: object;
  // 추가 컨텍스트 메뉴 액션 (long-press 메뉴에 더 추가됨)
  extraActions?: ContextAction[];
}

/**
 * Illustrated bottle silhouette — built from Views.
 * Cap → neck → body with highlight stripe, tinted by the first scent tag's fg color.
 */
export function BottleGlyph({ perfume, size = 58 }: { perfume: Perfume; size?: number }) {
  const h = Math.round(size * 1.45);
  const tagColor = SCENT_TEXT_COLORS[perfume.tags[0]];
  // Use tag's foreground color at low opacity for a tinted "glass" body
  const bodyTint = tagColor
    ? `${tagColor}38`
    : 'rgba(31,74,53,0.22)';

  return (
    <View style={{ width: size, height: h }}>
      {/* Cap */}
      <View style={{ position: 'absolute', top: 0, alignSelf: 'center',
        width: Math.round(size * 0.48), height: Math.round(size * 0.17),
        backgroundColor: 'rgba(31,74,53,0.55)', borderRadius: 3 }} />
      {/* Neck */}
      <View style={{ position: 'absolute', top: Math.round(size * 0.17), alignSelf: 'center',
        width: Math.round(size * 0.58), height: Math.round(size * 0.09),
        backgroundColor: 'rgba(31,74,53,0.35)', borderRadius: 1 }} />
      {/* Body */}
      <View style={{ position: 'absolute', top: Math.round(size * 0.24), alignSelf: 'center',
        width: Math.round(size * 0.90), height: Math.round(size * 1.20),
        backgroundColor: bodyTint, borderRadius: 8 }} />
      {/* Highlight stripe */}
      <View style={{ position: 'absolute', top: Math.round(size * 0.34),
        left: Math.round(size * 0.14),
        width: Math.round(size * 0.17), height: Math.round(size * 0.82),
        backgroundColor: '#fff', opacity: 0.45, borderRadius: 9999 }} />
    </View>
  );
}

export const PerfumeCard: React.FC<PerfumeCardProps> = React.memo(({ perfume, onPress, style, extraActions }) => {
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const wishlisted = useAppStore((s) => s.wishlist.some((w) => w.perfume_id === perfume.id));
  const [menuOpen, setMenuOpen] = useState(false);

  const volume = '50ml';

  const actions: ContextAction[] = [
    {
      icon: wishlisted ? 'heart-dislike-outline' : 'heart-outline',
      label: wishlisted ? '위시리스트에서 빼기' : '위시리스트에 담기',
      onPress: () => toggleWishlist(perfume),
    },
    ...(extraActions ?? []),
    {
      icon: 'share-outline',
      label: '공유하기',
      onPress: () => { /* 공유 — 추후 연동 */ },
    },
    {
      icon: 'sparkles-outline',
      label: '비슷한 향 보기',
      onPress: onPress,
    },
  ];

  const openMenu = () => {
    haptic('medium');
    setMenuOpen(true);
  };

  return (
    <>
    <PressableScale
      style={[styles.card, style]}
      onPress={onPress}
      onLongPress={openMenu}
      scaleTo={0.97}
    >
      {/* Image area — illustrated bottle on mint gradient */}
      <LinearGradient
        colors={['#F0F8F3', '#DCF1E2']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageContainer}
      >
        <BottleGlyph perfume={perfume} size={54} />

        {/* Niche badge */}
        {perfume.brand.isNiche && (
          <View style={styles.nicheBadge}>
            <Text style={styles.nicheBadgeText}>니치</Text>
          </View>
        )}
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        {/* Brand eyebrow */}
        <Text style={styles.brand} numberOfLines={1}>{perfume.brand.name}</Text>

        {/* Name + Heart */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{perfume.name}</Text>
          <WishlistHeart
            active={wishlisted}
            onToggle={() => toggleWishlist(perfume)}
            size={18}
            containerSize={30}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </View>

        {/* Concentration subtitle */}
        <Text style={styles.concentration} numberOfLines={1}>{perfume.concentration}</Text>

        {/* Tags */}
        <View style={styles.tagRow}>
          {perfume.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: SCENT_COLORS[tag] ?? COLORS.gray100 }]}>
              <Text style={[styles.tagText, { color: SCENT_TEXT_COLORS[tag] ?? COLORS.gray600 }]}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer: rating left, price right */}
        <View style={styles.footer}>
          {perfume.rating != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={COLORS.star} />
              <Text style={styles.rating}>{perfume.rating.toFixed(1)}</Text>
              {perfume.review_count != null && (
                <Text style={styles.reviewCount}>
                  ({perfume.review_count >= 1000
                    ? `${(perfume.review_count / 1000).toFixed(1)}k`
                    : perfume.review_count})
                </Text>
              )}
            </View>
          )}
          <View style={styles.priceBlock}>
            <Text style={styles.volumeLabel}>{volume}</Text>
            <Text style={styles.price} numberOfLines={1}>
              {perfume.price_krw.toLocaleString()}<Text style={styles.priceUnit}>원</Text>
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
    <ContextMenu
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      title={perfume.name}
      actions={actions}
    />
    </>
  );
});
PerfumeCard.displayName = 'PerfumeCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(111,184,143,0.10)',
    // composite shadow: subtle surface lift + soft ambient
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 3,
  },
  imageContainer: {
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nicheBadge: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOW.sm,
  },
  nicheBadgeText: { color: COLORS.white, fontSize: FONT_SIZES.eyebrow, fontWeight: FONT_WEIGHTS.extrabold, letterSpacing: 0.3 },
  info: { padding: SPACING.md - 2 },
  brand: {
    fontSize: FONT_SIZES.eyebrow,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZES.bodyLg,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  heartButton: {
    width: 30,
    height: 30,
    borderRadius: 9999, // 완전한 원형 강제
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  concentration: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
    marginBottom: SPACING.sm + 2,
  },
  tagRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm + 4, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  tagText: { fontSize: FONT_SIZES.eyebrow, fontWeight: FONT_WEIGHTS.bold, lineHeight: 13 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: -(SPACING.md - 2), marginBottom: SPACING.sm + 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 1 },
  rating: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.bold },
  reviewCount: { fontSize: FONT_SIZES.caption, color: COLORS.gray400, fontWeight: FONT_WEIGHTS.regular },
  priceBlock: { alignItems: 'flex-end', marginLeft: 'auto' },
  volumeLabel: {
    fontSize: 9, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textLight,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 1,
  },
  price: {
    fontSize: FONT_SIZES.h4, fontWeight: FONT_WEIGHTS.black, color: COLORS.text,
    letterSpacing: -0.4, lineHeight: 18,
  },
  priceUnit: { fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textSecondary },
});
