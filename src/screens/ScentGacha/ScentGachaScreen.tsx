import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat,
  withSequence, withDelay, Easing, cancelAnimation, FadeIn,
} from 'react-native-reanimated';
import {
  COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
  BORDER_RADIUS, SHADOW, BUTTON_HEIGHT, SCENT_COLORS, SCENT_TEXT_COLORS,
} from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { usePerfumes } from '../../lib/api/hooks';
import { getScentTagInfo } from '../../lib/scentInfo';
import { BottleGlyph } from '../../components/common/PerfumeCard';
import { Button } from '../../components/common/Button';
import { WishlistHeart } from '../../components/common/WishlistHeart';
import { haptic } from '../../lib/haptic';
import { Perfume, ScentTag } from '../../types';

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
function timeOfDay(d: Date = new Date()): TimeOfDay {
  const h = d.getHours();
  if (h < 11) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

// 시간대별 도입부 — `-요` 어미, 짧고 부드럽게
const OPENERS: Record<TimeOfDay, string[]> = {
  morning: [
    '아침 공기에 가만히 스미는 향이에요.',
    '하루의 첫 숨에 어울려요.',
    '햇살이 막 들 무렵을 닮았어요.',
  ],
  afternoon: [
    '한낮의 잠시 쉬어가는 순간에 어울려요.',
    '오후의 햇볕에 어울리는 향이에요.',
    '느린 산책 같은 향이에요.',
  ],
  evening: [
    '해 진 뒤의 시간에 어울려요.',
    '저녁의 노을빛을 닮았어요.',
    '하루를 정리하는 시간에 어울리는 향이에요.',
  ],
  night: [
    '밤의 고요에 가만히 어울리는 향이에요.',
    '잠들기 전의 차분한 시간을 닮았어요.',
    '어둠 속에서 더 깊어지는 향이에요.',
  ],
};

const CLOSERS = [
  '오늘은 이 향과 함께해 보세요.',
  '잠깐, 향 한 모금 — 어때요?',
  '낯선 향이라도 한 번쯤은 좋은 만남이 돼요.',
  '오늘 하루, 이 향이 같이 다니길.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildStory(perfume: Perfume, when: Date = new Date()): string {
  const opener = pick(OPENERS[timeOfDay(when)]);
  const closer = pick(CLOSERS);
  const tag = perfume.tags[0];
  const info = tag ? getScentTagInfo(tag) : null;
  const middle = info
    ? `${perfume.brand.name}의 ${perfume.name} — ${info.nuance}`
    : `${perfume.brand.name}의 ${perfume.name}.`;
  return `${opener}\n${middle}\n${closer}`;
}

function pickDailyPerfume(all: Perfume[], recentIds: Set<string>): Perfume | null {
  if (all.length === 0) return null;
  const candidates = all.filter((p) => !recentIds.has(p.id));
  const pool = candidates.length > 0 ? candidates : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─────────────────────────────────────────────────────────────
// 화면
// ─────────────────────────────────────────────────────────────
type Phase = 'idle' | 'pulling' | 'revealed';

export const ScentGachaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const gacha = useAppStore((s) => s.gacha);
  const recordPull = useAppStore((s) => s.recordGachaPull);
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isWishlisted = useAppStore((s) => s.isWishlisted);
  const showToast = useAppStore((s) => s.showToast);
  const { data: allPerfumes = [] } = usePerfumes();

  const todayKey = useMemo(() => toKey(new Date()), []);
  const alreadyPulledToday = gacha.lastPullDate === todayKey;
  const todaysEntry = useMemo(
    () => gacha.history.find((h) => h.dateKey === todayKey) ?? null,
    [gacha.history, todayKey],
  );

  const [phase, setPhase] = useState<Phase>(alreadyPulledToday ? 'revealed' : 'idle');
  const [pulledPerfume, setPulledPerfume] = useState<Perfume | null>(null);
  const [pulledStory, setPulledStory] = useState<string>(todaysEntry?.story ?? '');

  // 데이터가 늦게 도착(Supabase)할 수도 있어서 effect로 매핑.
  useEffect(() => {
    if (alreadyPulledToday && todaysEntry && allPerfumes.length > 0) {
      setPulledPerfume(allPerfumes.find((p) => p.id === todaysEntry.perfumeId) ?? null);
    }
  }, [alreadyPulledToday, todaysEntry, allPerfumes]);

  // 카드 애니메이션
  const cardScale = useSharedValue(1);
  const cardRotate = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const idleBob = useSharedValue(0);

  // idle 상태에서 부드럽게 호흡
  useEffect(() => {
    if (phase === 'idle') {
      idleBob.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(idleBob);
      idleBob.value = withTiming(0, { duration: 240 });
    }
  }, [phase]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: idleBob.value },
      { scale: cardScale.value },
      { rotateZ: `${cardRotate.value}deg` },
    ],
    opacity: cardOpacity.value,
  }));

  const handlePull = () => {
    if (phase !== 'idle') return;
    haptic('medium');
    setPhase('pulling');

    // 흔들기 + scale 펌핑 → 페이드아웃 → 결과 fade-in
    cardRotate.value = withSequence(
      withTiming(-6, { duration: 90 }),
      withTiming(6, { duration: 120 }),
      withTiming(-5, { duration: 110 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 90 }),
    );
    cardScale.value = withSequence(
      withTiming(1.04, { duration: 220 }),
      withTiming(0.96, { duration: 200 }),
      withTiming(1.08, { duration: 220 }),
    );
    cardOpacity.value = withDelay(820, withTiming(0, { duration: 180 }));

    setTimeout(() => {
      const recent = new Set(gacha.history.slice(0, 7).map((h) => h.perfumeId));
      const perfume = pickDailyPerfume(allPerfumes, recent);
      if (!perfume) {
        // 데이터가 아직 안 왔거나 비어있는 극단 케이스 — idle로 복귀
        setPhase('idle');
        cardScale.value = 1;
        cardRotate.value = 0;
        cardOpacity.value = withTiming(1, { duration: 260 });
        return;
      }
      const story = buildStory(perfume);
      setPulledPerfume(perfume);
      setPulledStory(story);
      recordPull(todayKey, perfume.id, story);
      haptic('success');
      cardScale.value = 1;
      cardRotate.value = 0;
      cardOpacity.value = withTiming(1, { duration: 260 });
      setPhase('revealed');
    }, 1100);
  };

  const pulledHearted = pulledPerfume ? isWishlisted(pulledPerfume.id) : false;

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
        <Text style={styles.headerTitle}>오늘의 향</Text>
        <View style={{ width: TOUCH_TARGET_MIN }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Text style={styles.introEyebrow}>오늘 만나는 향</Text>
          <Text style={styles.introTitle}>
            {phase === 'revealed' ? '이 향과 함께해요' : '하루 한 번, 우연한 만남'}
          </Text>
        </View>

        {/* 가챠 카드 */}
        <Animated.View style={[styles.heroWrap, heroStyle]}>
          {phase === 'revealed' && pulledPerfume ? (
            <RevealedCard perfume={pulledPerfume} />
          ) : (
            <IdleCard />
          )}
        </Animated.View>

        {/* 액션 영역 */}
        {phase === 'revealed' && pulledPerfume ? (
          <Animated.View entering={FadeIn.duration(360)} style={styles.actions}>
            <View style={styles.brandRow}>
              <Text style={styles.brandText}>{pulledPerfume.brand.name}</Text>
              <WishlistHeart
                active={pulledHearted}
                onToggle={() => {
                  toggleWishlist(pulledPerfume);
                }}
                size={16}
                containerSize={36}
              />
            </View>
            <Text style={styles.perfumeName}>{pulledPerfume.name}</Text>
            <Text style={styles.perfumeMeta}>
              {pulledPerfume.price_krw.toLocaleString()}원 · {pulledPerfume.concentration}
            </Text>

            <View style={styles.tagRow}>
              {pulledPerfume.tags.slice(0, 3).map((t) => (
                <View
                  key={t}
                  style={[styles.tagChip, { backgroundColor: SCENT_COLORS[t] }]}
                >
                  <Text style={[styles.tagChipText, { color: SCENT_TEXT_COLORS[t] }]}>
                    {t}
                  </Text>
                </View>
              ))}
            </View>

            {/* 스토리 */}
            <View style={styles.storyCard}>
              <Ionicons name="leaf-outline" size={14} color={COLORS.primaryDark} style={styles.storyLeaf} />
              <Text style={styles.storyText}>{pulledStory}</Text>
            </View>

            <Button
              title="이 향 자세히 보기"
              icon="information-circle-outline"
              onPress={() => navigation.replace('PerfumeDetail', { perfumeId: pulledPerfume.id })}
            />

            <Button
              variant="outline"
              title={pulledHearted ? '위시리스트에 담겨있어요' : '위시리스트에 담기'}
              icon={pulledHearted ? 'heart' : 'heart-outline'}
              onPress={() => {
                toggleWishlist(pulledPerfume);
                showToast(pulledHearted ? '위시리스트에서 뺐어요' : '위시리스트에 담았어요');
              }}
            />

            <Text style={styles.tomorrow}>내일 새로운 향과 만나요</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(360)} style={styles.idleActions}>
            <Text style={styles.idleHint}>
              랜덤으로 뽑힌 향에{'\n'}오늘만의 짧은 이야기를 더해 드릴게요.
            </Text>
            <Button
              title={phase === 'pulling' ? '뽑는 중…' : '오늘의 향 뽑기'}
              icon="sparkles"
              onPress={handlePull}
              haptic="medium"
              loading={phase === 'pulling'}
              disabled={phase === 'pulling'}
            />
          </Animated.View>
        )}

        {/* 최근 가챠 */}
        {gacha.history.length > 0 && (
          <View style={styles.historyBlock}>
            <Text style={styles.historyTitle}>지난 만남</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyRow}
            >
              {gacha.history.slice(0, 14).map((h) => {
                const p = allPerfumes.find((mp) => mp.id === h.perfumeId);
                if (!p) return null;
                const isToday = h.dateKey === todayKey;
                return (
                  <Pressable
                    key={h.dateKey}
                    onPress={() => navigation.navigate('PerfumeDetail', { perfumeId: p.id })}
                    style={[styles.historyCard, isToday && styles.historyCardToday]}
                  >
                    <BottleGlyph perfume={p} size={36} />
                    <Text style={styles.historyDate}>
                      {isToday ? '오늘' : h.dateKey.slice(5).replace('-', '/')}
                    </Text>
                    <Text style={styles.historyName} numberOfLines={1}>{p.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// 카드들
// ─────────────────────────────────────────────────────────────
// 캡슐 가챠폰 머신 — 유리 돔(캡슐) + 그린 본체 + 손잡이 + 배출구
const CAPSULE_COLORS = [
  '#FBDCE8', '#FDF1C4', '#D8EEFC', '#EBDFF1',
  '#D9ECCF', '#F8D6C8', '#CFEDEF', '#F7DDE6', '#F6DEB6',
];

const IdleCard: React.FC = () => (
  <View style={styles.machineWrap}>
    {/* 유리 돔 — 안에 알록달록 캡슐 */}
    <View style={styles.dome}>
      <View style={styles.domeInner}>
        {CAPSULE_COLORS.map((c, i) => (
          <View key={i} style={[styles.capsule, { backgroundColor: c }]}>
            <View style={styles.capsuleShine} />
          </View>
        ))}
      </View>
      {/* 유리 반사광 */}
      <View style={styles.domeGlare} />
    </View>

    {/* 본체 */}
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primaryInk]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.machineBody}
    >
      <View style={styles.controlRow}>
        {/* 손잡이 */}
        <View style={styles.knob}>
          <View style={styles.knobBar} />
        </View>
        {/* 코인 투입구 */}
        <View style={styles.coinSlot} />
      </View>
      {/* 캡슐 배출구 */}
      <View style={styles.tray}>
        <View style={styles.trayMouth} />
      </View>
    </LinearGradient>
  </View>
);

const RevealedCard: React.FC<{ perfume: Perfume }> = ({ perfume }) => {
  // 첫 번째 태그를 카드 컬러로 — 향과 시각이 통일감
  const tag = perfume.tags[0] as ScentTag | undefined;
  const bg = tag ? SCENT_COLORS[tag] : COLORS.primaryLight;
  const bg2 = tag ? COLORS.secondary : COLORS.primaryMid;
  return (
    <LinearGradient
      colors={[bg, bg2]}
      start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
      style={styles.heroCard}
    >
      <BottleGlyph perfume={perfume} size={96} />
    </LinearGradient>
  );
};

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
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  intro: { alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  introEyebrow: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
  },
  introTitle: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    marginTop: 6,
    letterSpacing: -0.5,
  },

  heroWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  heroCard: {
    width: '100%',
    height: 260,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  // ── 캡슐 가챠폰 머신 ──────────────────────────────
  machineWrap: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dome: {
    width: 184,
    height: 150,
    borderTopLeftRadius: 92,
    borderTopRightRadius: 92,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 3,
    borderColor: COLORS.white,
    overflow: 'hidden',
    zIndex: 2,
    ...SHADOW.md,
  },
  domeInner: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 22,
    paddingTop: 26,
  },
  capsule: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  capsuleShine: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  domeGlare: {
    position: 'absolute',
    top: 14,
    left: 22,
    width: 38,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ rotate: '20deg' }],
  },
  machineBody: {
    width: 206,
    marginTop: -16,
    paddingTop: 26,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.sm + 2,
    zIndex: 1,
    ...SHADOW.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  knob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobBar: {
    width: 26,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryInk,
  },
  coinSlot: {
    width: 9,
    height: 30,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  tray: {
    width: '100%',
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trayMouth: {
    width: 110,
    height: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  idleActions: { alignItems: 'center', gap: SPACING.md },
  idleHint: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.bodySm * 1.5,
  },

  actions: { gap: SPACING.sm + 2 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  brandText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  perfumeName: {
    fontSize: FONT_SIZES.h2,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  perfumeMeta: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  tagRow: { flexDirection: 'row', gap: 6, marginTop: SPACING.sm, flexWrap: 'wrap' },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  tagChipText: { fontSize: 11, fontWeight: FONT_WEIGHTS.bold },

  storyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md + 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm + 2,
    marginBottom: SPACING.sm,
    position: 'relative',
    ...SHADOW.sm,
  },
  storyLeaf: { position: 'absolute', top: 12, right: 12 },
  storyText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.body * 1.55,
    fontWeight: FONT_WEIGHTS.medium,
  },

  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryDark,
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOW.md,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: COLORS.white, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  secondaryBtnText: { color: COLORS.primaryInk, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold },

  tomorrow: {
    textAlign: 'center',
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },

  historyBlock: { marginTop: SPACING.xl },
  historyTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  historyRow: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  historyCard: {
    width: 96,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs + 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  historyCardToday: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.secondary },
  historyDate: {
    fontSize: 10,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: 2,
  },
  historyName: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
});
