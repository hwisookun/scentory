import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../store/useAppStore';
import { BottleGlyph } from '../../../components/common/PerfumeCard';
import { WishlistHeart } from '../../../components/common/WishlistHeart';
import {
  COLORS, SPACING, BORDER_RADIUS,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
} from '../../../constants/theme';
import type { Perfume } from '../../../types';

interface CardProps {
  perfume: Perfume;
  onPress: () => void;
}

const TodayCard: React.FC<CardProps> = ({ perfume, onPress }) => {
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const wishlisted = useAppStore((s) => s.wishlist.some((w) => w.perfume_id === perfume.id));
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <LinearGradient
        colors={['#F0F8F3', '#DCF1E2']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imgWrap}
      >
        <BottleGlyph perfume={perfume} size={48} />
        {perfume.brand.isNiche && (
          <View style={styles.nicheBadge}>
            <Text style={styles.nicheBadgeText}>니치</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.brand}>{perfume.brand.name}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{perfume.name}</Text>
          <WishlistHeart
            active={wishlisted}
            onToggle={() => toggleWishlist(perfume)}
            size={14}
            containerSize={28}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </View>
        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="star" size={11} color={COLORS.star} />
            <Text style={styles.ratingText}>{perfume.rating?.toFixed(1)}</Text>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.volumeLabel}>50ML</Text>
            <Text style={styles.price}>
              {perfume.price_krw.toLocaleString()}
              <Text style={styles.priceUnit}>원</Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface StripProps {
  perfumes: Perfume[];
  onPressPerfume: (perfumeId: string) => void;
}

export const TodayPerfumeStrip: React.FC<StripProps> = ({ perfumes, onPressPerfume }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>오늘의 향수</Text>
        <Text style={styles.sectionSub}>에디터 추천 ✨</Text>
      </View>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {perfumes.map((p) => (
        <TodayCard key={p.id} perfume={p} onPress={() => onPressPerfume(p.id)} />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: { padding: SPACING.md },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  sectionSub: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.small },

  list: {
    // 카드 그림자가 잘리지 않도록 상/하/좌/우 여백 확보
    paddingLeft: 4,
    paddingRight: SPACING.md,
    paddingTop: 4,
    paddingBottom: 12,
    gap: SPACING.md,
  },
  card: {
    width: 160, backgroundColor: COLORS.white,
    borderRadius: 22,
    // Android에서 elevation + overflow:'hidden' + borderWidth가 테두리를
    // 잘리게 만들기 때문에 overflow는 이미지 영역에만 적용.
    borderWidth: 1, borderColor: 'rgba(111,184,143,0.10)',
    shadowColor: '#1F4A35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  imgWrap: {
    height: 160,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  nicheBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.primaryDark, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  nicheBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: FONT_WEIGHTS.bold },
  info: { padding: SPACING.sm + 2 },
  brand: { fontSize: 10, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm,
    letterSpacing: -0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 1 },
  ratingText: { fontSize: FONT_SIZES.caption, color: COLORS.gray600, fontWeight: FONT_WEIGHTS.semibold },
  priceBlock: { alignItems: 'flex-end', marginLeft: 'auto' },
  volumeLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: -0.4,
    lineHeight: 18,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textSecondary,
  },
});
