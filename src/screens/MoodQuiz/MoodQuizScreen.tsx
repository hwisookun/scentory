import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInRight, FadeIn,
} from 'react-native-reanimated';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, BUTTON_HEIGHT, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { SPRING } from '../../constants/motion';
import { getNoteInfo } from '../../lib/scentInfo';
import { usePerfumes } from '../../lib/api/hooks';
import { useAppStore } from '../../store/useAppStore';
import { PressableScale } from '../../components/common/PressableScale';
import { BottleGlyph } from '../../components/common/PerfumeCard';
import { HyangiAvatar } from '../../components/common/HyangiAvatar';
import { ScentTag, Perfume } from '../../types';
import { haptic } from '../../lib/haptic';

// ---------- 질문 정의 ----------
interface QuizOption {
  label: string;
  emoji: string;
  // 이 옵션이 선호하는 향 계열 가중치
  scents: Partial<Record<ScentTag, number>>;
}
interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'pool',
    prompt: '경험하고 싶은 향이 있어요?',
    options: [
      { label: '네, 가지고 있진 않지만 한 번 만나 볼래요', emoji: '✨', scents: {} },
      { label: '아니요, 제가 가진 향수에서 골라 주세요', emoji: '🪞', scents: {} },
    ],
  },
  {
    id: 'mood',
    prompt: '오늘 끌리는 무드는?',
    options: [
      { label: '밝고 활기차게', emoji: '☀️', scents: { '시트러스': 3, '프레시': 2, '허벌': 1 } },
      { label: '차분하고 진중하게', emoji: '🌿', scents: { '우디': 3, '머스크': 2, '아이리스': 2 } },
      { label: '신비롭고 매력적', emoji: '🌙', scents: { '오리엔탈': 3, '스모키': 2, '레더': 2 } },
      { label: '편안하고 따뜻하게', emoji: '☕️', scents: { '구르망': 3, '발사믹': 2, '파우더리': 2 } },
    ],
  },
  {
    id: 'scene',
    prompt: '어떤 자리에 가요?',
    options: [
      { label: '출근·미팅', emoji: '💼', scents: { '우디': 2, '푸제르': 2, '시프레': 2, '머스크': 1 } },
      { label: '데이트·약속', emoji: '💕', scents: { '플로럴': 3, '구르망': 2, '파우더리': 1 } },
      { label: '친구·모임', emoji: '🥂', scents: { '프레시': 2, '시트러스': 2, '스파이시': 1 } },
      { label: '혼자만의 시간', emoji: '🛋️', scents: { '머스크': 2, '아이리스': 2, '발사믹': 1, '파우더리': 1 } },
    ],
  },
  {
    id: 'season',
    prompt: '오늘 날씨/계절감은?',
    options: [
      { label: '봄, 산뜻하게', emoji: '🌸', scents: { '플로럴': 3, '그린': 2, '허벌': 1 } },
      { label: '여름, 청량하게', emoji: '🌊', scents: { '아쿠아틱': 3, '시트러스': 2, '프레시': 2 } },
      { label: '가을, 깊이 있게', emoji: '🍂', scents: { '우디': 3, '스파이시': 2, '레더': 1 } },
      { label: '겨울, 포근하게', emoji: '❄️', scents: { '오리엔탈': 2, '구르망': 2, '발사믹': 2, '머스크': 1 } },
    ],
  },
  {
    id: 'depth',
    prompt: '향의 강도는?',
    options: [
      { label: '가볍게 은은히', emoji: '🪶', scents: { '프레시': 2, '시트러스': 2, '플로럴': 1 } },
      { label: '균형감 있게', emoji: '⚖️', scents: { '우디': 1, '플로럴': 1, '머스크': 1, '시프레': 1 } },
      { label: '진하고 인상적으로', emoji: '🎭', scents: { '오리엔탈': 3, '레더': 2, '스모키': 2 } },
    ],
  },
];

// ---------- 추천 계산 ----------
function computeWeights(answers: QuizOption[]): Partial<Record<ScentTag, number>> {
  const weights: Partial<Record<ScentTag, number>> = {};
  for (const a of answers) {
    for (const [tag, w] of Object.entries(a.scents) as [ScentTag, number][]) {
      weights[tag] = (weights[tag] ?? 0) + w;
    }
  }
  return weights;
}

function pickBestPerfume(answers: QuizOption[], pool: Perfume[]): Perfume | null {
  if (pool.length === 0) return null;
  const weights = computeWeights(answers);
  let best: Perfume = pool[0];
  let bestScore = -Infinity;
  for (const p of pool) {
    let score = 0;
    for (const tag of p.tags) {
      score += weights[tag] ?? 0;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

/**
 * 4개 답변(mood/scene/season/depth)을 자연스러운 추천 사유로 변환.
 * 향이 마스코트가 말하는 톤 — `-요` 어미, 따뜻하고 부드럽게.
 */
function buildReasoning(answers: QuizOption[], matched: Perfume): string {
  const weights = computeWeights(answers);
  const sortedTags = (Object.entries(weights) as [ScentTag, number][])
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);
  // 추천된 향수가 실제로 갖고 있는 태그 중, 가중치 순으로 가장 위에 있는 것
  const matchedTag = sortedTags.find((t) => matched.tags.includes(t)) ?? matched.tags[0];

  // answers[0]은 pool 게이팅 질문이라 추천 사유에는 쓰지 않아요.
  const moodLabel = answers[1]?.label ?? '';
  const sceneLabel = answers[2]?.label ?? '';
  const seasonHead = (answers[3]?.label ?? '').split(',')[0]; // "봄, 산뜻하게" → "봄"
  const depthLabel = (answers[4]?.label ?? '').replace(/[은이가]?$/, '');

  return `${moodLabel} 무드에 ${seasonHead}, ${sceneLabel} 자리라면 ${matchedTag} 계열이 잘 어울려요. ${depthLabel} 즐기시도록 골라 봤어요.`;
}

// ---------- 노트 섹션 (탑/미들/베이스) ----------
const NoteSection: React.FC<{ title: string; subtitle: string; notes: string[] }> = ({
  title, subtitle, notes,
}) => {
  if (!notes || notes.length === 0) return null;
  return (
    <View style={styles.noteRow}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{title}</Text>
        <Text style={styles.noteSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.noteList}>
        {notes.map((n) => {
          const info = getNoteInfo(n);
          return (
            <View key={n} style={styles.noteItem}>
              <View style={styles.noteBullet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteName}>{n}</Text>
                <Text style={styles.noteDesc}>{info.description}</Text>
                <Text style={styles.noteNuance}>{info.nuance}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ---------- 화면 ----------
export const MoodQuizScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { toggleWishlist, isWishlisted, showToast } = useAppStore();
  const wishlist = useAppStore((s) => s.wishlist);
  const collections = useAppStore((s) => s.collections);
  const { data: allPerfumes = [] } = usePerfumes();

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizOption[]>([]);
  const [finished, setFinished] = useState(false);

  const total = QUESTIONS.length;
  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const select = (opt: QuizOption) => {
    haptic('selection');
    const next = [...answers, opt];
    setAnswers(next);
    const nextIdx = stepIdx + 1;
    progress.value = withSpring((nextIdx) / total, SPRING.snappy);
    if (nextIdx >= total) {
      // 결과 계산 + 완료 화면으로
      setTimeout(() => {
        setFinished(true);
        haptic('success');
      }, 200);
    } else {
      setStepIdx(nextIdx);
    }
  };

  const back = () => {
    if (stepIdx === 0) {
      navigation.goBack();
      return;
    }
    haptic('light');
    const prevIdx = stepIdx - 1;
    setAnswers(answers.slice(0, prevIdx));
    setStepIdx(prevIdx);
    progress.value = withSpring(prevIdx / total, SPRING.snappy);
  };

  // 첫 번째 질문(pool)이 'No'면 사용자가 가진 향수(위시리스트 + 컬렉션)에서만 추천
  const ownedOnly = answers[0]?.label.startsWith('아니요') ?? false;

  const pool = useMemo<Perfume[]>(() => {
    if (!finished) return [];
    if (!ownedOnly) return allPerfumes;
    const ids = new Set<string>([
      ...wishlist.map((w) => w.perfume_id),
      ...collections.map((c) => c.perfume_id),
    ]);
    return allPerfumes.filter((p) => ids.has(p.id));
  }, [finished, ownedOnly, wishlist, collections, allPerfumes]);

  const matched = useMemo(
    () => (finished ? pickBestPerfume(answers, pool) : null),
    [finished, answers, pool],
  );
  const matchedWishlisted = matched ? isWishlisted(matched.id) : false;
  const reasoning = useMemo(
    () => (matched ? buildReasoning(answers, matched) : ''),
    [matched, answers],
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  // 'No'를 골랐는데 보유 향수가 없는 경우 — 결과 단계에서 empty state로 안내
  const emptyOwned = finished && ownedOnly && pool.length === 0;

  const restart = () => {
    setStepIdx(0);
    setAnswers([]);
    setFinished(false);
    setDetailsOpen(false);
    progress.value = withSpring(0, SPRING.snappy);
  };

  if (emptyOwned) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>오늘의 향</Text>
          <View style={{ width: TOUCH_TARGET_MIN }} />
        </View>
        <View style={styles.emptyOwned}>
          <Ionicons name="heart-outline" size={56} color={COLORS.gray300} />
          <Text style={styles.emptyOwnedTitle}>아직 담아 둔 향이 없어요</Text>
          <Text style={styles.emptyOwnedSub}>
            먼저 마음에 드는 향수를 위시리스트에 담아 두면{'\n'}그 안에서 오늘의 한 가지를 골라 드릴게요.
          </Text>
          <PressableScale style={styles.primaryBtn} onPress={restart} haptic="light">
            <Ionicons name="refresh" size={20} color={COLORS.white} />
            <Text style={styles.primaryBtnText}>다시 답해 볼래요</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  if (finished && matched) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>오늘의 향</Text>
          <View style={{ width: TOUCH_TARGET_MIN }} />
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          {/* 향이의 추천 사유 — 말풍선 */}
          <Animated.View entering={FadeIn.duration(360)} style={styles.bubbleRow}>
            <View style={styles.bubbleAvatar}>
              <HyangiAvatar size={48} bob sparkles />
            </View>
            <View style={styles.bubble}>
              <View style={styles.bubbleTail} />
              <View style={styles.bubbleTailInner} />
              <Text style={styles.bubbleEyebrow}>향이의 한마디</Text>
              <Text style={styles.bubbleText}>{reasoning}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(360).delay(80)} style={styles.resultIntro}>
            <Text style={styles.resultEyebrow}>당신의 무드와 가장 잘 어울리는</Text>
            <Text style={styles.resultTitle}>이 향수예요</Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(160)}>
            <LinearGradient
              colors={['#F0F8F3', '#DCF1E2']}
              start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
              style={styles.resultHero}
            >
              <BottleGlyph perfume={matched} size={92} />
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(220)} style={styles.resultInfo}>
            <Text style={styles.resultBrand}>{matched.brand.name}</Text>
            <Text style={styles.resultName}>{matched.name}</Text>
            <Text style={styles.resultPrice}>{matched.price_krw.toLocaleString()}원 · {matched.concentration}</Text>
            <View style={styles.resultTags}>
              {matched.tags.slice(0, 3).map((t) => (
                <View key={t} style={styles.resultTag}>
                  <Text style={styles.resultTagText}>{t}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* 향 자세히 — 토글 펼침 */}
          <Animated.View entering={FadeIn.duration(420).delay(260)} style={styles.detailsCard}>
            <Pressable
              onPress={() => { haptic('selection'); setDetailsOpen((v) => !v); }}
              style={styles.detailsHeader}
            >
              <View style={styles.detailsTitleRow}>
                <Ionicons name="flask-outline" size={18} color={COLORS.primaryDark} />
                <Text style={styles.detailsTitle}>이 향, 자세히 알기</Text>
              </View>
              <Ionicons
                name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.gray500}
              />
            </Pressable>

            {detailsOpen && (
              <Animated.View entering={FadeIn.duration(220)} style={styles.detailsBody}>
                <NoteSection title="탑 노트" subtitle="첫 인상" notes={matched.top_notes} />
                <NoteSection title="미들 노트" subtitle="중심 향" notes={matched.middle_notes} />
                <NoteSection title="베이스 노트" subtitle="잔향" notes={matched.base_notes} />
                {matched.tags.length > 3 && (
                  <View style={styles.allTagsWrap}>
                    <Text style={styles.detailsLabel}>전체 향 계열</Text>
                    <View style={styles.allTagsRow}>
                      {matched.tags.map((t) => (
                        <View key={t} style={styles.resultTag}>
                          <Text style={styles.resultTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {matched.rating != null && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={COLORS.star} />
                    <Text style={styles.ratingText}>
                      {matched.rating.toFixed(1)}
                      {matched.review_count ? <Text style={styles.ratingCount}>  ({matched.review_count.toLocaleString()})</Text> : null}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(320)} style={styles.resultActions}>
            <PressableScale
              style={[styles.primaryBtn, matchedWishlisted && styles.primaryBtnActive]}
              onPress={() => {
                toggleWishlist(matched);
                showToast(matchedWishlisted ? '위시리스트에서 뺐어요' : '위시리스트에 담았어요');
              }}
              haptic="medium"
            >
              <Ionicons
                name={matchedWishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.primaryBtnText}>
                {matchedWishlisted ? '위시리스트에 담겨있어요' : '위시리스트에 담기'}
              </Text>
            </PressableScale>

            <PressableScale style={styles.secondaryBtn} onPress={restart} haptic="light">
              <Ionicons name="refresh" size={18} color={COLORS.primaryInk} />
              <Text style={styles.secondaryBtnText}>다시 추천</Text>
            </PressableScale>
            <PressableScale
              style={styles.secondaryBtn}
              onPress={() => navigation.replace('PerfumeDetail', { perfumeId: matched.id })}
              haptic="light"
            >
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryInk} />
              <Text style={styles.secondaryBtnText}>자세히 보기</Text>
            </PressableScale>

            <Pressable onPress={() => navigation.goBack()} style={styles.exitBtn}>
              <Text style={styles.exitBtnText}>닫기</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = QUESTIONS[stepIdx];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={back} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={stepIdx === 0 ? 'close' : 'arrow-back'} size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>오늘의 무드</Text>
        <Text style={styles.headerCount}>{stepIdx + 1} / {total}</Text>
      </View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <Animated.View
        key={q.id}
        entering={FadeInRight.springify().damping(20).stiffness(160)}
        style={styles.content}
      >
        <Text style={styles.prompt}>{q.prompt}</Text>
        <Text style={styles.promptSub}>가장 가까운 것을 골라주세요</Text>

        <View style={styles.optionList}>
          {q.options.map((opt) => (
            <PressableScale
              key={opt.label}
              style={styles.optionBtn}
              onPress={() => select(opt)}
              scaleTo={0.97}
              haptic="selection"
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
            </PressableScale>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.h4, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  headerCount: {
    minWidth: TOUCH_TARGET_MIN, textAlign: 'right',
    fontSize: FONT_SIZES.small, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold,
  },

  progressBar: {
    height: 6, marginHorizontal: SPACING.md,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.full,
  },

  content: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.xl },
  prompt: {
    fontSize: FONT_SIZES.h2, fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text, letterSpacing: -0.5,
  },
  promptSub: {
    fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary,
    marginTop: 6, marginBottom: SPACING.xl,
  },

  optionList: { gap: SPACING.sm + 2 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    minHeight: 60,
    ...SHADOW.sm,
  },
  optionEmoji: { fontSize: 26 },
  optionLabel: { flex: 1, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },

  // 결과 화면
  resultScroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },

  // 향이 말풍선
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  bubbleAvatar: {
    width: 48,
    paddingTop: 4,
  },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    position: 'relative',
  },
  // 좌측 꼬리 — 외곽선용(어두운 보더) + 안쪽 채움 2겹
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 16,
    width: 0, height: 0,
    borderTopWidth: 7, borderTopColor: 'transparent',
    borderBottomWidth: 7, borderBottomColor: 'transparent',
    borderRightWidth: 8, borderRightColor: COLORS.primaryLight,
  },
  bubbleTailInner: {
    position: 'absolute',
    left: -6,
    top: 17,
    width: 0, height: 0,
    borderTopWidth: 6, borderTopColor: 'transparent',
    borderBottomWidth: 6, borderBottomColor: 'transparent',
    borderRightWidth: 7, borderRightColor: COLORS.secondary,
  },
  bubbleEyebrow: {
    fontSize: 10,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bubbleText: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm * 1.45,
    fontWeight: FONT_WEIGHTS.medium,
  },

  resultIntro: { alignItems: 'center', marginBottom: SPACING.lg },
  resultEyebrow: { fontSize: FONT_SIZES.small, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.5 },
  resultTitle: { fontSize: FONT_SIZES.h1, fontWeight: FONT_WEIGHTS.black, color: COLORS.text, marginTop: 6, letterSpacing: -0.6 },
  resultHero: {
    height: 240,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  resultInfo: { alignItems: 'center', marginBottom: SPACING.xl },
  resultBrand: {
    fontSize: 11, color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
  },
  resultName: { fontSize: FONT_SIZES.h2, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text, letterSpacing: -0.4 },
  resultPrice: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, marginTop: 6 },
  resultTags: { flexDirection: 'row', gap: 6, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  resultTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  resultTagText: { fontSize: 11, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primaryInk },

  // 향 자세히 카드
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: TOUCH_TARGET_MIN,
  },
  detailsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  detailsTitle: { fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  detailsBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  detailsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  noteRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  noteTitle: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.primaryInk },
  noteSubtitle: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium },
  noteList: { gap: SPACING.sm + 2 },
  noteItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  noteBullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
    marginTop: 8,
  },
  noteName: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  noteDesc: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
  },
  noteNuance: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.small * 1.4,
    marginTop: 2,
  },
  allTagsWrap: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  allTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ratingText: { fontSize: FONT_SIZES.body, color: COLORS.text, fontWeight: FONT_WEIGHTS.bold },
  ratingCount: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.medium },

  resultActions: { gap: SPACING.sm + 2 },
  primaryBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primaryDark,
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOW.md,
  },
  primaryBtnActive: { backgroundColor: COLORS.accentInk },
  primaryBtnText: { color: COLORS.white, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold },
  // 세로 스택 — 이전엔 flex:1로 가로 분할이었지만 시각적으로 얇아 보여서
  // primary와 동일한 풀-폭으로 통일.
  secondaryBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  secondaryBtnText: { color: COLORS.primaryInk, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold },
  exitBtn: { alignItems: 'center', paddingVertical: SPACING.md, marginTop: 4 },
  exitBtnText: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },

  emptyOwned: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyOwnedTitle: {
    fontSize: FONT_SIZES.h3,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptyOwnedSub: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.bodySm * 1.5,
    marginBottom: SPACING.md,
  },
});
