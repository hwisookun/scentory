import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, Animated, Pressable, ScrollView,
  TouchableOpacity, Dimensions, Platform, LayoutAnimation, UIManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView, Gesture, GestureDetector,
} from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, LinearTransition,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import {
  COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
} from '../../../constants/theme';
import { SPRING } from '../../../constants/motion';
import { haptic } from '../../../lib/haptic';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_WIDTH = Dimensions.get('window').width;
export const NOTIF_PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 360);

export interface NotifItem {
  id: string;
  type: 'new_perfume' | 'wishlist' | 'event' | 'community' | 'recommend';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const INITIAL_NOTIFICATIONS: NotifItem[] = [
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

// ─── 개별 row — 가로 스와이프로 dismiss ──────────────────
const NotifRow: React.FC<{
  item: NotifItem;
  panelWidth: number;
  onRemove: (id: string) => void;
}> = ({ item, panelWidth, onRemove }) => {
  // Reanimated v4 — 모든 트랜스폼/오파시티가 UI 스레드에서 60fps 동작
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const DISMISS_DISTANCE = panelWidth * 0.32;
  const DISMISS_VELOCITY = 700;

  const finishRemove = () => {
    haptic('light');
    onRemove(item.id);
  };

  const pan = Gesture.Pan()
    // 가로 스와이프만 활성화 — 세로 스크롤 방해 X
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      const ratio = Math.min(Math.abs(e.translationX) / panelWidth, 1);
      opacity.value = 1 - ratio * 0.7;
    })
    .onEnd((e) => {
      const shouldDismiss =
        Math.abs(e.translationX) > DISMISS_DISTANCE ||
        Math.abs(e.velocityX) > DISMISS_VELOCITY;

      if (shouldDismiss) {
        const dir = e.translationX >= 0 ? 1 : -1;
        const exit = dir * panelWidth;
        translateX.value = withTiming(exit, { duration: 180 });
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) scheduleOnRN(finishRemove);
        });
      } else {
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
        style={[styles.itemWrap, containerStyle]}
        layout={LinearTransition.springify().damping(20).stiffness(160)}
      >
        <View style={[styles.item, item.unread && styles.itemUnread]}>
          {/* iOS는 native blur, Android는 솔리드 배경 — expo-blur의 Android 아티팩트 회피 */}
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
                item.unread ? styles.bgAndroidUnread : styles.bgAndroid,
              ]}
            />
          )}
          <View style={[styles.icon, { backgroundColor: ic.bg }]}>
            <Ionicons name={ic.icon} size={18} color={ic.fg} />
          </View>
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.text} numberOfLines={2}>{item.body}</Text>
          </View>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </Reanimated.View>
    </GestureDetector>
  );
};

// ─── 패널 본체 ───────────────────────────────────────────
interface PanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: NotifItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const NotifPanel: React.FC<PanelProps> = ({
  visible, onClose, notifications, onRemove, onClearAll,
}) => {
  const insets = useSafeAreaInsets();
  const panelX = useRef(new Animated.Value(NOTIF_PANEL_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(panelX, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(panelX, { toValue: NOTIF_PANEL_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Modal은 별도 native view 계층이라 GestureHandlerRootView를 다시 감싸야
          안에서 Gesture.Pan 등이 동작 */}
      <GestureHandlerRootView style={styles.modalRoot}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={{ flex: 1 }} onPress={onClose} />
          </Animated.View>
          <Animated.View
            style={[
              styles.panel,
              { width: NOTIF_PANEL_WIDTH, transform: [{ translateX: panelX }] },
            ]}
          >
            <View style={[styles.panelHeader, { paddingTop: insets.top + SPACING.sm }]}>
              <View style={styles.titleWrap}>
                <Text style={styles.panelTitle}>알림</Text>
                {unreadCount > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={onClearAll} disabled={notifications.length === 0}>
                  <Text style={[styles.markRead, notifications.length === 0 && { color: COLORS.gray400 }]}>
                    모두 지우기
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.lg }}>
              {notifications.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray300} />
                  <Text style={styles.emptyText}>알림이 없어요</Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <NotifRow
                    key={n.id}
                    item={n}
                    panelWidth={NOTIF_PANEL_WIDTH}
                    onRemove={onRemove}
                  />
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

// 부모가 모두 지우기 누를 때 LayoutAnimation 효과 적용용 — 옵셔널.
export function configureClearAllLayoutAnim() {
  LayoutAnimation.configureNext({
    duration: 220,
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  });
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  panel: {
    marginLeft: 'auto',
    height: '100%',
    backgroundColor: '#F2F7F4', // 살짝 민트 톤 — 위에 얹힌 글래스 카드를 띄워주기 위함
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  panelTitle: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text, letterSpacing: -0.4 },
  headerBadge: {
    minWidth: 22, height: 20, paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  headerBadgeText: { color: COLORS.primaryInk, fontSize: 11, fontWeight: FONT_WEIGHTS.bold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  markRead: { fontSize: FONT_SIZES.small, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },

  list: {
    flex: 1,
    paddingHorizontal: SPACING.sm + 2,
    paddingTop: SPACING.sm,
  },
  // outer wrap — shadow (BlurView가 overflow:hidden이라 그림자 못 가짐)
  itemWrap: {
    marginBottom: SPACING.sm,
    borderRadius: 28,
    shadowColor: '#1F4A35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },
  item: {
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
  itemUnread: { borderColor: 'rgba(111,184,143,0.45)' },
  bgAndroid: { backgroundColor: '#FBFEFC' },
  bgAndroidUnread: { backgroundColor: '#E8F4ED' },
  icon: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  body: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  title: { flex: 1, fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  time: { fontSize: 10, color: COLORS.textLight, fontWeight: FONT_WEIGHTS.medium },
  text: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.small * 1.35 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
    marginTop: 6,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body },
});
