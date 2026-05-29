import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
} from '../../../constants/theme';
import type { Brand } from '../../../types';

const BRAND_TINTS: ReadonlyArray<readonly [string, string]> = [
  ['#F0F8F3', '#DCF1E2'], // mint
  ['#FFF3E0', '#FFE0B2'], // warm beige
  ['#EDE7F6', '#D1C4E9'], // soft purple
  ['#E3F2FD', '#BBDEFB'], // soft blue
  ['#FCE4EC', '#F8BBD0'], // soft pink
  ['#FFF9C4', '#FFF59D'], // soft yellow
];

function brandInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface CardProps {
  brand: Brand;
  index: number;
  scrollY: Animated.Value;
  onPress: () => void;
}

const BrandCard: React.FC<CardProps> = ({ brand, index, scrollY, onPress }) => {
  const ref = useRef<View>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const tY = useRef(new Animated.Value(28)).current;
  const revealedRef = useRef(false);

  const reveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(tY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 60 }),
    ]).start();
  };

  // measureInWindow로 카드 상단이 화면 안으로 들어왔는지 검사 — host View면 항상 동작.
  const check = () => {
    if (revealedRef.current || ref.current == null) return;
    ref.current.measureInWindow((_x, y, _w, h) => {
      if (typeof y !== 'number') return;
      const windowH = Dimensions.get('window').height;
      if (y < windowH * 0.92 && y + (h ?? 0) > 0) reveal();
    });
  };

  useEffect(() => {
    const id = scrollY.addListener(() => check());
    return () => scrollY.removeListener(id);
  }, []);

  const handleLayout = () => {
    // 이미 화면에 떠 있는 카드용 초기 한 번 검사
    requestAnimationFrame(check);
  };

  const [bgA, bgB] = BRAND_TINTS[index % BRAND_TINTS.length];

  return (
    <View ref={ref} onLayout={handleLayout} style={styles.cardOuter}>
      <Animated.View style={[styles.card, { opacity, transform: [{ translateY: tY }] }]}>
        <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.cardInner}>
          <LinearGradient
            colors={[bgA, bgB]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoWrap}
          >
            <Text style={styles.monogram}>{brandInitials(brand.name)}</Text>
            {brand.isNiche && (
              <View style={styles.nicheBadge}>
                <Text style={styles.nicheText}>NICHE</Text>
              </View>
            )}
          </LinearGradient>
          <View style={styles.cardFooter}>
            <Text style={styles.cardName} numberOfLines={1}>{brand.name}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

interface GridProps {
  brands: Brand[];
  scrollY: Animated.Value;
  onPressBrand: (brandId: string) => void;
}

export const BrandGrid: React.FC<GridProps> = ({ brands, scrollY, onPressBrand }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>브랜드 둘러보기</Text>
      <Text style={styles.sectionSub}>스크롤로 더 보기</Text>
    </View>
    <View style={styles.grid}>
      {brands.map((b, i) => (
        <BrandCard
          key={b.id}
          brand={b}
          index={i}
          scrollY={scrollY}
          onPress={() => onPressBrand(b.id)}
        />
      ))}
    </View>
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cardOuter: { width: '48.5%' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(111,184,143,0.10)',
    ...SHADOW.md,
  },
  cardInner: { flex: 1 },
  logoWrap: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monogram: {
    fontSize: 34,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.primaryInk,
    letterSpacing: -1,
  },
  nicheBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  nicheText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.4,
  },
  cardFooter: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cardName: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
});
