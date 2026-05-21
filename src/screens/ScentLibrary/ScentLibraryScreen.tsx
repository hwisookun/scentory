import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
  BORDER_RADIUS, SHADOW, SCENT_COLORS, SCENT_TEXT_COLORS,
} from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { Perfume, ScentTag } from '../../types';
import { getScentTagInfo } from '../../lib/scentInfo';
import { DragSheet } from '../../components/common/DragSheet';
import { PressableScale } from '../../components/common/PressableScale';
import { haptic } from '../../lib/haptic';

type Tab = 'all' | 'wish' | 'coll';

const TAGS = Object.keys(SCENT_COLORS) as ScentTag[];

export const ScentLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const wishlist = useAppStore((s) => s.wishlist);
  const collections = useAppStore((s) => s.collections);

  const [tab, setTab] = useState<Tab>('all');
  const [openTag, setOpenTag] = useState<ScentTag | null>(null);

  const wishPerfumes = useMemo(() => wishlist.map((w) => w.perfume), [wishlist]);
  const collPerfumes = useMemo(() => collections.map((c) => c.perfume), [collections]);

  // 현재 탭에 따른 향수 풀 (중복 제거)
  const pool = useMemo<Perfume[]>(() => {
    if (tab === 'wish') return wishPerfumes;
    if (tab === 'coll') return collPerfumes;
    const map = new Map<string, Perfume>();
    [...wishPerfumes, ...collPerfumes].forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [tab, wishPerfumes, collPerfumes]);

  // 각 향 계열별 매칭 향수 수
  const countsByTag = useMemo(() => {
    const c: Partial<Record<ScentTag, number>> = {};
    for (const p of pool) {
      for (const t of p.tags) c[t] = (c[t] ?? 0) + 1;
    }
    return c;
  }, [pool]);

  const discovered = TAGS.filter((t) => (countsByTag[t] ?? 0) > 0).length;
  const progress = discovered / TAGS.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>향 도감</Text>
        <View style={{ width: TOUCH_TARGET_MIN }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
        {/* 진행 카드 */}
        <Animated.View entering={FadeIn.duration(360)} style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            <View>
              <Text style={styles.progressEyebrow}>지금까지 만난 향</Text>
              <Text style={styles.progressTitle}>
                {discovered}
                <Text style={styles.progressTotal}> / {TAGS.length}</Text>
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Ionicons name="leaf" size={14} color={COLORS.primaryDark} />
              <Text style={styles.progressBadgeText}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            위시리스트와 컬렉션에 담긴 향수들을 향 계열별로 모아 봤어요.
          </Text>
        </Animated.View>

        {/* 탭 */}
        <View style={styles.tabRow}>
          {([
            { v: 'all', label: '전체' },
            { v: 'wish', label: '위시리스트' },
            { v: 'coll', label: '컬렉션' },
          ] as { v: Tab; label: string }[]).map((t) => (
            <PressableScale
              key={t.v}
              style={[styles.tab, tab === t.v && styles.tabActive]}
              onPress={() => setTab(t.v)}
              haptic="selection"
              scaleTo={0.96}
            >
              <Text style={[styles.tabText, tab === t.v && styles.tabTextActive]}>
                {t.label}
              </Text>
            </PressableScale>
          ))}
        </View>

        {/* 18개 향 계열 그리드 */}
        <View style={styles.grid}>
          {TAGS.map((tag, idx) => {
            const count = countsByTag[tag] ?? 0;
            const discovered = count > 0;
            const bg = SCENT_COLORS[tag];
            const fg = SCENT_TEXT_COLORS[tag];
            return (
              <Animated.View
                key={tag}
                entering={FadeInDown.springify().damping(20).stiffness(160).delay(idx * 22)}
                style={styles.gridItem}
              >
                <PressableScale
                  onPress={() => { haptic('selection'); setOpenTag(tag); }}
                  scaleTo={0.96}
                  haptic={null}
                  style={[
                    styles.card,
                    { backgroundColor: discovered ? bg : COLORS.gray100 },
                    !discovered && styles.cardLocked,
                  ]}
                >
                  <View style={styles.cardTop}>
                    <Text style={[
                      styles.cardName,
                      { color: discovered ? fg : COLORS.gray500 },
                    ]}>
                      {tag}
                    </Text>
                    {discovered && (
                      <View style={[styles.cardCheck, { backgroundColor: fg }]}>
                        <Ionicons name="checkmark" size={10} color={COLORS.white} />
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.cardCount,
                    { color: discovered ? fg : COLORS.gray400 },
                  ]}>
                    {discovered ? `${count}개` : '아직 비어있어요'}
                  </Text>
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <FamilyDetailSheet
        tag={openTag}
        tab={tab}
        onClose={() => setOpenTag(null)}
        wishPerfumes={wishPerfumes}
        collPerfumes={collPerfumes}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// 향 계열 상세 시트
// ─────────────────────────────────────────────────────────────
const FamilyDetailSheet: React.FC<{
  tag: ScentTag | null;
  tab: Tab;
  onClose: () => void;
  wishPerfumes: Perfume[];
  collPerfumes: Perfume[];
}> = ({ tag, tab, onClose, wishPerfumes, collPerfumes }) => {
  const navigation = useNavigation<any>();
  const info = tag ? getScentTagInfo(tag) : null;

  // 그리드 탭과 일관성 — 'coll' 탭에서 들어왔으면 위시 섹션은 숨김.
  const showWish = tab !== 'coll';
  const showColl = tab !== 'wish';

  const wishMatches = useMemo(
    () => (tag && showWish ? wishPerfumes.filter((p) => p.tags.includes(tag)) : []),
    [tag, showWish, wishPerfumes],
  );
  const collMatches = useMemo(
    () => (tag && showColl ? collPerfumes.filter((p) => p.tags.includes(tag)) : []),
    [tag, showColl, collPerfumes],
  );
  const total = wishMatches.length + collMatches.length;

  const openPerfume = (perfumeId: string) => {
    onClose();
    // 시트 닫힘 애니메이션과 겹치지 않도록 살짝 지연
    setTimeout(() => navigation.navigate('PerfumeDetail', { perfumeId }), 200);
  };

  if (!tag) {
    return <DragSheet visible={false} onClose={onClose}>{null}</DragSheet>;
  }

  const bg = SCENT_COLORS[tag];
  const fg = SCENT_TEXT_COLORS[tag];

  return (
    <DragSheet visible={tag !== null} onClose={onClose} maxHeightRatio={0.92}>
      <View style={sheetStyles.body}>
        {/* 컬러 헤더 */}
        <View style={[sheetStyles.headerBlock, { backgroundColor: bg }]}>
          <View style={sheetStyles.headerTopRow}>
            <View style={sheetStyles.headerPill}>
              <Text style={[sheetStyles.headerPillText, { color: fg }]}>
                {total > 0 ? `${total}개 담겨있어요` : '아직 비어있어요'}
              </Text>
            </View>
          </View>
          <Text style={[sheetStyles.headerName, { color: fg }]}>{tag}</Text>
          {info && (
            <Text style={[sheetStyles.headerDesc, { color: fg }]}>{info.description}</Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={sheetStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* 설명 블록 */}
          {info && (
            <View style={sheetStyles.infoBlock}>
              <InfoRow icon="cloud-outline" label="무드" text={info.nuance} />
              <InfoRow icon="flower-outline" label="원료" text={info.origin} />
              <InfoRow icon="time-outline" label="어울리는 자리" text={info.usage} />
            </View>
          )}

          {/* 내 향수 */}
          {total === 0 ? (
            <View style={sheetStyles.empty}>
              <Ionicons name="search-outline" size={36} color={COLORS.gray300} />
              <Text style={sheetStyles.emptyTitle}>이 계열의 향수가 아직 없어요</Text>
              <Text style={sheetStyles.emptySub}>
                찾아보기에서 {tag} 향수를 만나 보세요.
              </Text>
              <PressableScale
                style={sheetStyles.exploreBtn}
                onPress={() => { onClose(); setTimeout(() => navigation.navigate('Search'), 200); }}
                haptic="light"
              >
                <Ionicons name="search" size={16} color={COLORS.white} />
                <Text style={sheetStyles.exploreBtnText}>{tag} 향수 둘러보기</Text>
              </PressableScale>
            </View>
          ) : (
            <View style={{ gap: SPACING.md }}>
              {wishMatches.length > 0 && (
                <PerfumeGroup
                  title="위시리스트"
                  icon="heart"
                  perfumes={wishMatches}
                  onPress={openPerfume}
                />
              )}
              {collMatches.length > 0 && (
                <PerfumeGroup
                  title="컬렉션"
                  icon="albums"
                  perfumes={collMatches}
                  onPress={openPerfume}
                />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </DragSheet>
  );
};

const InfoRow: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; text: string }> = ({
  icon, label, text,
}) => (
  <View style={sheetStyles.infoRow}>
    <View style={sheetStyles.infoIconWrap}>
      <Ionicons name={icon} size={16} color={COLORS.primaryInk} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={sheetStyles.infoLabel}>{label}</Text>
      <Text style={sheetStyles.infoText}>{text}</Text>
    </View>
  </View>
);

const PerfumeGroup: React.FC<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  perfumes: Perfume[];
  onPress: (id: string) => void;
}> = ({ title, icon, perfumes, onPress }) => (
  <View>
    <View style={sheetStyles.groupHeader}>
      <Ionicons name={icon} size={14} color={COLORS.primaryInk} />
      <Text style={sheetStyles.groupTitle}>{title}</Text>
      <Text style={sheetStyles.groupCount}>{perfumes.length}</Text>
    </View>
    <View style={{ gap: 6 }}>
      {perfumes.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => { haptic('selection'); onPress(p.id); }}
          style={sheetStyles.perfumeRow}
          android_ripple={{ color: COLORS.primaryLight }}
        >
          <Image source={{ uri: p.image_url }} style={sheetStyles.perfumeImg} />
          <View style={{ flex: 1 }}>
            <Text style={sheetStyles.perfumeBrand} numberOfLines={1}>{p.brand.name}</Text>
            <Text style={sheetStyles.perfumeName} numberOfLines={1}>{p.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
        </Pressable>
      ))}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────
// styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  iconBtn: {
    width: TOUCH_TARGET_MIN, height: TOUCH_TARGET_MIN,
    justifyContent: 'center', alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.h4, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text,
  },

  progressCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  progressEyebrow: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.4,
  },
  progressTitle: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  progressTotal: {
    fontSize: FONT_SIZES.h3,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressBadgeText: {
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryDark,
  },
  progressBar: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray200,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.full,
  },
  progressHint: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: LINE_HEIGHTS.small * 1.4,
  },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  tabText: { fontSize: FONT_SIZES.small, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold },
  tabTextActive: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md - 4,
  },
  gridItem: {
    width: '33.333%',
    padding: 4,
  },
  card: {
    minHeight: 88,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm + 2,
    justifyContent: 'space-between',
  },
  cardLocked: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: -0.3,
  },
  cardCheck: {
    width: 16, height: 16,
    borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  cardCount: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

const sheetStyles = StyleSheet.create({
  body: { paddingBottom: SPACING.lg },

  headerBlock: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  headerPill: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  headerPillText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerName: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.black,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  headerDesc: {
    fontSize: FONT_SIZES.bodySm,
    marginTop: 6,
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
    opacity: 0.85,
  },

  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },

  infoBlock: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoRow: { flexDirection: 'row', gap: SPACING.sm + 2 },
  infoIconWrap: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoText: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
  },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  groupTitle: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
  },
  groupCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    minWidth: 18,
    textAlign: 'center',
  },

  perfumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm + 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  perfumeImg: {
    width: 44, height: 54,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray200,
  },
  perfumeBrand: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  perfumeName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: 2,
  },

  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyTitle: {
    fontSize: FONT_SIZES.bodyLg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  emptySub: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
    marginBottom: SPACING.sm,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOW.sm,
  },
  exploreBtnText: { color: COLORS.white, fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold },
});
