import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import { ExploreScreen } from '../screens/Explore/ExploreScreen';
import { WishlistScreen } from '../screens/Wishlist/WishlistScreen';
import { CommunityScreen } from '../screens/Community/CommunityScreen';
import { MyPageScreen } from '../screens/MyPage/MyPageScreen';
import { PerfumeDetailScreen } from '../screens/PerfumeDetail/PerfumeDetailScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { LoginScreen } from '../screens/Login/LoginScreen';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { ChatbotScreen } from '../screens/Chatbot/ChatbotScreen';
import { EventsScreen } from '../screens/Events/EventsScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { MoodQuizScreen } from '../screens/MoodQuiz/MoodQuizScreen';
import { PerfumeDiaryScreen } from '../screens/PerfumeDiary/PerfumeDiaryScreen';
import { ScentLibraryScreen } from '../screens/ScentLibrary/ScentLibraryScreen';
import { ScentGachaScreen } from '../screens/ScentGacha/ScentGachaScreen';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../constants/theme';
import { Toast } from '../components/common/Toast';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 흰색 배경 플래시 방지
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.white,
  },
};

// iOS 기본 슬라이드 (내부 화면 전환)
const slideOptions = {
  headerShown: false as const,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open:  { animation: 'spring' as const, config: { stiffness: 260, damping: 28, mass: 1 } },
    close: { animation: 'spring' as const, config: { stiffness: 260, damping: 28, mass: 1 } },
  },
};

// 페이드 (인증 흐름 전환)
const fadeOptions = {
  headerShown: false as const,
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
  transitionSpec: {
    open:  { animation: 'timing' as const, config: { duration: 280 } },
    close: { animation: 'timing' as const, config: { duration: 200 } },
  },
};

const ExploreStack = () => (
  <Stack.Navigator screenOptions={slideOptions}>
    <Stack.Screen name="ExploreHome"   component={ExploreScreen} />
    <Stack.Screen name="PerfumeDetail" component={PerfumeDetailScreen} />
    <Stack.Screen name="Events"        component={EventsScreen} />
    <Stack.Screen name="Search"        component={SearchScreen} />
    <Stack.Screen name="MoodQuiz"      component={MoodQuizScreen} />
    <Stack.Screen name="PerfumeDiary"  component={PerfumeDiaryScreen} />
    <Stack.Screen name="ScentLibrary"  component={ScentLibraryScreen} />
    <Stack.Screen name="ScentGacha"    component={ScentGachaScreen} />
  </Stack.Navigator>
);

const WishlistStack = () => (
  <Stack.Navigator screenOptions={slideOptions}>
    <Stack.Screen name="WishlistHome"  component={WishlistScreen} />
    <Stack.Screen name="PerfumeDetail" component={PerfumeDetailScreen} />
    <Stack.Screen name="Search"        component={SearchScreen} />
  </Stack.Navigator>
);

const CommunityStack = () => (
  <Stack.Navigator screenOptions={slideOptions}>
    <Stack.Screen name="CommunityHome" component={CommunityScreen} />
    <Stack.Screen name="PerfumeDetail" component={PerfumeDetailScreen} />
    <Stack.Screen name="Search"        component={SearchScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="찾아보기"  component={ExploreStack} />
      <Tab.Screen name="위시리스트" component={WishlistStack} />
      <Tab.Screen name="커뮤니티"  component={CommunityStack} />
      <Tab.Screen name="향이"     component={ChatbotScreen} />
      <Tab.Screen name="마이페이지" component={MyPageScreen} />
    </Tab.Navigator>
  );
};

// persist 미들웨어가 AsyncStorage에서 상태를 복원하기 전까지 true가 안 됨.
// 복원 전 라우트를 결정하면 Login → Main으로 튀는 깜빡임이 발생할 수 있어요.
function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());
  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, onboarding } = useAppStore();
  const [splashDone, setSplashDone] = useState(false);
  const hasHydrated = useHasHydrated();

  // splash 애니메이션 ~2.6s 동안 보통 hydration은 진작 끝나지만,
  // 콜드 스타트 AsyncStorage가 느린 경우에 대비해 둘 다 끝날 때까지 대기.
  if (!splashDone || !hasHydrated) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  // 초기 라우트 한 번만 결정 — 이후에는 각 화면이 navigation.reset()으로 전환
  const initialRoute = !isAuthenticated
    ? 'Login'
    : !onboarding.isCompleted
    ? 'Onboarding'
    : 'Main';

  return (
    <View style={styles.root}>
      <NavigationContainer theme={AppTheme}>
        {/* 모든 화면 항상 등록 → 조건부 마운트/언마운트 없음 → 흰색 플래시 없음 */}
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={fadeOptions}>
          <Stack.Screen name="Login"      component={LoginScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Main"       component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
