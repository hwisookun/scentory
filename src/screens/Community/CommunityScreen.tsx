import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, withDelay,
  interpolate,
} from 'react-native-reanimated';
import { pickImages } from '../../lib/imagePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, BUTTON_HEIGHT,
} from '../../constants/theme';
import { useInfiniteAllReviews, usePerfumes } from '../../lib/api/hooks';
import { Review, BoardCategory, BOARD_CATEGORIES, Perfume } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { DragSheet } from '../../components/common/DragSheet';
import { PressableScale } from '../../components/common/PressableScale';
import { Button } from '../../components/common/Button';
import { BottleGlyph } from '../../components/common/PerfumeCard';
import { ImageViewer } from '../../components/common/ImageViewer';
import { haptic } from '../../lib/haptic';

type EnrichedReview = Review & { perfume?: Perfume; boardCategory: BoardCategory };

// 게시판 필터 — 전체 > 자유 > 공지 > 질문 > 정보
const FILTERS = ['전체', ...BOARD_CATEGORIES] as const;
const AVATAR_COLORS = ['#FCE4EC', '#EBF7F1', '#FFF3E0', '#EDE7F6', '#E3F2FD', '#F3E5F5'];
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - SPACING.md * 2; // 피드 카드 = 리스트 좌우 패딩 제외 전체 폭

// 카테고리별 배지 색 (토스풍 — 옅은 톤온톤 칩)
const CATEGORY_STYLE: Record<BoardCategory, { bg: string; fg: string }> = {
  '자유': { bg: COLORS.secondary, fg: COLORS.primaryInk },
  '공지': { bg: '#FFF3E0', fg: '#C77F1B' },
  '질문': { bg: '#E3F2FD', fg: '#3A6FA8' },
  '정보': { bg: '#EDE7F6', fg: '#6A4BA8' },
};

// 카테고리가 없는 (mock) 리뷰는 id 기반 안정 해시로 배정 — 렌더마다 흔들리지 않게
function categoryOf(r: Review): BoardCategory {
  if (r.category) return r.category;
  let h = 0;
  for (let i = 0; i < r.id.length; i++) h = (h * 31 + r.id.charCodeAt(i)) >>> 0;
  return BOARD_CATEGORIES[h % BOARD_CATEGORIES.length];
}

// like 수는 id 해시로 안정화 (실데이터 연결 전 placeholder)
function pseudoLikes(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) >>> 0;
  return h % 80;
}

// 댓글 — 실데이터 전까지 id 해시로 0~5개 목업 생성(렌더마다 동일)
export type FeedComment = { id: string; nickname: string; text: string; mine?: boolean };
const COMMENT_NICKS = ['scent_j', '민트초코', '향덕후_미소', '우디러버', '코코', '블랑', '오후세시'];
const COMMENT_TEXTS = [
  '저도 이 향 좋아해요!', '정보 감사해요 🌿', '어떤 계절에 잘 어울려요?',
  '지속력은 어떤가요?', '데이트에 딱일 것 같아요', '담아둘게요',
  '시향 꼭 해봐야겠어요', '설명이 너무 와닿네요',
];
function mockCommentsFor(id: string): FeedComment[] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) >>> 0;
  const n = h % 6; // 0~5
  const out: FeedComment[] = [];
  for (let i = 0; i < n; i++) {
    const hh = (h + i * 0x9e3779b1) >>> 0;
    out.push({
      id: `${id}-c${i}`,
      nickname: COMMENT_NICKS[hh % COMMENT_NICKS.length],
      text: COMMENT_TEXTS[(hh >> 5) % COMMENT_TEXTS.length],
    });
  }
  return out;
}

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
  const reviews = useMemo(
    () => [...pendingReviews, ...fetchedReviews],
    [pendingReviews, fetchedReviews],
  );
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('전체');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const likeOn = useCallback((id: string) => {
    setLikedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  // 댓글 — 목업 + 이번 세션에 단 댓글
  const [userComments, setUserComments] = useState<Record<string, FeedComment[]>>({});
  const [openComments, setOpenComments] = useState<EnrichedReview | null>(null);
  const commentCountOf = useCallback(
    (id: string) => mockCommentsFor(id).length + (userComments[id]?.length ?? 0),
    [userComments],
  );
  const addComment = useCallback((postId: string, text: string) => {
    setUserComments((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] ?? []),
        { id: `${postId}-u${Date.now()}`, nickname: '나', text, mine: true },
      ],
    }));
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newCategory, setNewCategory] = useState<BoardCategory>('자유');
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

  // 향수 빠른 조회용 맵 — 매 리뷰마다 find() 하던 O(n·m) 제거
  const perfumeById = useMemo(() => {
    const m = new Map<string, typeof allPerfumes[number]>();
    allPerfumes.forEach((p) => m.set(p.id, p));
    return m;
  }, [allPerfumes]);

  const enrichedReviews = useMemo(
    () =>
      reviews
        .map((r) => ({
          ...r,
          perfume: r.perfume_id ? perfumeById.get(r.perfume_id) : undefined,
          boardCategory: categoryOf(r),
        }))
        .filter((r) => activeFilter === '전체' || r.boardCategory === activeFilter),
    [reviews, perfumeById, activeFilter],
  );

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const review: Review = {
      id: Date.now().toString(),
      user_id: 'me',
      perfume_id: '',
      rating: newRating,
      comment: newComment,
      created_at: new Date().toISOString(),
      nickname: '나',
      category: newCategory,
      images: newImages.length > 0 ? [...newImages] : undefined,
    };
    setPendingReviews((prev) => [review, ...prev]);
    incrementReviewCount();
    setNewComment('');
    setNewRating(5);
    setNewCategory('자유');
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
          <FeedPost
            item={item}
            avatarColor={AVATAR_COLORS[index % AVATAR_COLORS.length]}
            liked={likedIds.has(item.id)}
            commentCount={commentCountOf(item.id)}
            onToggleLike={() => toggleLike(item.id)}
            onLikeOn={() => likeOn(item.id)}
            onOpenPerfume={() =>
              item.perfume && navigation.navigate('PerfumeDetail', { perfumeId: item.perfume_id })
            }
            onOpenComments={() => setOpenComments(item)}
          />
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
            <Text style={styles.modalLabel}>게시판</Text>
            <View style={styles.categoryRow}>
              {BOARD_CATEGORIES.map((c) => (
                <PressableScale
                  key={c}
                  style={[styles.categoryChip, newCategory === c && styles.categoryChipActive]}
                  onPress={() => setNewCategory(c)}
                  haptic="selection"
                  scaleTo={0.94}
                >
                  <Text style={[styles.categoryChipText, newCategory === c && styles.categoryChipTextActive]}>
                    {c}
                  </Text>
                </PressableScale>
              ))}
            </View>

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

            <Button
              title="등록하기"
              onPress={handleSubmit}
              disabled={!newComment.trim()}
            />
          </ScrollView>
        </View>
      </DragSheet>

      {/* 댓글 시트 */}
      <CommentsSheet
        post={openComments}
        comments={
          openComments
            ? [...mockCommentsFor(openComments.id), ...(userComments[openComments.id] ?? [])]
            : []
        }
        onClose={() => setOpenComments(null)}
        onAdd={(text) => { if (openComments) addComment(openComments.id, text); }}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// 댓글 시트
// ─────────────────────────────────────────────────────────────
const CommentsSheet: React.FC<{
  post: EnrichedReview | null;
  comments: FeedComment[];
  onClose: () => void;
  onAdd: (text: string) => void;
}> = ({ post, comments, onClose, onAdd }) => {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
    haptic('light');
  };
  return (
    <DragSheet visible={post !== null} onClose={onClose} maxHeightRatio={0.85}>
      <View style={cmt.body}>
        <Text style={cmt.title}>댓글 {comments.length}</Text>
        <ScrollView
          style={cmt.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {comments.length === 0 ? (
            <View style={cmt.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={COLORS.gray300} />
              <Text style={cmt.emptyText}>아직 댓글이 없어요.{'\n'}첫 댓글을 남겨 보세요.</Text>
            </View>
          ) : (
            comments.map((c, i) => (
              <View key={c.id} style={cmt.row}>
                <View style={[cmt.avatar, { backgroundColor: c.mine ? COLORS.secondary : AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <Text style={cmt.avatarText}>{c.nickname[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={cmt.nick}>
                    {c.nickname}
                    {c.mine ? <Text style={cmt.mineTag}>  나</Text> : null}
                  </Text>
                  <Text style={cmt.text}>{c.text}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        <View style={cmt.inputRow}>
          <TextInput
            style={cmt.input}
            placeholder="댓글 달기…"
            placeholderTextColor={COLORS.textLight}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            onPress={submit}
            disabled={!text.trim()}
            style={[cmt.send, !text.trim() && cmt.sendOff]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </DragSheet>
  );
};

// ─────────────────────────────────────────────────────────────
// 인스타그램 스타일 피드 카드
// ─────────────────────────────────────────────────────────────
const FeedPost: React.FC<{
  item: EnrichedReview;
  avatarColor: string;
  liked: boolean;
  commentCount: number;
  onToggleLike: () => void;
  onLikeOn: () => void;
  onOpenPerfume: () => void;
  onOpenComments: () => void;
}> = ({ item, avatarColor, liked, commentCount, onToggleLike, onLikeOn, onOpenPerfume, onOpenComments }) => {
  const [viewer, setViewer] = useState(false);
  const hasImages = !!item.images && item.images.length > 0;
  const likeCount = pseudoLikes(item.id) + (liked ? 1 : 0);
  const cat = CATEGORY_STYLE[item.boardCategory];

  // 더블탭 좋아요 → 중앙 하트 팝
  const burst = useSharedValue(0);
  const popBurst = () => {
    burst.value = withSequence(
      withSpring(1, { damping: 8, stiffness: 220 }),
      withDelay(280, withTiming(0, { duration: 200 })),
    );
  };
  const burstStyle = useAnimatedStyle(() => ({
    opacity: interpolate(burst.value, [0, 0.08, 1], [0, 1, 1]),
    transform: [{ scale: burst.value }],
  }));

  const canOpenPerfume = !!item.perfume;
  // 콜백을 JS 스레드에서 실행 — popBurst/haptic 등 일반 함수를 바로 호출 가능
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(260)
    .runOnJS(true)
    .onEnd(() => {
      onLikeOn();
      haptic('light');
      popBurst();
    });
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .runOnJS(true)
    .onEnd(() => {
      if (hasImages) setViewer(true);
      else if (canOpenPerfume) onOpenPerfume();
    });
  const mediaGesture = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <View style={feed.card}>
      {/* 헤더 */}
      <View style={feed.header}>
        <View style={[feed.avatar, { backgroundColor: avatarColor }]}>
          <Text style={feed.avatarText}>{(item.nickname ?? '?')[0]}</Text>
        </View>
        <Text style={feed.nickname} numberOfLines={1}>{item.nickname ?? '익명'}</Text>
        <View style={[feed.catChip, { backgroundColor: cat.bg }]}>
          <Text style={[feed.catText, { color: cat.fg }]}>{item.boardCategory}</Text>
        </View>
      </View>

      {/* 미디어 — 더블탭 좋아요 / 단일탭 자세히 */}
      <GestureDetector gesture={mediaGesture}>
        <View style={feed.media}>
          {hasImages ? (
            <>
              <Image source={{ uri: item.images![0] }} style={feed.image} />
              {item.images!.length > 1 && (
                <View style={feed.countBadge}>
                  <Text style={feed.countBadgeText}>1/{item.images!.length}</Text>
                </View>
              )}
            </>
          ) : item.perfume ? (
            <LinearGradient
              colors={['#F0F8F3', '#DCF1E2']}
              start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
              style={feed.fill}
            >
              <BottleGlyph perfume={item.perfume} size={96} />
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.secondary]}
              start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
              style={[feed.fill, { paddingHorizontal: SPACING.xl }]}
            >
              <Text style={feed.quote} numberOfLines={5}>“{item.comment}”</Text>
            </LinearGradient>
          )}
          <Animated.View pointerEvents="none" style={[feed.burst, burstStyle]}>
            <Ionicons name="heart" size={96} color="rgba(255,255,255,0.95)" />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* 액션 바 */}
      <View style={feed.actions}>
        <TouchableOpacity onPress={onToggleLike} hitSlop={8} activeOpacity={0.7}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? COLORS.accentInk : COLORS.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenComments} hitSlop={8} activeOpacity={0.7} style={feed.commentIcon}>
          <Ionicons name="chatbubble-outline" size={23} color={COLORS.text} />
        </TouchableOpacity>
        {item.perfume && (
          <TouchableOpacity onPress={onOpenPerfume} hitSlop={8} activeOpacity={0.7} style={feed.bagIcon}>
            <Ionicons name="bag-handle-outline" size={23} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={feed.likeCount}>좋아요 {likeCount.toLocaleString()}개</Text>

      {/* 텍스트 전용 글은 미디어에 이미 본문이 보이므로 작성자만 표기 */}
      {hasImages || item.perfume ? (
        <Text style={feed.caption}>
          <Text style={feed.captionName}>{item.nickname ?? '익명'} </Text>
          {item.comment}
        </Text>
      ) : (
        <Text style={[feed.caption, feed.captionName]}>{item.nickname ?? '익명'}</Text>
      )}

      {item.perfume && (
        <TouchableOpacity onPress={onOpenPerfume} activeOpacity={0.7} style={feed.perfumeLink}>
          <Ionicons name="pricetag-outline" size={12} color={COLORS.primaryInk} />
          <Text style={feed.perfumeLinkText} numberOfLines={1}>
            {item.perfume.brand.name} · {item.perfume.name}
          </Text>
          <Ionicons name="chevron-forward" size={12} color={COLORS.primaryInk} />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onOpenComments} activeOpacity={0.7}>
        <Text style={feed.commentsLink}>
          {commentCount > 0 ? `댓글 ${commentCount}개 모두 보기` : '댓글 달기'}
        </Text>
      </TouchableOpacity>

      <Text style={feed.date}>{item.created_at.slice(0, 10)}</Text>

      {hasImages && (
        <ImageViewer
          visible={viewer}
          images={item.images!}
          initialIndex={0}
          onClose={() => setViewer(false)}
        />
      )}
    </View>
  );
};

const feed = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  avatar: {
    width: 34, height: 34, borderRadius: 9999,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.text, fontWeight: FONT_WEIGHTS.extrabold, fontSize: 13 },
  nickname: { flex: 1, fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  catChip: {
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  catText: { fontSize: 10, fontWeight: FONT_WEIGHTS.bold },

  media: {
    width: CARD_W,
    height: CARD_W,
    backgroundColor: COLORS.gray100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  fill: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  quote: {
    fontSize: FONT_SIZES.h3,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryDeep,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.h3 * 1.4,
  },
  countBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  countBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: FONT_WEIGHTS.bold },
  burst: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 4,
  },
  commentIcon: { transform: [{ scaleX: -1 }] }, // 말풍선 꼬리 방향 (IG 느낌)
  bagIcon: {},

  likeCount: {
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: 2,
  },
  caption: {
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm * 1.45,
    marginTop: 3,
  },
  captionName: { fontWeight: FONT_WEIGHTS.bold },
  perfumeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginHorizontal: SPACING.md,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
  },
  perfumeLinkText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryInk,
    maxWidth: CARD_W * 0.7,
  },
  commentsLink: {
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textLight,
    marginTop: 8,
  },
  date: {
    paddingHorizontal: SPACING.md,
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
  },
});

const cmt = StyleSheet.create({
  body: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  title: {
    fontSize: FONT_SIZES.h4,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  scroll: { maxHeight: 360 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
  },
  row: { flexDirection: 'row', gap: SPACING.sm + 2, marginBottom: SPACING.md },
  avatar: {
    width: 32, height: 32, borderRadius: 9999,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  nick: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  mineTag: { fontSize: 10, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primaryInk },
  text: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    maxHeight: 96,
  },
  send: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center', alignItems: 'center',
  },
  sendOff: { backgroundColor: COLORS.gray300 },
});

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
  // 토스풍 플랫 세그먼트 칩 — idle은 옅은 회색, active는 진녹색
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  filterChipActive: { backgroundColor: COLORS.primaryDark },
  filterChipText: { fontSize: FONT_SIZES.small, color: COLORS.gray600, fontWeight: FONT_WEIGHTS.semibold },
  filterChipTextActive: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  // 작성 시트 카테고리 선택 칩
  categoryRow: { flexDirection: 'row', gap: SPACING.sm - 2, marginBottom: SPACING.lg },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  categoryChipActive: { backgroundColor: COLORS.primaryDark },
  categoryChipText: { fontSize: FONT_SIZES.bodySm, color: COLORS.gray600, fontWeight: FONT_WEIGHTS.semibold },
  categoryChipTextActive: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  list: { paddingHorizontal: SPACING.md, paddingTop: 4, paddingBottom: SPACING.md, gap: 14 },
  listFooter: { paddingVertical: SPACING.lg, alignItems: 'center' },
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
