import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  Modal, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform,
  Image, Dimensions, ActivityIndicator,
} from 'react-native';
import { pickImages } from '../../lib/imagePicker';
import Animated, {
  FadeIn, FadeInDown, FadeInUp, ZoomIn,
  useSharedValue, useAnimatedStyle, useAnimatedScrollHandler,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW, SCENT_COLORS, SCENT_TEXT_COLORS,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN, BUTTON_HEIGHT,
} from '../../constants/theme';
import { usePerfume, usePerfumes, useInfiniteReviews } from '../../lib/api/hooks';
import { useAppStore } from '../../store/useAppStore';
import { Review, CollectionStatus } from '../../types';
import { BottleGlyph } from '../../components/common/PerfumeCard';
import { Button } from '../../components/common/Button';
import { InfoPopover } from '../../components/common/InfoPopover';
import { getScentTagInfo, getNoteInfo, ScentInfo } from '../../lib/scentInfo';
import { haptic } from '../../lib/haptic';
import { ReviewImages } from '../../components/common/ReviewImages';

type Tab = 'note' | 'review' | 'info';

const SCREEN_W = Dimensions.get('window').width;

// 향과 나의 관계(보유 단계)
const STATUS_META: Record<CollectionStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; toast: string }> = {
  tried: { label: '시향', icon: 'water-outline', toast: '시향한 향으로 담았어요.' },
  mini: { label: '미니·디캔트', icon: 'flask-outline', toast: '미니·디캔트로 담았어요.' },
  full: { label: '보유', icon: 'cube-outline', toast: '내 향수로 담았어요.' },
};
const STATUS_ORDER: CollectionStatus[] = ['tried', 'mini', 'full'];

export const PerfumeDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { perfumeId } = route.params;

  const { data: perfume } = usePerfume(perfumeId);
  const { data: allPerfumes = [] } = usePerfumes();
  const {
    data: reviewPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteReviews(perfumeId);
  const fetchedReviews = useMemo(
    () => reviewPages?.pages.flatMap((p) => p.data) ?? [],
    [reviewPages],
  );
  const {
    toggleWishlist, isWishlisted,
    addToCollection, setCollectionStatus, removeFromCollection, getCollectionStatus,
    recordReview, showToast,
  } = useAppStore();

  // 서버에서 받아온 리뷰 + 이번 세션에 작성한 임시 리뷰를 합쳐 보여줘요.
  // (현재는 createReview RPC를 안 호출하므로 새 리뷰는 메모리에만 존재.)
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const localReviews = useMemo(
    () => [...pendingReviews, ...fetchedReviews],
    [pendingReviews, fetchedReviews],
  );
  const [activeTab, setActiveTab] = useState<Tab>('note');
  const [reviewModal, setReviewModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newImages, setNewImages] = useState<string[]>([]);
  const MAX_REVIEW_IMAGES = 3;

  const pickReviewImage = async () => {
    const uris = await pickImages({
      maxImages: MAX_REVIEW_IMAGES,
      currentCount: newImages.length,
    });
    if (uris.length > 0) {
      setNewImages((prev) => [...prev, ...uris].slice(0, MAX_REVIEW_IMAGES));
    }
  };
  const removeReviewImage = (uri: string) =>
    setNewImages((prev) => prev.filter((u) => u !== uri));
  const closeReviewModal = () => {
    Keyboard.dismiss();
    setReviewModal(false);
  };

  // 향 계열/노트 long-press 팝오버
  const [popover, setPopover] = useState<{
    visible: boolean;
    title: string;
    badge: string;
    badgeColor?: string;
    info: ScentInfo | null;
  }>({ visible: false, title: '', badge: '', info: null });

  const openScentTagInfo = (tag: string) => {
    const info = getScentTagInfo(tag);
    if (!info) return;
    haptic('medium');
    setPopover({
      visible: true,
      title: tag,
      badge: '향 계열',
      badgeColor: SCENT_TEXT_COLORS[tag],
      info,
    });
  };

  const openNoteInfo = (note: string, layer: 'TOP' | 'MIDDLE' | 'BASE') => {
    haptic('medium');
    const layerLabel = layer === 'TOP' ? '탑 노트' : layer === 'MIDDLE' ? '미들 노트' : '베이스 노트';
    setPopover({
      visible: true,
      title: note,
      badge: layerLabel,
      info: getNoteInfo(note),
    });
  };
  const closePopover = () => setPopover((p) => ({ ...p, visible: false }));

  // Hero 패럴랙스 — 스크롤 진행에 따라 hero가 살짝 scale up + translate up
  // overscroll(아래로 당김) 시에는 hero가 확대되어 따라옴 (iOS bounce 활용)
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });
  const heroParallaxStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    // overscroll: 위로 당기면 hero 확대
    const scale = interpolate(y, [-120, 0, 300], [1.18, 1, 1.04], Extrapolation.CLAMP);
    // 스크롤 진행: hero가 절반 속도로 따라 올라감 (parallax 본질)
    const translateY = interpolate(y, [0, 300], [0, -60], Extrapolation.CLAMP);
    // 깊이 스크롤 시 hero 살짝 어두워짐 (집중 전환)
    const opacity = interpolate(y, [0, 200, 300], [1, 0.92, 0.85], Extrapolation.CLAMP);
    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  if (!perfume) return null;

  const wishlisted = isWishlisted(perfume.id);
  const collStatus = getCollectionStatus(perfume.id);

  // 향과 나의 관계(보유 단계) 선택 — 도감은 '시향 이상'을 만난 향으로 친다.
  const handleStatus = (v: CollectionStatus) => {
    haptic('selection');
    if (collStatus === v) {
      removeFromCollection(perfume.id);
      showToast('향 도감에서 내려놓았어요.');
    } else if (collStatus) {
      setCollectionStatus(perfume.id, v);
      showToast(STATUS_META[v].toast);
    } else {
      addToCollection(perfume, v);
      showToast(STATUS_META[v].toast);
    }
  };

  const similar = allPerfumes.filter(
    (p) => p.id !== perfume.id && p.tags.some((t) => perfume.tags.includes(t))
  ).slice(0, 5);

  const submitReview = () => {
    if (!newComment.trim()) return;
    const r: Review = {
      id: Date.now().toString(),
      user_id: 'me',
      perfume_id: perfumeId,
      rating: newRating,
      comment: newComment,
      created_at: new Date().toISOString(),
      nickname: '나',
      images: newImages.length > 0 ? [...newImages] : undefined,
    };
    setPendingReviews((prev) => [r, ...prev]);
    recordReview(perfumeId); // reviewCount 증가 + 사용 인증 신호로 기록
    setNewComment('');
    setNewRating(5);
    setNewImages([]);
    setReviewModal(false);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'note', label: '향 구성' },
    { id: 'review', label: `리뷰 ${localReviews.length}` },
    { id: 'info', label: '정보' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleWishlist(perfume)} style={styles.iconBtn}>
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={wishlisted ? COLORS.accentInk : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        {/* Hero — 진입 시 fadeIn (배경) + zoomIn (병) + 스크롤 패럴랙스 */}
        <Animated.View entering={FadeIn.duration(320)} style={heroParallaxStyle}>
          <LinearGradient
            colors={['#F0F8F3', '#DCF1E2']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.hero}
          >
            {perfume.brand.isNiche && (
              <Animated.View
                style={styles.nicheBadgeHero}
                entering={FadeIn.duration(280).delay(220)}
              >
                <Text style={styles.nicheBadgeHeroText}>니치 향수</Text>
              </Animated.View>
            )}
            <Animated.View
              entering={ZoomIn.springify().damping(14).stiffness(140).delay(80)}
            >
              <BottleGlyph perfume={perfume} size={100} />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* 정보 섹션 — 아래에서 부드럽게 올라옴, hero 직후 */}
        <Animated.View
          entering={FadeInDown.springify().damping(18).stiffness(120).delay(160)}
          style={styles.content}
        >
          <Text style={styles.brandName}>{perfume.brand.name}</Text>
          <View style={styles.nameRow}>
            <Text style={styles.perfumeName}>{perfume.name}</Text>
          </View>

          <View style={styles.tagRow}>
            {perfume.tags.map((tag) => (
              <Pressable
                key={tag}
                onLongPress={() => openScentTagInfo(tag)}
                delayLongPress={350}
                style={({ pressed }) => [
                  styles.tag,
                  { backgroundColor: SCENT_COLORS[tag] ?? COLORS.gray100 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.tagText, { color: SCENT_TEXT_COLORS[tag] ?? COLORS.gray600 }]}>{tag}</Text>
              </Pressable>
            ))}
            <View style={styles.concBadge}>
              <Text style={styles.concText}>{perfume.concentration}</Text>
            </View>
            {perfume.gender && (
              <View style={styles.genderBadge}>
                <Text style={styles.genderText}>{perfume.gender}</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.price}>{perfume.price_krw.toLocaleString()}원</Text>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.metaValue}>{perfume.rating?.toFixed(1) ?? '-'}</Text>
              <Text style={styles.metaSub}>({perfume.review_count?.toLocaleString()})</Text>
            </View>
          </View>

          {/* 향과 나의 관계 — 시향만 해도 향 도감에 남아요 */}
          <View style={styles.relBlock}>
            <Text style={styles.relLabel}>이 향, 나와의 관계</Text>
            <View style={styles.relChips}>
              {STATUS_ORDER.map((v) => {
                const active = collStatus === v;
                return (
                  <Pressable
                    key={v}
                    onPress={() => handleStatus(v)}
                    style={[styles.relChip, active && styles.relChipActive]}
                  >
                    <Ionicons
                      name={STATUS_META[v].icon}
                      size={15}
                      color={active ? COLORS.white : COLORS.primaryInk}
                    />
                    <Text style={[styles.relChipText, active && styles.relChipTextActive]}>
                      {STATUS_META[v].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.relHint}>
              {collStatus
                ? '향 도감에 담겼어요. 같은 단계를 다시 누르면 내려놓아요.'
                : '시향만 해도 향 도감에 남길 수 있어요.'}
            </Text>
          </View>
        </Animated.View>

        {/* Tabs — 가장 마지막에 자연스럽게 페이드인 */}
        <Animated.View entering={FadeIn.duration(280).delay(320)}>
          <View style={styles.tabBar}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.tabItem, activeTab === t.id && styles.tabItemActive]}
                onPress={() => setActiveTab(t.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, activeTab === t.id && styles.tabLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {activeTab === 'note' && (
          <View style={styles.tabContent}>
            <NotesPyramid
              topNotes={perfume.top_notes}
              middleNotes={perfume.middle_notes}
              baseNotes={perfume.base_notes}
              onNotePress={openNoteInfo}
            />
          </View>
        )}

        {activeTab === 'review' && (
          <View style={styles.tabContent}>
            {localReviews.length === 0 && (
              <Text style={styles.emptyText}>첫 번째 한줄평을 남겨보세요!</Text>
            )}
            {localReviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{(r.nickname ?? '?').slice(0, 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewNickname}>{r.nickname}</Text>
                  </View>
                  <View style={styles.starRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons key={i} name={i < r.rating ? 'star' : 'star-outline'} size={12} color={COLORS.star} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
                {r.images && r.images.length > 0 && (
                  <View style={styles.reviewImagesWrap}>
                    <ReviewImages
                      images={r.images}
                      contentWidth={SCREEN_W - (SPACING.md - 2) * 2 - SPACING.md * 2}
                    />
                  </View>
                )}
              </View>
            ))}
            {hasNextPage && (
              <Pressable
                style={styles.loadMoreBtn}
                onPress={() => { if (!isFetchingNextPage) fetchNextPage(); }}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={COLORS.primaryInk} />
                ) : (
                  <Text style={styles.loadMoreText}>리뷰 더 보기 →</Text>
                )}
              </Pressable>
            )}
          </View>
        )}

        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <InfoRow label="농도" value={perfume.concentration} />
              {perfume.gender && <InfoRow label="성별" value={perfume.gender} last />}
            </View>
          </View>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <View style={[styles.tabContent, styles.section]}>
            <Text style={styles.sectionTitle}>이런 향수도 있어요.</Text>
            <View style={styles.similarList}>
              {similar.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.similarItem}
                  onPress={() => navigation.push('PerfumeDetail', { perfumeId: p.id })}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#F0F8F3', '#DCF1E2']}
                    style={styles.similarImg}
                  >
                    <BottleGlyph perfume={p} size={32} />
                  </LinearGradient>
                  <View style={styles.similarInfo}>
                    <Text style={styles.similarBrand}>{p.brand.name}</Text>
                    <Text style={styles.similarName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.similarPrice}>{p.price_krw.toLocaleString()}원</Text>
                  </View>
                  <View style={styles.similarTags}>
                    {p.tags.slice(0, 2).map(t => (
                      <View key={t} style={[styles.similarTag, { backgroundColor: SCENT_COLORS[t] ?? COLORS.gray100 }]}>
                        <Text style={[styles.similarTagText, { color: SCENT_TEXT_COLORS[t] ?? COLORS.gray600 }]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Sticky CTA — 가장 마지막에 아래에서 슬라이드인 */}
      <Animated.View
        style={styles.ctaBar}
        entering={FadeInUp.springify().damping(20).stiffness(160).delay(360)}
      >
        <TouchableOpacity
          style={[styles.ctaHeart, wishlisted && styles.ctaHeartActive]}
          onPress={() => toggleWishlist(perfume)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={wishlisted ? COLORS.accentInk : COLORS.textSecondary}
          />
        </TouchableOpacity>
        <Button
          title="한줄평 쓰기"
          onPress={() => setReviewModal(true)}
          fullWidth={false}
          style={styles.ctaWriteBtn}
        />
      </Animated.View>

      {/* Review Modal */}
      <Modal visible={reviewModal} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>한줄평 쓰기</Text>
                    <TouchableOpacity onPress={closeReviewModal}>
                      <Ionicons name="close" size={22} color={COLORS.gray600} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.starSelect}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TouchableOpacity key={i} onPress={() => setNewRating(i + 1)}>
                        <Ionicons name={i < newRating ? 'star' : 'star-outline'} size={28} color={COLORS.star} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="솔직한 한줄평을 남겨주세요"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    value={newComment}
                    onChangeText={setNewComment}
                    autoFocus
                  />

                  {/* 사진 첨부 — 최대 3장, 10MB 제한 */}
                  <View style={styles.imageRow}>
                    {newImages.map((uri) => (
                      <View key={uri} style={styles.imageThumbWrap}>
                        <Image source={{ uri }} style={styles.imageThumb} />
                        <TouchableOpacity
                          style={styles.imageRemove}
                          onPress={() => removeReviewImage(uri)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="close" size={12} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {newImages.length < MAX_REVIEW_IMAGES && (
                      <TouchableOpacity
                        style={styles.imageAddBtn}
                        onPress={pickReviewImage}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="camera-outline" size={22} color={COLORS.primaryDark} />
                        <Text style={styles.imageAddText}>
                          {newImages.length}/{MAX_REVIEW_IMAGES}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Button title="등록하기" onPress={submitReview} disabled={!newComment.trim()} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* 향 계열/노트 long-press 정보 팝오버 */}
      {popover.info && (
        <InfoPopover
          visible={popover.visible}
          onClose={closePopover}
          title={popover.title}
          badge={popover.badge}
          badgeColor={popover.badgeColor}
          info={popover.info}
        />
      )}
    </SafeAreaView>
  );
};

const NotesPyramid: React.FC<{
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  onNotePress: (note: string, layer: 'TOP' | 'MIDDLE' | 'BASE') => void;
}> = ({ topNotes, middleNotes, baseNotes, onNotePress }) => {
  const rows: { label: 'TOP' | 'MIDDLE' | 'BASE'; name: string; items: string[] }[] = [
    { label: 'TOP', name: '탑 노트', items: topNotes },
    { label: 'MIDDLE', name: '미들 노트', items: middleNotes },
    { label: 'BASE', name: '베이스 노트', items: baseNotes },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <Animated.View
          key={r.label}
          style={pyramidStyles.card}
          entering={FadeInDown.springify().damping(20).stiffness(140).delay(i * 100)}
        >
          <View style={pyramidStyles.labelRow}>
            <View style={pyramidStyles.labelBadge}>
              <Text style={pyramidStyles.labelBadgeText}>{r.label}</Text>
            </View>
            <Text style={pyramidStyles.labelName}>{r.name}</Text>
          </View>
          <View style={pyramidStyles.chips}>
            {r.items.map((n, j) => (
              <Animated.View
                key={n}
                entering={FadeIn.duration(280).delay(i * 100 + 200 + j * 40)}
              >
                <Pressable
                  onLongPress={() => onNotePress(n, r.label)}
                  delayLongPress={350}
                  style={({ pressed }) => [
                    pyramidStyles.chip,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={pyramidStyles.chipText}>{n}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ))}
    </>
  );
};
const pyramidStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md - 2,
    marginBottom: SPACING.sm + 2,
    ...SHADOW.sm,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  labelBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  labelBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.primaryInk,
    letterSpacing: 0.8,
  },
  labelName: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: { fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
});

const InfoRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[infoRowStyles.row, !last && infoRowStyles.rowBorder]}>
    <Text style={infoRowStyles.label}>{label}</Text>
    <Text style={infoRowStyles.value}>{value}</Text>
  </View>
);
const infoRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, width: 80, fontWeight: FONT_WEIGHTS.semibold },
  value: { fontSize: FONT_SIZES.bodySm, color: COLORS.text, flex: 1, fontWeight: FONT_WEIGHTS.medium },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  iconBtn: { padding: SPACING.sm, minWidth: TOUCH_TARGET_MIN, minHeight: TOUCH_TARGET_MIN, justifyContent: 'center', alignItems: 'center' },
  hero: { height: 300, justifyContent: 'center', alignItems: 'center' },
  nicheBadgeHero: {
    position: 'absolute', top: 14, left: 16,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  nicheBadgeHeroText: { color: COLORS.white, fontSize: 10, fontWeight: FONT_WEIGHTS.black, letterSpacing: 0.5 },
  content: { padding: SPACING.md, paddingBottom: 0 },
  brandName: {
    fontSize: 11,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  nameRow: { marginBottom: SPACING.sm },
  perfumeName: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  tagText: { fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.semibold },
  concBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.gray100 },
  concText: { fontSize: FONT_SIZES.small, color: COLORS.gray600 },
  genderBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.secondary },
  genderText: { fontSize: FONT_SIZES.small, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  metaSub: { fontSize: FONT_SIZES.small, color: COLORS.textLight },
  price: { fontSize: 20, fontWeight: FONT_WEIGHTS.black, color: COLORS.text },
  relBlock: { marginTop: SPACING.xs, marginBottom: SPACING.sm },
  relLabel: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  relChips: { flexDirection: 'row', gap: SPACING.sm - 2 },
  relChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  relChipActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primaryDark,
  },
  relChipText: {
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryInk,
  },
  relChipTextActive: { color: COLORS.white },
  relHint: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop: SPACING.sm,
    gap: 20,
  },
  tabItem: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabItemActive: { borderBottomColor: COLORS.primaryDark },
  tabLabel: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHTS.extrabold },
  tabContent: { padding: 16 },
  // Info
  infoCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  // Reviews
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, lineHeight: LINE_HEIGHTS.body },
  loadMoreBtn: {
    height: BUTTON_HEIGHT.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: { fontSize: FONT_SIZES.bodySm, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md - 2, marginBottom: SPACING.sm + 2, ...SHADOW.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 30, height: 30, borderRadius: 9999,
    backgroundColor: COLORS.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 12, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.primaryInk },
  reviewNickname: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  starRow: { flexDirection: 'row', gap: 1 },
  reviewComment: { fontSize: FONT_SIZES.bodySm, color: COLORS.text, lineHeight: LINE_HEIGHTS.bodySm * 1.6 },
  // Similar
  similarList: { gap: SPACING.sm },
  similarItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, gap: SPACING.sm, ...SHADOW.sm },
  similarImg: { width: 56, height: 56, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  similarInfo: { flex: 1 },
  similarBrand: { fontSize: 10, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase' },
  similarName: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginVertical: 1 },
  similarPrice: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
  similarTags: { gap: 4, alignItems: 'flex-end' },
  similarTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  similarTagText: { fontSize: 10, fontWeight: FONT_WEIGHTS.semibold },
  // Sticky CTA
  ctaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaHeart: {
    width: BUTTON_HEIGHT.lg, height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaHeartActive: { borderColor: COLORS.accentInk },
  ctaWriteBtn: { flex: 1 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
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
  imageThumbWrap: { position: 'relative', width: 72, height: 72 },
  imageThumb: {
    width: 72, height: 72,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
  },
  imageRemove: {
    position: 'absolute',
    top: -6, right: -6,
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.text,
    justifyContent: 'center', alignItems: 'center',
  },
  imageAddBtn: {
    width: 72, height: 72,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.secondary,
  },
  imageAddText: {
    fontSize: 10,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
  },
  reviewImagesWrap: { marginTop: 10 },
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
