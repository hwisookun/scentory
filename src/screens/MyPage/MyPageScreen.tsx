import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW, SCENT_TEXT_COLORS,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN, BUTTON_HEIGHT,
} from '../../constants/theme';
import { ScentTag } from '../../types';
import { NicknameEditSheet } from '../../components/common/NicknameEditSheet';

const SCENT_TAGS: ScentTag[] = [
  '플로럴', '시트러스', '우디', '머스크', '프레시', '오리엔탈',
  '아쿠아틱', '구르망', '스파이시', '허벌', '파우더리', '레더',
];

const BAR_COLORS: Record<string, string> = {
  scent: '#6C63FF',
  note: COLORS.primaryInk,
};

export const MyPageScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    user, isGuest, wishlist, collections, reviewCount,
    brandSubscriptions, onboarding,
    toggleBrandSubscription, notificationSettings, setNotificationSetting, logout,
    showToast, setNickname,
  } = useAppStore();

  // 닉네임 변경 시트
  const [nickSheetOpen, setNickSheetOpen] = useState(false);
  const handleNicknameSave = (next: string) => {
    setNickname(next);
    setNickSheetOpen(false);
    showToast('닉네임이 변경됐어요');
  };

  // 로그아웃 — 확인 다이얼로그 후 Login 루트로 reset.
  // (logout()만 호출하면 user=null이 되어 MyPage가 빈 화면이 되는 freeze 문제 발생)
  const handleLogout = () => {
    Alert.alert(
      '로그아웃할까요?',
      '다시 로그인하면 위시리스트와 컬렉션이 그대로 남아 있어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
            // MainTabs(부모) → root Stack 으로 올라가 Login으로 reset.
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  // 향 선호도 계산
  const scentCounts: Record<string, number> = {};
  wishlist.forEach((w) => w.perfume.tags.forEach((t) => { scentCounts[t] = (scentCounts[t] ?? 0) + 1; }));
  onboarding.preferredScents.forEach((s) => { scentCounts[s] = (scentCounts[s] ?? 0) + 2; });
  const topScents = SCENT_TAGS.filter((t) => scentCounts[t])
    .sort((a, b) => (scentCounts[b] ?? 0) - (scentCounts[a] ?? 0))
    .slice(0, 5);
  const maxScentCount = Math.max(1, ...topScents.map((t) => scentCounts[t] ?? 0));

  // 원료 선호도 계산
  const notesCounts: Record<string, number> = {};
  wishlist.forEach((w) => {
    [...w.perfume.top_notes, ...w.perfume.middle_notes, ...w.perfume.base_notes]
      .forEach((n) => { notesCounts[n] = (notesCounts[n] ?? 0) + 1; });
  });
  onboarding.preferredNotes.forEach((n) => { notesCounts[n] = (notesCounts[n] ?? 0) + 2; });
  const topNotes = Object.entries(notesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxNoteCount = Math.max(1, ...(topNotes.map(([, c]) => c)));

  // 구독 중인 브랜드 (이름 목록)
  const subscribedBrands = brandSubscriptions.slice(0, 4);

  if (!user) return null;

  const loginLabel =
    user.loginType === 'guest' ? '게스트 모드' :
    user.loginType === 'apple' ? 'Apple 연결됨' :
    user.loginType === 'kakao' ? '카카오 연결됨' :
    user.loginType === 'naver' ? '네이버 연결됨' : '이메일 연결됨';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── 프로필 헤더 ── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarInitial}>{(user.nickname ?? '?')[0]}</Text>
          </View>
          <View style={styles.profileInfo}>
            <TouchableOpacity
              onPress={() => setNickSheetOpen(true)}
              activeOpacity={0.7}
              style={styles.nicknameRow}
            >
              <Text style={styles.nickname}>{user.nickname}</Text>
              <Ionicons name="pencil" size={13} color={COLORS.textLight} />
            </TouchableOpacity>
            <Text style={styles.profileSub}>{user.email ?? loginLabel}</Text>
            <View style={styles.profileTags}>
              {onboarding.preferredScents.slice(0, 1).map((s) => (
                <View key={s} style={styles.profileTag}>
                  <Text style={styles.profileTagText}>{s} 러버</Text>
                </View>
              ))}
              {isGuest && (
                <TouchableOpacity style={styles.loginPromptBtn}>
                  <Text style={styles.loginPromptText}>로그인하기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </View>

        {/* ── 통계 3칸 ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{wishlist.length}</Text>
            <Text style={styles.statLabel}>위시리스트</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{reviewCount}</Text>
            <Text style={styles.statLabel}>리뷰</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{collections.length}</Text>
            <Text style={styles.statLabel}>팔로우</Text>
          </View>
        </View>

        {/* ── 향 선호도 ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>향 선호도</Text>
          {topScents.length === 0 ? (
            <Text style={styles.emptyHint}>위시리스트에 향수를 추가하면 분석돼요</Text>
          ) : (
            topScents.map((tag) => {
              const pct = Math.round(((scentCounts[tag] ?? 0) / maxScentCount) * 100);
              return (
                <View key={tag} style={styles.barRow}>
                  <Text style={styles.barLabel}>{tag}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, {
                      width: `${pct}%`,
                      backgroundColor: SCENT_TEXT_COLORS[tag] ?? BAR_COLORS.scent,
                    }]} />
                  </View>
                  <Text style={[styles.barPct, { color: SCENT_TEXT_COLORS[tag] ?? BAR_COLORS.scent }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* ── 원료 선호도 ── */}
        {topNotes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>원료 선호도</Text>
            {topNotes.map(([note, count]) => {
              const pct = Math.round((count / maxNoteCount) * 100);
              return (
                <View key={note} style={styles.barRow}>
                  <Text style={styles.barLabel}>{note}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: BAR_COLORS.note }]} />
                  </View>
                  <Text style={[styles.barPct, { color: BAR_COLORS.note }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── 메뉴 ── */}
        <View style={styles.menuCard}>
          {[
            { icon: 'heart-outline' as const,         label: '내 향 취향',      sub: '테스트 다시 하기' },
            { icon: 'star-outline' as const,           label: '내가 남긴 리뷰',  sub: `${reviewCount}개` },
            { icon: 'notifications-outline' as const,  label: '알림 설정',       sub: null },
            { icon: 'person-outline' as const,         label: '계정 관리',       sub: null },
          ].map((m, i, a) => (
            <TouchableOpacity
              key={m.label}
              style={[styles.menuRow, i < a.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
            >
              <Ionicons name={m.icon} size={20} color={COLORS.primaryInk} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{m.label}</Text>
                {m.sub && <Text style={styles.menuSub}>{m.sub}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 구독 중인 브랜드 ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>구독 중인 브랜드</Text>
          {subscribedBrands.length === 0 ? (
            <Text style={styles.emptyHint}>관심 브랜드를 구독해보세요</Text>
          ) : (
            <View style={styles.brandChips}>
              {subscribedBrands.map((sub) => (
                <TouchableOpacity
                  key={sub.brand_id}
                  style={styles.brandChip}
                  onPress={() => toggleBrandSubscription(sub.brand_id)}
                >
                  <Text style={styles.brandChipText}>{sub.brand_id}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.brandChip, styles.brandChipAdd]}
                onPress={() => showToast('브랜드 구독 기능을 준비 중이에요.')}
              >
                <Ionicons name="add" size={14} color={COLORS.primaryInk} />
                <Text style={styles.brandChipAddText}>추가</Text>
              </TouchableOpacity>
            </View>
          )}
          {subscribedBrands.length === 0 && (
            <View style={styles.brandChips}>
              <TouchableOpacity
                style={[styles.brandChip, styles.brandChipAdd]}
                onPress={() => showToast('브랜드 구독 기능을 준비 중이에요.')}
              >
                <Ionicons name="add" size={14} color={COLORS.primaryInk} />
                <Text style={styles.brandChipAddText}>추가</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 알림 설정 ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>알림 설정</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>오늘의 향수 추천</Text>
              <Text style={styles.settingDesc}>컬렉션 기반 매일 아침 추천</Text>
            </View>
            <Switch
              value={notificationSettings.dailyRecommendation}
              onValueChange={(v) => setNotificationSetting('dailyRecommendation', v)}
              trackColor={{ false: COLORS.gray300, true: COLORS.primaryDark }}
              thumbColor={COLORS.white}
            />
          </View>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>구독 브랜드 소식</Text>
              <Text style={styles.settingDesc}>신제품 및 이벤트 알림</Text>
            </View>
            <Switch
              value={notificationSettings.brandUpdates}
              onValueChange={(v) => setNotificationSetting('brandUpdates', v)}
              trackColor={{ false: COLORS.gray300, true: COLORS.primaryDark }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* ── 로그아웃 ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.loginTypeLabel}>{loginLabel}</Text>
        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <NicknameEditSheet
        visible={nickSheetOpen}
        onClose={() => setNickSheetOpen(false)}
        currentNickname={user.nickname ?? ''}
        lastChangedAt={user.nickname_changed_at}
        onSave={handleNicknameSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: SPACING.xl },

  // 프로필
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingVertical: 12,
    gap: 14,
    backgroundColor: COLORS.background,
  },
  avatarWrap: {
    width: 64, height: 64, borderRadius: 9999,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOW.sm,
  },
  avatarInitial: { fontSize: 24, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.primaryInk },
  profileInfo: { flex: 1 },
  nickname: { fontSize: 17, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  nicknameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  profileTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  profileTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  profileTagText: { fontSize: 10, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primaryInk },
  loginPromptBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  loginPromptText: { fontSize: 10, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },

  // 통계
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 6,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  statNum: { fontSize: FONT_SIZES.h2 + 2, fontWeight: FONT_WEIGHTS.black, color: COLORS.primaryInk, letterSpacing: -0.5, marginBottom: 2 },
  statLabel: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },

  // 메뉴
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
    ...SHADOW.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: TOUCH_TARGET_MIN,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
  menuSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },

  // 공통 카드
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.bodyLg,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyHint: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.bodySm },

  // 바 차트
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: SPACING.sm },
  barLabel: { width: 60, fontSize: FONT_SIZES.small, color: COLORS.textSecondary, textAlign: 'right' },
  barTrack: {
    flex: 1, height: 8,
    backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.full, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  barPct: { width: 36, fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.bold, textAlign: 'right' },

  // 브랜드 칩
  brandChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  brandChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.full,
  },
  brandChipText: { fontSize: FONT_SIZES.bodySm, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },
  brandChipAdd: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.primaryDark,
  },
  brandChipAddText: { fontSize: FONT_SIZES.bodySm, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },

  // 알림 설정
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: TOUCH_TARGET_MIN,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
  settingDesc: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: LINE_HEIGHTS.caption,
  },

  // 로그아웃 — 위험·되돌릴 수 있는 ghost 액션이라 secondary보다 한 단계 가벼운 톤
  logoutBtn: {
    margin: SPACING.md,
    height: BUTTON_HEIGHT.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold },
  loginTypeLabel: {
    textAlign: 'center',
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
  },
});
