import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  FlatList, Image, Dimensions, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, interpolateColor,
  FadeIn,
} from 'react-native-reanimated';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW, SCENT_COLORS, SCENT_TEXT_COLORS,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { SPRING } from '../../constants/motion';
import { usePerfumes } from '../../lib/api/hooks';
import { Perfume, ScentTag } from '../../types';
import { PressableScale } from '../../components/common/PressableScale';
import { InfoPopover } from '../../components/common/InfoPopover';
import { getScentTagInfo, ScentInfo } from '../../lib/scentInfo';
import { haptic } from '../../lib/haptic';
import { BottleGlyph } from '../../components/common/PerfumeCard';
import { useAppStore } from '../../store/useAppStore';

const SCREEN_W = Dimensions.get('window').width;
const SIDEBAR_W = 108;
const RIGHT_PANE_W = SCREEN_W - SIDEBAR_W;

// ---------- 카테고리 정의 ----------
type CategoryId =
  | 'niche'
  | 'designer'
  | 'hair'
  | 'car'
  | 'room'
  | 'body'
  | 'candle'
  | 'travel';

interface Category {
  id: CategoryId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  // 이 카테고리의 향수 필터. undefined면 데이터 없음(empty state)
  filter?: (p: Perfume) => boolean;
}

const CATEGORIES: Category[] = [
  { id: 'niche',    label: '니치 향수',   icon: 'sparkles',         filter: (p) => p.brand.isNiche },
  { id: 'designer', label: '디자이너',    icon: 'star',             filter: (p) => !p.brand.isNiche },
  { id: 'hair',     label: '헤어 향수',   icon: 'cut' },
  { id: 'car',      label: '차량 디퓨저', icon: 'car-sport' },
  { id: 'room',     label: '룸 디퓨저',   icon: 'home' },
  { id: 'body',     label: '보디 미스트', icon: 'water' },
  { id: 'candle',   label: '향초',        icon: 'flame' },
  { id: 'travel',   label: '휴대용',      icon: 'airplane' },
];

const SCENT_TAGS: ScentTag[] = [
  '플로럴', '시트러스', '우디', '머스크', '프레시', '오리엔탈',
  '아쿠아틱', '구르망', '스파이시', '허벌', '파우더리', '레더',
  '스모키', '그린', '푸제르', '시프레', '발사믹', '아이리스',
];

// ---------- 화면 ----------
export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const { toggleWishlist, isWishlisted } = useAppStore();
  const { data: perfumes = [] } = usePerfumes();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('niche');
  const [selectedTag, setSelectedTag] = useState<ScentTag | null>(null);

  // 검색바 focus 애니메이션
  const focusProgress = useSharedValue(0);
  const searchBoxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], ['transparent', COLORS.primaryDark]),
    shadowOpacity: 0.06 + focusProgress.value * 0.10,
    shadowRadius: 4 + focusProgress.value * 6,
    transform: [{ scale: 1 + focusProgress.value * 0.012 }],
  }));

  // 향 계열 long-press 팝오버
  const [popover, setPopover] = useState<{
    visible: boolean;
    title: string;
    info: ScentInfo | null;
    badgeColor?: string;
  }>({ visible: false, title: '', info: null });
  const openScentInfo = (tag: string) => {
    const info = getScentTagInfo(tag);
    if (!info) return;
    haptic('medium');
    setPopover({ visible: true, title: tag, info, badgeColor: SCENT_TEXT_COLORS[tag] });
  };
  const closePopover = () => setPopover((p) => ({ ...p, visible: false }));

  // 필터링된 결과
  const activeCat = CATEGORIES.find((c) => c.id === activeCategory)!;
  const filteredItems = useMemo(() => {
    if (!activeCat.filter) return [];
    let items = perfumes.filter(activeCat.filter);
    if (selectedTag) {
      items = items.filter((p) => p.tags.includes(selectedTag));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeCat, selectedTag, query, perfumes]);

  const selectCategory = (id: CategoryId) => {
    if (id === activeCategory) return;
    haptic('selection');
    setActiveCategory(id);
    setSelectedTag(null);
    Keyboard.dismiss();
  };

  const handleBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단: 뒤로가기 + 검색바 */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <Animated.View style={[styles.searchBox, searchBoxStyle]}>
          <Ionicons name="search-outline" size={16} color={COLORS.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="향수명, 브랜드, 원료 검색"
            placeholderTextColor={COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            onFocus={() => { focusProgress.value = withSpring(1, { damping: 18, stiffness: 200 }); }}
            onBlur={() => { focusProgress.value = withSpring(0, { damping: 18, stiffness: 200 }); }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* 본문: 좌 카테고리 / 우 결과 */}
      <View style={styles.body}>
        {/* 좌측 카테고리 사이드바 */}
        <ScrollView
          style={[styles.sidebar, { width: SIDEBAR_W }]}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <Pressable
                key={cat.id}
                onPress={() => selectCategory(cat.id)}
                style={[styles.catItem, active && styles.catItemActive]}
              >
                {active && <View style={styles.catActiveBar} />}
                <View style={[styles.catIcon, active && styles.catIconActive]}>
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={active ? COLORS.primaryDark : COLORS.gray500}
                  />
                </View>
                <Text style={[styles.catLabel, active && styles.catLabelActive]} numberOfLines={1}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 우측 결과 */}
        <View style={[styles.rightPane, { width: RIGHT_PANE_W }]}>
          {activeCat.filter ? (
            <>
              {/* 향 계열 컴팩트 필터 */}
              <View style={styles.tagFilterWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagFilterContent}
                  style={styles.tagFilterScroll}
                >
                  {SCENT_TAGS.map((tag) => {
                    const sel = selectedTag === tag;
                    return (
                      <PressableScale
                        key={tag}
                        style={[
                          styles.tagPill,
                          sel
                            ? styles.tagPillActive
                            : { backgroundColor: SCENT_COLORS[tag] ?? COLORS.gray100 },
                        ]}
                        onPress={() => {
                          haptic('selection');
                          setSelectedTag(sel ? null : tag);
                        }}
                        onLongPress={() => openScentInfo(tag)}
                        scaleTo={0.92}
                      >
                        <Text
                          style={[
                            styles.tagPillText,
                            sel
                              ? styles.tagPillTextActive
                              : { color: SCENT_TEXT_COLORS[tag] ?? COLORS.gray600 },
                          ]}
                        >
                          {tag}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 결과 카운트 + 리스트 */}
              <View style={styles.resultHeader}>
                <Text style={styles.resultCount}>{filteredItems.length}개의 향수</Text>
                {selectedTag && (
                  <Pressable onPress={() => setSelectedTag(null)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={styles.resetText}>필터 초기화</Text>
                  </Pressable>
                )}
              </View>

              {filteredItems.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="search-outline" size={56} color={COLORS.gray300} />
                  <Text style={styles.emptyTitle}>일치하는 향수가 없어요</Text>
                  <Text style={styles.emptySub}>
                    검색어를 바꾸거나 향 계열 필터를 조정해 보세요.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredItems}
                  keyExtractor={(p) => p.id}
                  contentContainerStyle={styles.resultList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => (
                    <Animated.View entering={FadeIn.duration(220).delay(index * 30)}>
                      <CompactPerfumeRow
                        perfume={item}
                        wishlisted={isWishlisted(item.id)}
                        onPress={() => navigation.navigate('PerfumeDetail', { perfumeId: item.id })}
                        onHeart={() => toggleWishlist(item)}
                      />
                    </Animated.View>
                  )}
                />
              )}
            </>
          ) : (
            <ComingSoonEmpty icon={activeCat.icon} label={activeCat.label} />
          )}
        </View>
      </View>

      {popover.info && (
        <InfoPopover
          visible={popover.visible}
          onClose={closePopover}
          title={popover.title}
          badge="향 계열"
          badgeColor={popover.badgeColor}
          info={popover.info}
        />
      )}
    </SafeAreaView>
  );
};

// ---------- 우측: 컴팩트 결과 행 ----------
interface CompactRowProps {
  perfume: Perfume;
  wishlisted: boolean;
  onPress: () => void;
  onHeart: () => void;
}
const CompactPerfumeRow: React.FC<CompactRowProps> = ({ perfume, wishlisted, onPress, onHeart }) => (
  <PressableScale style={styles.row} onPress={onPress} scaleTo={0.97} haptic="light">
    <View style={styles.rowImg}>
      <BottleGlyph perfume={perfume} size={36} />
      {perfume.brand.isNiche && (
        <View style={styles.rowNicheBadge}>
          <Text style={styles.rowNicheText}>NICHE</Text>
        </View>
      )}
    </View>
    <View style={styles.rowInfo}>
      <Text style={styles.rowBrand} numberOfLines={1}>{perfume.brand.name}</Text>
      <Text style={styles.rowName} numberOfLines={1}>{perfume.name}</Text>
      <View style={styles.rowMeta}>
        <Ionicons name="star" size={11} color={COLORS.star} />
        <Text style={styles.rowMetaText}>{perfume.rating?.toFixed(1)}</Text>
        <Text style={styles.rowDot}>·</Text>
        <Text style={styles.rowMetaText}>{perfume.price_krw.toLocaleString()}원</Text>
      </View>
    </View>
    <Pressable onPress={onHeart} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.rowHeart}>
      <Ionicons
        name={wishlisted ? 'heart' : 'heart-outline'}
        size={20}
        color={wishlisted ? COLORS.accentInk : COLORS.gray400}
      />
    </Pressable>
  </PressableScale>
);

// ---------- Empty: 데이터 없는 카테고리 ----------
const ComingSoonEmpty: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = ({ icon, label }) => (
  <View style={styles.comingSoonWrap}>
    <View style={styles.comingSoonIconCircle}>
      <Ionicons name={icon} size={36} color={COLORS.primaryInk} />
    </View>
    <Text style={styles.comingSoonTitle}>{label}</Text>
    <Text style={styles.comingSoonSub}>
      곧 만나요{'\n'}{label} 카테고리를 준비 중이에요.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // 상단 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    minHeight: TOUCH_TARGET_MIN,
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#1A2E24',
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    minHeight: TOUCH_TARGET_MIN - SPACING.sm,
    padding: 0,
  },

  // 본문 split layout
  body: { flex: 1, flexDirection: 'row' },

  // 좌측 사이드바
  sidebar: {
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    minHeight: 56,
    position: 'relative',
  },
  catItemActive: {
    backgroundColor: COLORS.background,
  },
  catActiveBar: {
    position: 'absolute',
    left: 0, top: 8, bottom: 8,
    width: 3,
    backgroundColor: COLORS.primaryDark,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  catIcon: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catIconActive: { backgroundColor: COLORS.secondary },
  catLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  catLabelActive: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // 우측 패널
  rightPane: { flex: 1 },

  // 향 계열 필터
  tagFilterWrap: { paddingTop: SPACING.sm },
  tagFilterScroll: { overflow: 'visible' },
  tagFilterContent: {
    paddingHorizontal: SPACING.md - 4,
    paddingVertical: 4,
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    minHeight: 26,
    justifyContent: 'center',
  },
  tagPillActive: { backgroundColor: COLORS.primaryDark },
  tagPillText: { fontSize: 11, fontWeight: FONT_WEIGHTS.bold, lineHeight: 14 },
  tagPillTextActive: { color: COLORS.white },

  // 결과 헤더
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md - 4,
    paddingTop: SPACING.sm,
    paddingBottom: 4,
  },
  resultCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  resetText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // 컴팩트 결과 행
  resultList: {
    paddingHorizontal: SPACING.md - 4,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm + 2,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  rowImg: {
    width: 60, height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F0F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  rowNicheBadge: {
    position: 'absolute',
    top: 3, left: 3,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.sm,
  },
  rowNicheText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.3,
  },
  rowInfo: { flex: 1, gap: 1 },
  rowBrand: {
    fontSize: 9,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rowName: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  rowMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  rowDot: { fontSize: 11, color: COLORS.gray400 },
  rowHeart: { padding: 4 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.bodyLg, color: COLORS.text, fontWeight: FONT_WEIGHTS.bold, marginTop: SPACING.xs },
  emptySub: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: LINE_HEIGHTS.bodySm * 1.5 },

  // Coming Soon
  comingSoonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  comingSoonIconCircle: {
    width: 78, height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: FONT_SIZES.h3,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginTop: 4,
  },
  comingSoonSub: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.bodySm * 1.5,
  },
});
