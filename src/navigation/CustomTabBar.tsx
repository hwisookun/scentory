import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { COLORS, SHADOW, FONT_WEIGHTS } from '../constants/theme';
import { SPRING } from '../constants/motion';
import { haptic } from '../lib/haptic';

// 이 라우트들에 진입하면 바닥 탭바를 숨김 — 디테일/검색/이벤트는 몰입 화면
const HIDE_TAB_BAR_ON = new Set([
  'PerfumeDetail', 'Search', 'Events',
  'MoodQuiz', 'PerfumeDiary', 'ScentLibrary', 'ScentGacha',
]);

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  '찾아보기':  { active: 'search',      inactive: 'search-outline'      },
  '위시리스트': { active: 'heart',       inactive: 'heart-outline'       },
  '커뮤니티':  { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  '향이':     { active: 'leaf',         inactive: 'leaf-outline'        },
  '마이페이지': { active: 'person',      inactive: 'person-outline'     },
};

// 인디케이터 (작은 dot pill) 크기
const INDICATOR_W = 22;
const INDICATOR_H = 3;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  // ⚠️ 모든 hook은 early-return 전에 호출 — React 훅 순서 규칙
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const tabCount = state.routes.length;
  const tabW = screenW / tabCount;

  // 활성 인디케이터 X 좌표 — 활성 탭의 중앙 정렬
  const indicatorX = useSharedValue(tabW * state.index + tabW / 2 - INDICATOR_W / 2);

  useEffect(() => {
    indicatorX.value = withSpring(
      tabW * state.index + tabW / 2 - INDICATOR_W / 2,
      SPRING.snappy,
    );
  }, [state.index, tabW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  // 현재 활성 탭의 nested stack에서 어떤 화면인지 확인 → 디테일 화면이면 숨김
  // 모든 hook 호출 이후에 위치해야 함.
  const focusedRoute = state.routes[state.index];
  const nestedRouteName = getFocusedRouteNameFromRoute(focusedRoute);
  if (nestedRouteName && HIDE_TAB_BAR_ON.has(nestedRouteName)) {
    return null;
  }

  return (
    <View
      style={[
        styles.bar,
        { height: 62 + Math.max(insets.bottom, 8), paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* 활성 인디케이터 */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const ic = TAB_ICONS[route.name];
        const color = focused ? COLORS.primaryDark : COLORS.gray400;

        const onPress = () => {
          // 표준 tabPress emit — 활성 탭이면 화면이 자체 listener로 scroll-to-top
          // 처리 (각 screen의 useEffect 참조)
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (focused) {
            haptic('light');
          } else if (!event.defaultPrevented) {
            haptic('selection');
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <TabIcon focused={focused} iconName={(focused ? ic?.active : ic?.inactive) as any ?? 'ellipse-outline'} color={color} />
            <Text style={[styles.label, { color }, focused && styles.labelActive]}>
              {route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// 활성 시 아이콘이 살짝 부풀어 오르는 마이크로 모션
const TabIcon: React.FC<{ focused: boolean; iconName: string; color: string }> = ({
  focused, iconName, color,
}) => {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, SPRING.bouncy);
  }, [focused]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Ionicons name={iconName as any} size={22} color={color} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    ...SHADOW.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  labelActive: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: INDICATOR_W,
    height: INDICATOR_H,
    borderRadius: INDICATOR_H,
    backgroundColor: COLORS.primaryDark,
  },
});
