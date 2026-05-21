import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { SPRING } from '../../constants/motion';
import { PressableScale } from '../../components/common/PressableScale';
import { haptic } from '../../lib/haptic';

type Tab = 'active' | 'ended';

interface EventItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  period: string;
  desc: string;
  colors: readonly [string, string];
  isActive: boolean;
}

const ACTIVE_EVENTS: EventItem[] = [
  {
    id: 'a1',
    badge: '진행 중',
    title: 'Maison Margiela Replica 봄 에디션',
    subtitle: '2025 봄 한정판 신규 입하',
    period: '2025.03.01 ~ 2025.04.30',
    desc: '봄을 담은 향, Replica 시리즈 신규 5종 출시. 라벤더 인 더 자라 등 봄의 향기를 담은 한정판 컬렉션을 만나보세요.',
    colors: ['#1B3358', '#2A5C8A'],
    isActive: true,
  },
  {
    id: 'a2',
    badge: '진행 중',
    title: 'Tom Ford 스프링 세일',
    subtitle: '전 라인 단독 20% 할인',
    period: '2025.04.10 ~ 2025.04.20',
    desc: 'Tom Ford 전 향수 라인 20% 특가 할인. Black Orchid, Tobacco Vanille 등 인기 향수를 합리적인 가격에 만나세요.',
    colors: ['#2D1B4E', '#5B2E8F'],
    isActive: true,
  },
  {
    id: 'a3',
    badge: '진행 중',
    title: '봄 플로럴 기획전',
    subtitle: '에디터가 엄선한 봄 향수',
    period: '2025.04.01 ~ 2025.04.30',
    desc: '따뜻한 봄날에 어울리는 플로럴 계열 향수 모음. 로즈, 피오니, 재스민 계열의 봄 향수를 추천해드립니다.',
    colors: ['#1E4D3A', '#3A7D5C'],
    isActive: true,
  },
  {
    id: 'a4',
    badge: '진행 중',
    title: 'Byredo 팝업 스토어',
    subtitle: '서울 성수동 단독 팝업',
    period: '2025.04.15 ~ 2025.04.25',
    desc: 'Byredo 코리아 공식 팝업 스토어 in 성수동. 전 제품 체험 및 한정 굿즈 증정 이벤트 진행.',
    colors: ['#1A3A2A', '#2E6B4A'],
    isActive: true,
  },
  {
    id: 'a5',
    badge: '진행 중',
    title: '신규 회원 쿠폰',
    subtitle: '첫 구매 10% 할인 즉시 지급',
    period: '2025.01.01 ~ 2025.12.31',
    desc: '신규 가입 후 첫 구매 시 10% 할인 쿠폰이 즉시 발급됩니다. 모든 브랜드 및 상품에 적용 가능합니다.',
    colors: ['#4A2C0A', '#8B5E3C'],
    isActive: true,
  },
];

const ENDED_EVENTS: EventItem[] = [
  {
    id: 'e1',
    badge: '종료',
    title: 'Chanel 겨울 한정판',
    subtitle: '2024 윈터 에디션',
    period: '2024.12.01 ~ 2025.02.28',
    desc: 'Chanel No.5 및 Coco Mademoiselle 윈터 에디션. 특별 패키지와 함께 따뜻한 겨울 향을 담았습니다.',
    colors: ['#3A3A3A', '#6A6A6A'],
    isActive: false,
  },
  {
    id: 'e2',
    badge: '종료',
    title: 'Dior 크리스마스 기프트',
    subtitle: '크리스마스 한정 기프트 세트',
    period: '2024.11.01 ~ 2024.12.25',
    desc: 'Miss Dior 및 Sauvage 크리스마스 기프트 세트. 사랑하는 사람에게 향기를 선물하세요.',
    colors: ['#2E2E2E', '#5C5C5C'],
    isActive: false,
  },
  {
    id: 'e3',
    badge: '종료',
    title: 'Jo Malone 가을 기획전',
    subtitle: '우디 & 앰버 컬렉션',
    period: '2024.09.01 ~ 2024.11.30',
    desc: '가을에 어울리는 Jo Malone 우디 & 앰버 향수 컬렉션. English Oak & Hazelnut 추천.',
    colors: ['#404040', '#707070'],
    isActive: false,
  },
  {
    id: 'e4',
    badge: '종료',
    title: '여름 아쿠아틱 특집',
    subtitle: '시원한 여름을 위한 향수 모음',
    period: '2024.06.01 ~ 2024.08.31',
    desc: '더운 여름철 청량감을 더해줄 아쿠아틱 계열 향수 특집. 상쾌하고 시원한 향기로 여름을 즐겁게.',
    colors: ['#383838', '#646464'],
    isActive: false,
  },
  {
    id: 'e5',
    badge: '종료',
    title: 'Le Labo 서울 에디션',
    subtitle: '도시의 향기 - 서울 기획전',
    period: '2024.05.01 ~ 2024.06.30',
    desc: 'Le Labo 서울 단독 에디션 출시 기념 기획전. 서울의 감성을 담은 특별한 향을 경험해보세요.',
    colors: ['#353535', '#606060'],
    isActive: false,
  },
];

const EventCard: React.FC<{ item: EventItem; index: number }> = ({ item, index }) => (
  <Animated.View
    entering={FadeInUp.springify().damping(20).stiffness(140).delay(index * 70)}
  >
    <PressableScale
      style={[styles.card, SHADOW.md]}
      onPress={() => { /* TODO: 상세 이동 */ }}
      scaleTo={0.98}
      haptic={item.isActive ? 'light' : null}
    >
      <LinearGradient
        colors={item.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBanner}
      >
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.periodRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.periodText}>{item.period}</Text>
        </View>
        <Text style={styles.descText} numberOfLines={3}>{item.desc}</Text>
        {item.isActive && (
          <View style={styles.ctaWrap}>
            <Text style={styles.ctaText}>자세히 보기 →</Text>
          </View>
        )}
      </View>
    </PressableScale>
  </Animated.View>
);

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const { width: screenW } = useWindowDimensions();

  // 탭 인디케이터 스프링 — 좌(0) ↔ 우(1)
  const indicator = useSharedValue(0);
  useEffect(() => {
    indicator.value = withSpring(activeTab === 'active' ? 0 : 1, SPRING.snappy);
  }, [activeTab]);

  const tabHalf = screenW / 2;
  const underlineWidth = tabHalf * 0.7;
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicator.value * tabHalf + (tabHalf - underlineWidth) / 2 },
    ],
  }));

  const handleTab = (t: Tab) => {
    if (t === activeTab) return;
    haptic('selection');
    setActiveTab(t);
  };

  const data = activeTab === 'active' ? ACTIVE_EVENTS : ENDED_EVENTS;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이벤트</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTab('active')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            진행 중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTab('ended')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'ended' && styles.tabTextActive]}>
            종료된 이벤트
          </Text>
        </TouchableOpacity>
        {/* spring 슬라이딩 underline */}
        <Animated.View
          style={[styles.tabUnderline, { width: underlineWidth }, indicatorStyle]}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <EventCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: TOUCH_TARGET_MIN,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  tabText: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2.5,
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.full,
  },
  listContent: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  cardBanner: {
    height: 130,
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.h4,
    fontWeight: FONT_WEIGHTS.extrabold,
    lineHeight: LINE_HEIGHTS.h4,
    marginBottom: 2,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cardBody: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  periodText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  descText: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.bodySm,
  },
  ctaWrap: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  ctaText: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryInk,
  },
});
