import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, Modal, Pressable,
  TouchableOpacity, Dimensions, LayoutAnimation, Platform, UIManager,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  LinearTransition,
  FadeInDown,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { haptic } from '../../lib/haptic';
import { SPRING } from '../../constants/motion';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { PerfumeCard, BottleGlyph } from '../../components/common/PerfumeCard';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { usePerfumes, useBrands } from '../../lib/api/hooks';
import { Brand, Perfume } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { PressableScale } from '../../components/common/PressableScale';
import { WishlistHeart } from '../../components/common/WishlistHeart';

const BRAND_TINTS: ReadonlyArray<readonly [string, string]> = [
  ['#F0F8F3', '#DCF1E2'], // mint
  ['#FFF3E0', '#FFE0B2'], // warm beige
  ['#EDE7F6', '#D1C4E9'], // soft purple
  ['#E3F2FD', '#BBDEFB'], // soft blue
  ['#FCE4EC', '#F8BBD0'], // soft pink
  ['#FFF9C4', '#FFF59D'], // soft yellow
];

function brandInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface NotifRowProps {
  item: NotifItem;
  panelWidth: number;
  onRemove: (id: string) => void;
}

const NotifRow: React.FC<NotifRowProps> = ({ item, panelWidth, onRemove }) => {
  // Reanimated v4 — 모든 트랜스폼/오파시티가 UI 스레드에서 60fps 동작
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const DISMISS_DISTANCE = panelWidth * 0.32; // 패널 너비의 32% 끌면 dismiss
  const DISMISS_VELOCITY = 700; // px/s 이상 빠르게 던지면 dismiss

  const finishRemove = () => {
    haptic('light');
    onRemove(item.id);
  };

  const pan = Gesture.Pan()
    // 가로 스와이프만 활성화 — 세로 스크롤 방해 X
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      // 끌수록 옅어짐 — 시각적 피드백
      const ratio = Math.min(Math.abs(e.translationX) / panelWidth, 1);
      opacity.value = 1 - ratio * 0.7;
    })
    .onEnd((e) => {
      const shouldDismiss =
        Math.abs(e.translationX) > DISMISS_DISTANCE ||
        Math.abs(e.velocityX) > DISMISS_VELOCITY;

      if (shouldDismiss) {
        // 끌린 방향으로 화면 밖까지 (또는 panelWidth만큼) 보내고 → 제거
        const dir = e.translationX >= 0 ? 1 : -1;
        const exit = dir * panelWidth;
        translateX.value = withTiming(exit, { duration: 180 });
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) scheduleOnRN(finishRemove);
        });
      } else {
        // 스프링으로 원위치 복귀
        translateX.value = withSpring(0, SPRING.snappy);
        opacity.value = withSpring(1, SPRING.snappy);
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const ic = NOTIF_TYPE_STYLE[item.type];

  return (
    <GestureDetector gesture={pan}>
      <Reanimated.View
        style={[styles.notifItemWrap, containerStyle]}
        layout={LinearTransition.springify().damping(20).stiffness(160)}
      >
        <View style={[styles.notifItem, item.unread && styles.notifItemUnread]}>
          {/* iOS는 native blur, Android는 솔리드 배경 — expo-blur의 Android 렌더링 아티팩트 회피 */}
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={item.unread ? 60 : 50}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                item.unread ? styles.notifBgAndroidUnread : styles.notifBgAndroid,
              ]}
            />
          )}
          <View style={[styles.notifIcon, { backgroundColor: ic.bg }]}>
            <Ionicons name={ic.icon} size={18} color={ic.fg} />
          </View>
          <View style={styles.notifBody}>
            <View style={styles.notifTopRow}>
              <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifText} numberOfLines={2}>{item.body}</Text>
          </View>
          {item.unread && <View style={styles.notifUnreadDot} />}
        </View>
      </Reanimated.View>
    </GestureDetector>
  );
};

interface TodayCardProps {
  perfume: Perfume;
  onPress: () => void;
}

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

const TodayCard: React.FC<TodayCardProps> = ({ perfume, onPress }) => {
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const wishlisted = useAppStore((s) => s.wishlist.some((w) => w.perfume_id === perfume.id));
  return (
    <TouchableOpacity style={styles.todayCard} onPress={onPress} activeOpacity={0.88}>
      <LinearGradient
        colors={['#F0F8F3', '#DCF1E2']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.todayImgWrap}
      >
        <BottleGlyph perfume={perfume} size={48} />
        {perfume.brand.isNiche && (
          <View style={styles.nicheBadge}>
            <Text style={styles.nicheBadgeText}>니치</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.todayInfo}>
        <Text style={styles.todayBrand}>{perfume.brand.name}</Text>
        <View style={styles.todayNameRow}>
          <Text style={styles.todayName} numberOfLines={1}>{perfume.name}</Text>
          <WishlistHeart
            active={wishlisted}
            onToggle={() => toggleWishlist(perfume)}
            size={14}
            containerSize={28}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </View>
        <View style={styles.todayFooter}>
          <View style={styles.todayMeta}>
            <Ionicons name="star" size={11} color={COLORS.star} />
            <Text style={styles.todayRatingText}>{perfume.rating?.toFixed(1)}</Text>
          </View>
          <View style={styles.todayPriceBlock}>
            <Text style={styles.todayVolumeLabel}>50ML</Text>
            <Text style={styles.todayPrice}>
              {perfume.price_krw.toLocaleString()}
              <Text style={styles.todayPriceUnit}>원</Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface BrandCardProps {
  brand: Brand;
  index: number;
  scrollY: Animated.Value;
  onPress: () => void;
}

const BrandCard: React.FC<BrandCardProps> = ({
  brand, index, scrollY, onPress,
}) => {
  const ref = useRef<View>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const tY = useRef(new Animated.Value(28)).current;
  const revealedRef = useRef(false);

  const reveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(tY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 60 }),
    ]).start();
  };

  // Use measureInWindow (no relative-node arg, works on any host View)
  // to check whether the card's top has entered the visible window.
  const check = () => {
    if (revealedRef.current || ref.current == null) return;
    ref.current.measureInWindow((_x, y, _w, h) => {
      if (typeof y !== 'number') return;
      const windowH = Dimensions.get('window').height;
      // Reveal when card has entered the lower 92% of the window
      if (y < windowH * 0.92 && y + (h ?? 0) > 0) reveal();
    });
  };

  useEffect(() => {
    const id = scrollY.addListener(() => check());
    return () => scrollY.removeListener(id);
  }, []);

  const handleLayout = () => {
    // Initial reveal-check for cards that mounted already in viewport
    requestAnimationFrame(check);
  };

  const [bgA, bgB] = BRAND_TINTS[index % BRAND_TINTS.length];

  return (
    <View ref={ref} onLayout={handleLayout} style={styles.brandCardOuter}>
      <Animated.View
        style={[styles.brandCard, { opacity, transform: [{ translateY: tY }] }]}
      >
        <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.brandCardInner}>
          <LinearGradient
            colors={[bgA, bgB]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandLogoWrap}
          >
            <Text style={styles.brandMonogram}>{brandInitials(brand.name)}</Text>
            {brand.isNiche && (
              <View style={styles.brandNicheBadge}>
                <Text style={styles.brandNicheText}>NICHE</Text>
              </View>
            )}
          </LinearGradient>
          <View style={styles.brandFooter}>
            <Text style={styles.brandCardName} numberOfLines={1}>{brand.name}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.md * 2;
const NOTIF_PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 360);

// Pull-to-refresh
const PULL_THRESHOLD = 72;
const PULL_INDICATOR_HEIGHT = 80;

interface NotifItem {
  id: string;
  type: 'new_perfume' | 'wishlist' | 'event' | 'community' | 'recommend';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotifItem[] = [
  { id: 'n1', type: 'new_perfume', title: 'Tom Ford 신상 입고',  body: 'Black Orchid Parfum이 새로 들어왔어요.',   time: '방금 전',  unread: true },
  { id: 'n2', type: 'wishlist',    title: '위시리스트 할인',       body: 'Jo Malone Wood Sage & Sea Salt가 15% 할인 중!', time: '2시간 전', unread: true },
  { id: 'n3', type: 'event',       title: '맡다. 봄 향수 페어',    body: '4/12-14, 성수동에서 만나요.',              time: '어제',     unread: true },
  { id: 'n4', type: 'community',   title: '내 한줄평에 좋아요',     body: '5명이 회원님의 한줄평을 좋아합니다.',         time: '2일 전',   unread: false },
  { id: 'n5', type: 'recommend',   title: '취향 분석 업데이트',     body: '이번 주 추천 향수 5종이 도착했어요.',         time: '3일 전',   unread: false },
];

const NOTIF_TYPE_STYLE: Record<NotifItem['type'], { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }> = {
  new_perfume: { icon: 'leaf',        bg: '#E8F4ED', fg: COLORS.primaryDark },
  wishlist:    { icon: 'heart',       bg: '#FCE4EC', fg: '#D14E7A' },
  event:       { icon: 'calendar',    bg: '#FFF3E0', fg: '#C77F1B' },
  community:   { icon: 'chatbubbles', bg: '#E3F2FD', fg: '#3A6FA8' },
  recommend:   { icon: 'sparkles',    bg: '#FFF9C4', fg: '#A37B11' },
};

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

const TODAY_IDS = ['d1', 'cr1', 'mm2', 'll1', 'pm1'];

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { data: perfumes = [] } = usePerfumes();
  const { data: brands = [] } = useBrands();
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<ScrollView>(null);
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

  // Pull-to-refresh — 병이 기울었다가 일어남
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useSharedValue(0);
  const refreshSway = useSharedValue(0);
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => { pullY.value = value; });
    return () => scrollY.removeListener(id);
  }, []);
  useEffect(() => {
    if (refreshing) {
      // 좌우 부드러운 sway
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
  const onEndDrag = (e: any) => {
    if (Platform.OS !== 'ios') return;
    const y = e.nativeEvent.contentOffset.y;
    if (y < -PULL_THRESHOLD) triggerRefresh();
  };

  const bottleStyle = useAnimatedStyle(() => {
    // 리프레시 중 — sway 중심
    if (refreshing) {
      return {
        opacity: 1,
        transform: [
          { rotateZ: `${refreshSway.value}deg` },
          { scale: 1 },
        ],
      };
    }
    // 풀링 중 — overscroll 정도에 비례해 기울기 + scale
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

  // 알림 패널
  const [notifications, setNotifications] = useState<NotifItem[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [notifOpen, setNotifOpen] = useState(false);
  const panelX = useRef(new Animated.Value(NOTIF_PANEL_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openNotif = () => {
    setNotifOpen(true);
    Animated.parallel([
      Animated.timing(panelX, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  };
  const closeNotif = () => {
    Animated.parallel([
      Animated.timing(panelX, { toValue: NOTIF_PANEL_WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setNotifOpen(false));
  };
  const removeOne = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => {
    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    setNotifications([]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (BANNER_WIDTH + SPACING.md), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const todayTop = perfumes.filter((p) => TODAY_IDS.includes(p.id));

  // 스크롤에 따른 헤더 효과 — 로고 컬러는 primaryInk → primaryDeep,
  // 헤더 하단에 분리선이 자연스럽게 페이드인
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
        <TouchableOpacity style={styles.notifBtn} onPress={openNotif} activeOpacity={0.7}>
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
        ref={outerScrollRef as any}
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
        {/* 검색창 (버튼 — 탭하면 SearchScreen으로 이동) */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
          <Text style={styles.searchPlaceholder}>향수명, 브랜드, 원료 검색</Text>
        </TouchableOpacity>

        {/* 이벤트 배너 — 검색 바로 아래로 이동, 전체보기는 하단 우측 */}
        <View style={styles.bannerWrapper}>
          <ScrollView
            ref={bannerRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + SPACING.md}
            decelerationRate="fast"
            contentContainerStyle={styles.bannerScrollContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (BANNER_WIDTH + SPACING.md)
              );
              setActiveBanner(index);
            }}
          >
            {BANNERS.map((banner) => (
              <TouchableOpacity key={banner.id} activeOpacity={0.9}>
                <LinearGradient
                  colors={banner.colors}
                  start={{ x: 0.05, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.bannerCard, { width: BANNER_WIDTH }]}
                >
                  {/* Ghosted bottle silhouette — decorative right side */}
                  <View style={styles.bannerGhostBottle} pointerEvents="none">
                    {/* Cap */}
                    <View style={{ width: 18, height: 8, backgroundColor: '#fff', borderRadius: 3, alignSelf: 'center', marginBottom: -1 }} />
                    {/* Neck */}
                    <View style={{ width: 22, height: 6, backgroundColor: '#fff', borderRadius: 2, alignSelf: 'center', marginBottom: -2 }} />
                    {/* Body */}
                    <View style={{ width: 46, height: 78, backgroundColor: '#fff', borderRadius: 10, alignSelf: 'center' }} />
                  </View>

                  {/* Frosted badge */}
                  <View style={styles.bannerBadgeWrap}>
                    <Text style={styles.bannerBadge}>{banner.badge}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>

                  {/* Peach pill CTA */}
                  <View style={styles.bannerCtaRow}>
                    <View style={styles.bannerCtaPill}>
                      <Text style={styles.bannerCtaText}>지금 보러가기</Text>
                      <View style={styles.bannerCtaCircle}>
                        <Ionicons name="arrow-forward" size={14} color="#FFDAC9" />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.bannerFooter}>
            <View style={styles.bannerFooterSide} />
            <View style={styles.bannerDots}>
              {BANNERS.map((_, i) => (
                <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
              ))}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Events')}
              style={styles.bannerViewAllWrap}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.bannerViewAll}>전체보기</Text>
              <Ionicons name="chevron-forward" size={12} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

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

        {/* 홈 콘텐츠 */}
        <>

            {/* 오늘의 향수 TOP */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>오늘의 향수</Text>
                  <Text style={styles.sectionSub}>에디터 추천 ✨</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {todayTop.map((p) => (
                  <TodayCard
                    key={p.id}
                    perfume={p}
                    onPress={() => navigation.navigate('PerfumeDetail', { perfumeId: p.id })}
                  />
                ))}
              </ScrollView>
            </View>

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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>브랜드 둘러보기</Text>
                <Text style={styles.sectionSub}>스크롤로 더 보기</Text>
              </View>
              <View style={styles.brandGrid}>
                {brands.map((b, i) => (
                  <BrandCard
                    key={b.id}
                    brand={b}
                    index={i}
                    scrollY={scrollY}
                    onPress={() => navigation.navigate('Search')}
                  />
                ))}
              </View>
            </View>
        </>

        <View style={{ height: SPACING.xl }} />
      </Animated.ScrollView>

      {/* 알림 사이드 패널 */}
      <Modal
        visible={notifOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeNotif}
      >
        {/* Modal은 별도 native view 계층이라 GestureHandlerRootView를 다시 감싸야
            안에서 Gesture.Pan 등이 동작 */}
        <GestureHandlerRootView style={styles.notifModalRoot}>
        <View style={styles.notifModalRoot}>
          <Animated.View style={[styles.notifBackdrop, { opacity: backdropOpacity }]}>
            <Pressable style={{ flex: 1 }} onPress={closeNotif} />
          </Animated.View>
          <Animated.View
            style={[
              styles.notifPanel,
              { width: NOTIF_PANEL_WIDTH, transform: [{ translateX: panelX }] },
            ]}
          >
            <View style={[styles.notifPanelHeader, { paddingTop: insets.top + SPACING.sm }]}>
              <View style={styles.notifTitleWrap}>
                <Text style={styles.notifPanelTitle}>알림</Text>
                {unreadCount > 0 && (
                  <View style={styles.notifHeaderBadge}>
                    <Text style={styles.notifHeaderBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.notifHeaderActions}>
                <TouchableOpacity onPress={clearAll} disabled={notifications.length === 0}>
                  <Text style={[styles.notifMarkRead, notifications.length === 0 && { color: COLORS.gray400 }]}>
                    모두 지우기
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeNotif} style={styles.notifCloseBtn}>
                  <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.notifList} contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.lg }}>
              {notifications.length === 0 ? (
                <View style={styles.notifEmpty}>
                  <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray300} />
                  <Text style={styles.notifEmptyText}>알림이 없어요</Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <NotifRow
                    key={n.id}
                    item={n}
                    panelWidth={NOTIF_PANEL_WIDTH}
                    onRemove={removeOne}
                  />
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
        </GestureHandlerRootView>
      </Modal>
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
  notifBtn: { padding: SPACING.sm, minWidth: TOUCH_TARGET_MIN, minHeight: TOUCH_TARGET_MIN, justifyContent: 'center', alignItems: 'center' },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    minWidth: 16, height: 16, paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#E15A5A',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.background,
  },
  notifDotText: { color: COLORS.white, fontSize: 9, fontWeight: FONT_WEIGHTS.extrabold, lineHeight: 11 },

  notifModalRoot: { flex: 1, flexDirection: 'row' },
  notifBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  notifPanel: {
    marginLeft: 'auto',
    height: '100%',
    backgroundColor: '#F2F7F4', // 살짝 민트 톤 — 위에 얹힌 글래스 카드를 띄워주기 위함
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 16,
  },
  notifPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  notifTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  notifPanelTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text, letterSpacing: -0.4 },
  notifHeaderBadge: {
    minWidth: 22, height: 20, paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  notifHeaderBadgeText: { color: COLORS.primaryInk, fontSize: 11, fontWeight: FONT_WEIGHTS.bold },
  notifHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  notifMarkRead: { fontSize: FONT_SIZES.small, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },
  notifCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  pullIndicator: {
    position: 'absolute',
    top: -PULL_INDICATOR_HEIGHT,
    left: 0,
    right: 0,
    height: PULL_INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifList: {
    flex: 1,
    paddingHorizontal: SPACING.sm + 2,
    paddingTop: SPACING.sm,
  },
  // outer wrap — shadow (BlurView가 overflow:hidden이라 그림자 못 가짐)
  notifItemWrap: {
    marginBottom: SPACING.sm,
    borderRadius: 28,
    shadowColor: '#1F4A35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  notifItemUnread: {
    borderColor: 'rgba(111,184,143,0.45)',
  },
  // Android 폴백 — expo-blur 아티팩트 회피용 솔리드 배경
  notifBgAndroid: { backgroundColor: '#FBFEFC' },
  notifBgAndroidUnread: { backgroundColor: '#E8F4ED' },
  notifIcon: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  notifBody: { flex: 1, gap: 3 },
  notifTopRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  notifTitle: { flex: 1, fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  notifTime: { fontSize: 10, color: COLORS.textLight, fontWeight: FONT_WEIGHTS.medium },
  notifText: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.small * 1.35 },
  notifUnreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
    marginTop: 6,
  },
  notifEmpty: { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  notifEmptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body },

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
  sectionSub: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.small },

  horizontalList: {
    // 카드 그림자가 잘리지 않도록 상/하/좌/우 여백 확보
    paddingLeft: 4,
    paddingRight: SPACING.md,
    paddingTop: 4,
    paddingBottom: 12,
    gap: SPACING.md,
  },
  todayCard: {
    width: 160, backgroundColor: COLORS.white,
    borderRadius: 22,
    // Android에서 elevation + overflow:'hidden' + borderWidth가 테두리를
    // 잘리게 만들기 때문에 overflow는 이미지 영역에만 적용.
    borderWidth: 1, borderColor: 'rgba(111,184,143,0.10)',
    shadowColor: '#1F4A35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  todayImgWrap: {
    height: 160,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  nicheBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.primaryDark, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  nicheBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: FONT_WEIGHTS.bold },
  todayInfo: { padding: SPACING.sm + 2 },
  todayBrand: { fontSize: 10, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  todayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  todayName: {
    flex: 1,
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.bodySm,
    letterSpacing: -0.3,
  },
  todayHeart: {
    width: 28, height: 28,
    borderRadius: 9999, // 완전한 원형 강제
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  todayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  todayMeta: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 1 },
  todayRatingText: { fontSize: FONT_SIZES.caption, color: COLORS.gray600, fontWeight: FONT_WEIGHTS.semibold },
  todayPriceBlock: { alignItems: 'flex-end', marginLeft: 'auto' },
  todayVolumeLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  todayPrice: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.text,
    letterSpacing: -0.4,
    lineHeight: 18,
  },
  todayPriceUnit: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textSecondary,
  },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cardGrid: { width: '48.5%' },

  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  brandCardOuter: { width: '48.5%' },
  brandCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(111,184,143,0.10)',
    ...SHADOW.md,
  },
  brandCardInner: { flex: 1 },
  brandLogoWrap: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brandMonogram: {
    fontSize: 34,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.primaryInk,
    letterSpacing: -1,
  },
  brandNicheBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  brandNicheText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: 0.4,
  },
  brandFooter: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  brandCardName: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },

  emptyWrap: { alignItems: 'center', paddingTop: SPACING.xxl },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLg, marginTop: SPACING.md },

  bannerWrapper: { paddingHorizontal: SPACING.md, marginBottom: SPACING.xs },
  bannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  bannerFooterSide: { width: 72 }, // dots를 정확히 가운데 두기 위한 좌측 스페이서
  bannerViewAllWrap: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  bannerViewAll: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  bannerScrollContent: { gap: SPACING.md },
  bannerCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 148,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...SHADOW.md,
  },
  bannerGhostBottle: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.12,
  },
  bannerBadgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: SPACING.sm,
  },
  bannerBadge: { color: COLORS.white, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: FONT_WEIGHTS.black,
    lineHeight: 25,
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: FONT_SIZES.bodySm,
    lineHeight: LINE_HEIGHTS.bodySm,
    marginTop: SPACING.xs,
  },
  bannerCtaRow: { flexDirection: 'row', marginTop: SPACING.md },
  bannerCtaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFDAC9',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  bannerCtaText: { fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.bold, color: COLORS.bannerInk },
  bannerCtaCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.bannerInk,
    justifyContent: 'center', alignItems: 'center',
  },
  bannerDots: {
    flex: 1,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.gray300,
  },
  dotActive: { width: 18, backgroundColor: COLORS.primaryDark },
});
