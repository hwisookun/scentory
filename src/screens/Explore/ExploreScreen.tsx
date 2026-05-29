import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  TouchableOpacity, Platform, RefreshControl,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  FadeInDown,
} from 'react-native-reanimated';
import { haptic } from '../../lib/haptic';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { PerfumeCard, BottleGlyph } from '../../components/common/PerfumeCard';
import {
  COLORS, SPACING, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { usePerfumes, useBrands } from '../../lib/api/hooks';
import { PressableScale } from '../../components/common/PressableScale';
import {
  NotifPanel, INITIAL_NOTIFICATIONS, configureClearAllLayoutAnim,
  type NotifItem,
} from './components/NotifPanel';
import { BannerCarousel } from './components/BannerCarousel';
import { TodayPerfumeStrip } from './components/TodayPerfumeStrip';
import { BrandGrid } from './components/BrandGrid';

const TODAY_IDS = ['d1', 'cr1', 'mm2', 'll1', 'pm1'];

// Pull-to-refresh
const PULL_THRESHOLD = 72;
const PULL_INDICATOR_HEIGHT = 80;

// 4-버튼 메인 액션 그리드 — 단순해서 inline 유지
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
}
const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, bg, fg, onPress }) => (
  <PressableScale style={styles.actionBtn} onPress={onPress} haptic="light" scaleTo={0.94}>
    <View style={[styles.actionIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={22} color={fg} />
    </View>
    <Text style={styles.actionLabel} numberOfLines={2}>{label}</Text>
  </PressableScale>
);

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { data: perfumes = [] } = usePerfumes();
  const { data: brands = [] } = useBrands();
  const outerScrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // 활성 탭 재탭 시 최상단으로 스크롤
  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) return;
    const unsub = parent.addListener('tabPress', () => {
      if (isFocused) {
        outerScrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation, isFocused]);

  // ── Pull-to-refresh — 병이 기울었다가 일어남 ──────────────
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useSharedValue(0);
  const refreshSway = useSharedValue(0);
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => { pullY.value = value; });
    return () => scrollY.removeListener(id);
  }, []);
  useEffect(() => {
    if (refreshing) {
      refreshSway.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 420 }),
          withTiming(12, { duration: 420 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(refreshSway);
      refreshSway.value = withTiming(0, { duration: 280 });
    }
  }, [refreshing]);

  const triggerRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    haptic('medium');
    // mock 리프레시 — API 연결 시 await 데이터 패치로 교체
    setTimeout(() => {
      setRefreshing(false);
      haptic('success');
    }, 1400);
  }, [refreshing]);

  // iOS: overscroll-bounce + 커스텀 병 인디케이터로 트리거
  const onEndDrag = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (Platform.OS !== 'ios') return;
    const y = e.nativeEvent.contentOffset.y;
    if (y < -PULL_THRESHOLD) triggerRefresh();
  };

  const bottleStyle = useAnimatedStyle(() => {
    if (refreshing) {
      return {
        opacity: 1,
        transform: [{ rotateZ: `${refreshSway.value}deg` }, { scale: 1 }],
      };
    }
    const pull = Math.max(0, -pullY.value);
    const progress = Math.min(pull / PULL_THRESHOLD, 1);
    return {
      opacity: progress,
      transform: [
        { rotateZ: `${-26 * progress}deg` },
        { scale: 0.7 + progress * 0.3 },
      ],
    };
  });

  // ── 알림 패널 상태 — 데이터는 부모가 소유 (벨 badge가 unreadCount 필요) ─
  const [notifications, setNotifications] = useState<NotifItem[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [notifOpen, setNotifOpen] = useState(false);
  const removeOne = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => {
    configureClearAllLayoutAnim();
    setNotifications([]);
  };

  const todayTop = perfumes.filter((p) => TODAY_IDS.includes(p.id));

  // 스크롤에 따른 헤더 효과 — 로고 컬러 + 하단 분리선
  const logoColor = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [COLORS.primaryInk, COLORS.primaryDeep],
    extrapolate: 'clamp',
  });
  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 고정 헤더 */}
      <View style={styles.header}>
        <Animated.Text style={[styles.logo, { color: logoColor }]}>맡다.</Animated.Text>
        <TouchableOpacity style={styles.notifBtn} onPress={() => setNotifOpen(true)} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          {unreadCount > 0 && (
            <View style={styles.notifDot}>
              <Text style={styles.notifDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Animated.View style={[styles.headerBorder, { opacity: headerBorderOpacity }]} />
      </View>

      <Animated.ScrollView
        ref={outerScrollRef as React.Ref<ScrollView>}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        onScrollEndDrag={onEndDrag}
        refreshControl={
          // Android: bounce 안 됨 → 스톡 RefreshControl 폴백
          // iOS: undefined (커스텀 병 인디케이터가 처리)
          Platform.OS === 'android' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={triggerRefresh}
              colors={[COLORS.primaryDark]}
              tintColor={COLORS.primaryDark}
              progressBackgroundColor={COLORS.white}
            />
          ) : undefined
        }
      >
        {/* Pull-to-refresh 인디케이터 — 콘텐츠 위로 음의 top, overscroll 시 노출 */}
        <View style={{ height: 0 }}>
          <Reanimated.View style={[styles.pullIndicator, bottleStyle]}>
            {perfumes[0] && <BottleGlyph perfume={perfumes[0]} size={36} />}
          </Reanimated.View>
        </View>

        {/* 검색창 — 탭하면 SearchScreen으로 */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
          <Text style={styles.searchPlaceholder}>향수명, 브랜드, 원료 검색</Text>
        </TouchableOpacity>

        {/* 이벤트 배너 */}
        <BannerCarousel onViewAll={() => navigation.navigate('Events')} />

        {/* 메인 액션 4-버튼 — 향수 발견을 위한 진입점 */}
        <View style={styles.actionRow}>
          <ActionButton
            icon="sparkles"
            label={'오늘의\n무드 추천'}
            bg="#FFF3E0"
            fg="#C77F1B"
            onPress={() => navigation.navigate('MoodQuiz')}
          />
          <ActionButton
            icon="calendar"
            label={'향수\n다이어리'}
            bg="#E3F2FD"
            fg="#3A6FA8"
            onPress={() => navigation.navigate('PerfumeDiary')}
          />
          <ActionButton
            icon="library"
            label={'향 도감'}
            bg="#E8F4ED"
            fg={COLORS.primaryDark}
            onPress={() => navigation.navigate('ScentLibrary')}
          />
          <ActionButton
            icon="gift"
            label={'오늘의\n향 가챠'}
            bg="#FCE4EC"
            fg="#D14E7A"
            onPress={() => navigation.navigate('ScentGacha')}
          />
        </View>

        {/* 오늘의 향수 TOP */}
        <TodayPerfumeStrip
          perfumes={todayTop}
          onPressPerfume={(perfumeId) => navigation.navigate('PerfumeDetail', { perfumeId })}
        />

        {/* 취향 기반 추천 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이런 향수는 어떠세요?</Text>
            <Text style={styles.sectionSub}>취향 기반 추천</Text>
          </View>
          <View style={styles.gridContainer}>
            {perfumes.slice(10, 18).map((p, i) => (
              <Reanimated.View
                key={p.id}
                entering={FadeInDown.springify().damping(18).stiffness(140).delay(i * 60)}
                style={styles.cardGrid}
              >
                <PerfumeCard
                  perfume={p}
                  onPress={() => navigation.navigate('PerfumeDetail', { perfumeId: p.id })}
                />
              </Reanimated.View>
            ))}
          </View>
        </View>

        {/* 브랜드 둘러보기 */}
        <BrandGrid
          brands={brands}
          scrollY={scrollY}
          onPressBrand={() => navigation.navigate('Search')}
        />

        <View style={{ height: SPACING.xl }} />
      </Animated.ScrollView>

      {/* 알림 사이드 패널 */}
      <NotifPanel
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onRemove={removeOne}
        onClearAll={clearAll}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  headerBorder: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  logo: { fontSize: FONT_SIZES.h1, fontWeight: FONT_WEIGHTS.black, letterSpacing: -0.5 },
  notifBtn: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGET_MIN, minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    minWidth: 16, height: 16, paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#E15A5A',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.background,
  },
  notifDotText: { color: COLORS.white, fontSize: 9, fontWeight: FONT_WEIGHTS.extrabold, lineHeight: 11 },

  pullIndicator: {
    position: 'absolute',
    top: -PULL_INDICATOR_HEIGHT,
    left: 0,
    right: 0,
    height: PULL_INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: 13,
    minHeight: TOUCH_TARGET_MIN,
    borderRadius: 14, gap: SPACING.sm,
    borderWidth: 1.5, borderColor: 'transparent',
    ...SHADOW.sm,
  },
  searchPlaceholder: { flex: 1, fontSize: FONT_SIZES.body, color: COLORS.textSecondary },

  // 메인 액션 4-버튼 줄
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 54, height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 14,
  },

  section: { padding: SPACING.md },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  sectionSub: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, lineHeight: FONT_SIZES.small * 1.5 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cardGrid: { width: '48.5%' },
});
