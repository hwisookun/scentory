import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { PerfumeCard } from '../../components/common/PerfumeCard';
import { NumberTicker } from '../../components/common/NumberTicker';
import { PressableScale } from '../../components/common/PressableScale';
import { EmptyHeartFloat } from '../../components/common/EmptyHeartFloat';
import { FolderPicker } from '../../components/common/FolderPicker';
import { FolderFilterSheet } from '../../components/common/FolderFilterSheet';
import { haptic } from '../../lib/haptic';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN, BUTTON_HEIGHT,
} from '../../constants/theme';
import { usePerfumes } from '../../lib/api/hooks';

type SortOption = 'recent' | 'price_asc' | 'rating';

type FolderFilter = 'all' | string; // 'all' or folder.id

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const listRef = useRef<FlatList<any> | null>(null);
  const wishlist = useAppStore((s) => s.wishlist);
  const folders = useAppStore((s) => s.wishlistFolders);
  const [sort, setSort] = useState<SortOption>('recent');
  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all');

  // FolderPicker (long-press 또는 카드 액션)
  const [pickerPerfumeId, setPickerPerfumeId] = useState<string | null>(null);
  // FolderFilterSheet (sort row의 폴더 chip)
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);

  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) return;
    const unsub = parent.addListener('tabPress', () => {
      if (isFocused) {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation, isFocused]);

  // 폴더 필터 적용
  const filteredByFolder = folderFilter === 'all'
    ? wishlist
    : (() => {
        const folder = folders.find((f) => f.id === folderFilter);
        if (!folder) return wishlist;
        const set = new Set(folder.perfumeIds);
        return wishlist.filter((w) => set.has(w.perfume_id));
      })();

  const sortedWishlist = [...filteredByFolder].sort((a, b) => {
    if (sort === 'recent') return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    if (sort === 'price_asc') return a.perfume.price_krw - b.perfume.price_krw;
    return (b.perfume.rating ?? 0) - (a.perfume.rating ?? 0);
  });

  const wishlistedTags = wishlist.flatMap((w) => w.perfume.tags);
  const { data: allPerfumes = [] } = usePerfumes();
  const suggestedPerfumes = allPerfumes.filter(
    (p) => !wishlist.some((w) => w.perfume_id === p.id) && p.tags.some((t) => wishlistedTags.includes(t))
  ).slice(0, 6);

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: '최근 추가순', value: 'recent' },
    { label: '가격 낮은순', value: 'price_asc' },
    { label: '평점순', value: 'rating' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>위시리스트</Text>
        <View style={styles.countBadge}>
          <NumberTicker value={wishlist.length} style={styles.count} />
        </View>
      </View>

      {/* 정렬 + 폴더 row — 평점순 오른쪽에 폴더 진입 chip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortRow}
      >
        {SORT_OPTIONS.map((opt) => (
          <PressableScale
            key={opt.value}
            style={[styles.sortChip, sort === opt.value && styles.sortChipActive]}
            onPress={() => setSort(opt.value)}
            haptic="selection"
            scaleTo={0.94}
          >
            <Text style={[styles.sortChipText, sort === opt.value && styles.sortChipTextActive]}>
              {opt.label}
            </Text>
          </PressableScale>
        ))}

        <View style={styles.sortDivider} />

        <PressableScale
          style={[styles.folderChip, folderFilter !== 'all' && styles.folderChipActive]}
          onPress={() => { haptic('light'); setFolderSheetOpen(true); }}
          scaleTo={0.94}
          haptic={null}
        >
          <Ionicons
            name={folderFilter === 'all' ? 'folder-outline' : 'folder'}
            size={14}
            color={folderFilter === 'all' ? COLORS.primaryInk : COLORS.white}
          />
          <Text style={[styles.folderChipText, folderFilter !== 'all' && styles.folderChipTextActive]}>
            {folderFilter === 'all'
              ? '폴더'
              : (folders.find((f) => f.id === folderFilter)?.name ?? '폴더')}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={folderFilter === 'all' ? COLORS.gray500 : COLORS.white}
          />
        </PressableScale>
      </ScrollView>

      {wishlist.length === 0 ? (
        <View style={styles.empty}>
          <EmptyHeartFloat size={84} color={COLORS.primaryLight} />
          <Text style={styles.emptyTitle}>아직 좋아한 향이 없어요</Text>
          <Text style={styles.emptySubtitle}>찾아보기에서 마음에 드는 향수를{'\n'}하트로 저장해 보세요.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('찾아보기')}>
            <Text style={styles.exploreBtnText}>향수 탐색하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={sortedWishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PerfumeCard
              perfume={item.perfume}
              onPress={() => navigation.navigate('PerfumeDetail', { perfumeId: item.perfume_id })}
              style={styles.card}
              extraActions={[
                {
                  icon: 'folder-outline',
                  label: '폴더에 담기',
                  onPress: () => setPickerPerfumeId(item.perfume_id),
                },
              ]}
            />
          )}

          ListFooterComponent={
            suggestedPerfumes.length > 0 ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestTitle}>이런 향수도 있어요.</Text>
                <View style={styles.suggestGrid}>
                  {suggestedPerfumes.map((p) => (
                    <PerfumeCard
                      key={p.id}
                      perfume={p}
                      onPress={() => navigation.navigate('PerfumeDetail', { perfumeId: p.id })}
                      style={styles.cardSuggest}
                    />
                  ))}
                </View>
              </View>
            ) : null
          }
        />
      )}

      {pickerPerfumeId && (
        <FolderPicker
          visible={!!pickerPerfumeId}
          onClose={() => setPickerPerfumeId(null)}
          perfumeId={pickerPerfumeId}
        />
      )}

      <FolderFilterSheet
        visible={folderSheetOpen}
        onClose={() => setFolderSheetOpen(false)}
        selected={folderFilter}
        onSelect={setFolderFilter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm },
  title: { fontSize: FONT_SIZES.h1 - 2, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  countBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  count: { fontSize: FONT_SIZES.bodySm, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.bold },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md - 4,
    paddingVertical: 6,
    minHeight: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  folderChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  folderChipText: { fontSize: 12, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 16 },
  folderChipTextActive: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  // contentContainer의 paddingVertical은 chip 그림자가 ScrollView 클립 영역에
  // 닿지 않도록 하는 bleed 공간. 빼면 상/하단이 잘려 보임.
  sortScroll: { flexGrow: 0, marginBottom: SPACING.md },
  sortRow: { paddingHorizontal: SPACING.md, paddingVertical: 6, gap: SPACING.sm, alignItems: 'center' },
  sortDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  sortChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  sortChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  sortChipText: { fontSize: FONT_SIZES.small, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold },
  sortChipTextActive: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  list: { padding: SPACING.md },
  row: { gap: SPACING.sm, marginBottom: SPACING.sm },
  card: { flex: 1 },
  cardSuggest: { width: '48.5%' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 14, textAlign: 'center' } as any,
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 9999,
    backgroundColor: COLORS.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  emptySubtitle: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.bodySm * 1.5,
  },
  exploreBtn: {
    marginTop: SPACING.lg,
    height: BUTTON_HEIGHT.lg,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOW.md,
  },
  exploreBtnText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg },
  suggestions: { marginTop: SPACING.lg },
  suggestTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text, marginBottom: SPACING.md },
  suggestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
});
