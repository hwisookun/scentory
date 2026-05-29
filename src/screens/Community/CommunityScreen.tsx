import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { pickImages } from '../../lib/imagePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN, BUTTON_HEIGHT,
} from '../../constants/theme';
import { useInfiniteAllReviews, usePerfumes } from '../../lib/api/hooks';
import { Review } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { DragSheet } from '../../components/common/DragSheet';
import { PressableScale } from '../../components/common/PressableScale';
import { ReviewImages } from '../../components/common/ReviewImages';

const FILTERS = ['전체', '플로럴', '데이트', '질문', '정보', '자랑'];
const AVATAR_COLORS = ['#FCE4EC', '#EBF7F1', '#FFF3E0', '#EDE7F6', '#E3F2FD', '#F3E5F5'];
const SCREEN_W = Dimensions.get('window').width;

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const listRef = useRef<FlatList<any> | null>(null);
  const { incrementReviewCount } = useAppStore();
  // 무한 스크롤 — 페이지 단위로 받아 평탄화
  const {
    data: reviewPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAllReviews();
  const fetchedReviews = useMemo(
    () => reviewPages?.pages.flatMap((p) => p.data) ?? [],
    [reviewPages],
  );
  const { data: allPerfumes = [] } = usePerfumes();
  // 서버에서 받은 리뷰 + 이번 세션에 작성한 로컬 리뷰
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const reviews = [...pendingReviews, ...fetchedReviews];
  const [activeFilter, setActiveFilter] = useState('전체');
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newImages, setNewImages] = useState<string[]>([]);

  const MAX_IMAGES = 3;

  const pickImage = async () => {
    const newUris = await pickImages({
      maxImages: MAX_IMAGES,
      currentCount: newImages.length,
    });
    if (newUris.length > 0) {
      setNewImages((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (uri: string) => {
    setNewImages((prev) => prev.filter((u) => u !== uri));
  };

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

  const enrichedReviews = reviews.map((r) => ({
    ...r,
    perfume: allPerfumes.find((p) => p.id === r.perfume_id),
  }));

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const review: Review = {
      id: Date.now().toString(),
      user_id: 'me',
      perfume_id: '1',
      rating: newRating,
      comment: newComment,
      created_at: new Date().toISOString(),
      nickname: '나',
      images: newImages.length > 0 ? [...newImages] : undefined,
    };
    setPendingReviews((prev) => [review, ...prev]);
    incrementReviewCount();
    setNewComment('');
    setNewRating(5);
    setNewImages([]);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티</Text>
        <TouchableOpacity style={styles.writeIconBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={COLORS.primaryInk} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => (
          <PressableScale
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
            haptic="selection"
            scaleTo={0.94}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>

      <FlatList
        ref={listRef}
        data={enrichedReviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.listFooter}>
              <ActivityIndicator color={COLORS.primaryDark} />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() =>
              item.perfume &&
              navigation.navigate('PerfumeDetail', { perfumeId: item.perfume_id })
            }
            activeOpacity={0.85}
          >
            <View style={styles.postTop}>
              <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                <Text style={styles.avatarText}>{(item.nickname ?? '?')[0]}</Text>
              </View>
              <View style={styles.postMeta}>
                <Text style={styles.nickname}>{item.nickname ?? '익명'}</Text>
                <Text style={styles.date}>{item.created_at.slice(0, 10)}</Text>
              </View>
              {item.perfume && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>#{item.perfume.tags[0] ?? '향수'}</Text>
                </View>
              )}
            </View>

            {item.perfume && (
              <Text style={styles.postTitle} numberOfLines={1}>
                {item.perfume.brand.name} — {item.perfume.name}
              </Text>
            )}
            <Text style={styles.postBody} numberOfLines={3}>{item.comment}</Text>

            {item.images && item.images.length > 0 && (
              <View style={styles.postImageWrap}>
                <ReviewImages
                  images={item.images}
                  contentWidth={SCREEN_W - SPACING.md * 2 - SPACING.md * 2}
                />
              </View>
            )}

            <View style={styles.postFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="heart-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.footerCount}>{item.rating * 5}</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="chatbubble-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.footerCount}>{index + 1}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={64} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>아직 한줄평이 없어요</Text>
            <Text style={styles.emptySub}>
              마음에 든 향수에 첫 번째 한줄평을 남겨 보세요.
            </Text>
          </View>
        }
      />

      {/* Write Sheet — 드래그-닫기 */}
      <DragSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.sheetBody}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>한줄평 쓰기</Text>
            <TouchableOpacity onPress={() => { Keyboard.dismiss(); setModalVisible(false); }}>
              <Ionicons name="close" size={22} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalLabel}>별점</Text>
            <View style={styles.starSelect}>
              {Array.from({ length: 5 }).map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setNewRating(i + 1)}>
                  <Ionicons
                    name={i < newRating ? 'star' : 'star-outline'}
                    size={28}
                    color={COLORS.star}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>한줄평</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="향수에 대한 솔직한 한줄평을 남겨주세요"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              value={newComment}
              onChangeText={setNewComment}
              autoFocus
            />

            {/* 사진 첨부 — 최대 3장 */}
            <View style={styles.imageRow}>
              {newImages.map((uri) => (
                <View key={uri} style={styles.imageThumbWrap}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <TouchableOpacity
                    style={styles.imageRemove}
                    onPress={() => removeImage(uri)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={12} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {newImages.length < MAX_IMAGES && (
                <TouchableOpacity
                  style={styles.imageAddBtn}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={22} color={COLORS.primaryDark} />
                  <Text style={styles.imageAddText}>
                    {newImages.length}/{MAX_IMAGES}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>등록하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </DragSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.h1 - 2, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  writeIconBtn: { padding: 6 },
  filterScroll: { overflow: 'visible' },
  filterRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    paddingBottom: 12,
    paddingRight: SPACING.md + 4,
    gap: SPACING.sm - 2,
  },
  // WishlistScreen의 sortChip과 동일한 사이즈/스타일로 통일
  filterChip: {
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
  filterChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  filterChipText: { fontSize: FONT_SIZES.small, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold },
  filterChipTextActive: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  list: { padding: SPACING.md, paddingTop: 4, gap: 10 },
  listFooter: { paddingVertical: SPACING.lg, alignItems: 'center' },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  postTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: COLORS.text, fontWeight: FONT_WEIGHTS.extrabold, fontSize: 12 },
  postMeta: { flex: 1 },
  nickname: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  date: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  tagBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  tagBadgeText: { fontSize: 10, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primaryInk },
  postTitle: { fontSize: 15, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: 4, lineHeight: 20 },
  postBody: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.bodySm * 1.55, marginBottom: 12 },
  postImageWrap: { marginBottom: 12 },
  postFooter: { flexDirection: 'row', gap: 16 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerCount: { fontSize: 12, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  emptyTitle: { color: COLORS.text, fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, marginTop: SPACING.xs },
  emptySub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodySm, textAlign: 'center', lineHeight: LINE_HEIGHTS.bodySm * 1.5 },
  sheetBody: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  modalLabel: { fontSize: FONT_SIZES.bodySm, color: COLORS.gray700, fontWeight: FONT_WEIGHTS.semibold, marginBottom: SPACING.sm },
  starSelect: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  commentInput: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  imageRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  imageThumbWrap: {
    position: 'relative',
    width: 72,
    height: 72,
  },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
  },
  imageRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAddBtn: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.secondary,
  },
  imageAddText: {
    fontSize: 10,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
  },
  submitBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.md,
    height: BUTTON_HEIGHT.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZES.h4, fontWeight: FONT_WEIGHTS.bold },
});
