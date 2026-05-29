import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
} from '../../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.md * 2;
const AUTO_ROTATE_MS = 3500;

// 디자인 시스템: 배너는 단일 deep navy/plum 팔레트 — 탭 내 유일한 다크 서피스
const BANNERS = [
  {
    id: '1',
    badge: '신규 팝업',
    title: 'Maison Margiela\nReplica 시리즈',
    subtitle: '2025 봄 한정판 신규 입하',
    colors: [COLORS.bannerInk, '#3E6890'] as const,
  },
  {
    id: '2',
    badge: '이벤트',
    title: 'Jo Malone London\n플레그런스 위크',
    subtitle: '베스트 셀러 10% 할인',
    colors: [COLORS.bannerInk, '#3E6890'] as const,
  },
  {
    id: '3',
    badge: '에디터 추천',
    title: '지금 가장 사랑받는\n우디 향수 모음',
    subtitle: '에디터가 직접 고른 7선',
    colors: [COLORS.bannerInk, '#3E6890'] as const,
  },
];

interface Props {
  onViewAll: () => void;
}

export const BannerCarousel: React.FC<Props> = ({ onViewAll }) => {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % BANNERS.length;
        scrollRef.current?.scrollTo({ x: next * (BANNER_WIDTH + SPACING.md), animated: true });
        return next;
      });
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + SPACING.md}
        decelerationRate="fast"
        contentContainerStyle={styles.scroll}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + SPACING.md));
          setActive(index);
        }}
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity key={banner.id} activeOpacity={0.9}>
            <LinearGradient
              colors={banner.colors}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { width: BANNER_WIDTH }]}
            >
              {/* Ghosted bottle silhouette — decorative right side */}
              <View style={styles.ghostBottle} pointerEvents="none">
                <View style={{ width: 18, height: 8, backgroundColor: '#fff', borderRadius: 3, alignSelf: 'center', marginBottom: -1 }} />
                <View style={{ width: 22, height: 6, backgroundColor: '#fff', borderRadius: 2, alignSelf: 'center', marginBottom: -2 }} />
                <View style={{ width: 46, height: 78, backgroundColor: '#fff', borderRadius: 10, alignSelf: 'center' }} />
              </View>

              <View style={styles.badgeWrap}>
                <Text style={styles.badge}>{banner.badge}</Text>
              </View>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>

              <View style={styles.ctaRow}>
                <View style={styles.ctaPill}>
                  <Text style={styles.ctaText}>지금 보러가기</Text>
                  <View style={styles.ctaCircle}>
                    <Ionicons name="arrow-forward" size={14} color="#FFDAC9" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerSide} />
        <View style={styles.dots}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[styles.dot, active === i && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity
          onPress={onViewAll}
          style={styles.viewAllWrap}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAll}>전체보기</Text>
          <Ionicons name="chevron-forward" size={12} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: SPACING.md, marginBottom: SPACING.xs },
  scroll: { gap: SPACING.md },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 148,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...SHADOW.md,
  },
  ghostBottle: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.12,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: SPACING.sm,
  },
  badge: { color: COLORS.white, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold },
  title: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: FONT_WEIGHTS.black,
    lineHeight: 25,
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: FONT_SIZES.bodySm,
    lineHeight: LINE_HEIGHTS.bodySm,
    marginTop: SPACING.xs,
  },
  ctaRow: { flexDirection: 'row', marginTop: SPACING.md },
  ctaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFDAC9',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  ctaText: { fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.bold, color: COLORS.bannerInk },
  ctaCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.bannerInk,
    justifyContent: 'center', alignItems: 'center',
  },

  // dots를 정확히 가운데 두기 위한 좌측 스페이서
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.xs },
  footerSide: { width: 72 },
  viewAllWrap: { width: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  viewAll: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gray300 },
  dotActive: { width: 18, backgroundColor: COLORS.primaryDark },
});
