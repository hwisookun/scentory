import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const PANEL_W = SCREEN_W * 0.82;

interface NotifItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: NotifItem[] = [
  { id: '1', icon: 'heart',      iconColor: COLORS.accent,   title: '오늘의 향수 추천',       body: '컬렉션 기반으로 오늘 어울리는 향수를 준비했어요.',  time: '방금 전',  read: false },
  { id: '2', icon: 'leaf',       iconColor: COLORS.primary,  title: 'Chanel 브랜드 업데이트', body: 'Chanel No.5 한정판 리뉴얼 에디션이 출시됐어요.',  time: '1시간 전', read: false },
  { id: '3', icon: 'star',       iconColor: COLORS.star,     title: '위시리스트 향수 할인',   body: 'Sauvage EDT가 현재 10% 할인 중이에요.',          time: '3시간 전', read: true  },
  { id: '4', icon: 'chatbubble', iconColor: '#1E88E5',       title: '향이의 새 답변',        body: '내가 남긴 질문에 향이가 답변했어요.',             time: '어제',    read: true  },
  { id: '5', icon: 'pricetag',   iconColor: '#E65100',       title: 'Le Labo 시즌 컬렉션',   body: 'Santal 33 신규 캔들 컬렉션이 추가됐어요.',       time: '2일 전',  read: true  },
];

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ visible, onClose }) => {
  const { top } = useSafeAreaInsets();

  // ── 핵심 수정 ──
  // _value 직접 접근 제거 → mounted 상태로 언마운트 시점 제어
  // 1. visible=true  → mounted=true → open 애니메이션
  // 2. visible=false → close 애니메이션 완료 콜백 → mounted=false
  const [mounted, setMounted] = useState(false);
  const translateX    = useRef(new Animated.Value(PANEL_W)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);   // 먼저 마운트
    }
  }, [visible]);

  // mounted 가 true 로 바뀐 직후 open 애니메이션
  useEffect(() => {
    if (mounted && visible) {
      translateX.setValue(PANEL_W);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          speed: 22,
          bounciness: 0,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mounted, visible]);

  // visible=false → close 애니메이션 → 완료 후 언마운트
  useEffect(() => {
    if (!visible && mounted) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: PANEL_W,
          useNativeDriver: true,
          speed: 28,
          bounciness: 0,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);   // 애니메이션 완료 후에만 언마운트
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    // pointerEvents="box-none" → 패널 바깥쪽 터치를 앱으로 통과
    <View style={styles.root} pointerEvents="box-none">
      {/* 딤 오버레이 */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="auto">
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* 슬라이드 패널 */}
      <Animated.View
        style={[styles.panel, { paddingTop: top + SPACING.sm, transform: [{ translateX }] }]}
        pointerEvents="auto"
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>알림</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {MOCK_NOTIFS.filter(n => !n.read).length > 0 && (
          <View style={styles.unreadRow}>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{MOCK_NOTIFS.filter(n => !n.read).length}</Text>
            </View>
            <Text style={styles.unreadLabel}>읽지 않은 알림</Text>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {MOCK_NOTIFS.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifItem, !n.read && styles.notifItemUnread]}
              activeOpacity={0.75}
            >
              <View style={[styles.notifIcon, { backgroundColor: n.iconColor + '18' }]}>
                <Ionicons name={n.icon as any} size={18} color={n.iconColor} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTitleRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{n.title}</Text>
                  {!n.read && <View style={styles.dotBadge} />}
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  panel: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: PANEL_W,
    backgroundColor: COLORS.white,
    ...SHADOW.lg,
  },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  panelTitle: { fontSize: FONT_SIZES.h2, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  closeBtn: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  unreadCount: { color: COLORS.white, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.extrabold },
  unreadLabel: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium },
  notifItem: {
    flexDirection: 'row', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  notifItemUnread: { backgroundColor: COLORS.secondary },
  notifIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  notifContent: { flex: 1, gap: 3 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  notifTitle: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    flex: 1,
  },
  dotBadge: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.primary, flexShrink: 0 },
  notifBody: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.small,
  },
  notifTime: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium },
});
