import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DragSheet } from './DragSheet';
import { PressableScale } from './PressableScale';
import {
  COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
  BUTTON_HEIGHT, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import {
  validateNickname, getCooldownStatus, NICKNAME_RULE_LINES, NICKNAME_RULES,
} from '../../lib/nicknameRules';
import { haptic } from '../../lib/haptic';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentNickname: string;
  /** 마지막으로 변경한 시각(ISO). null이면 한 번도 변경 안 함 → 즉시 변경 가능. */
  lastChangedAt: string | null | undefined;
  /** 검증 통과 시 호출 — 저장 자체는 부모에서 처리. */
  onSave: (next: string) => void;
}

export const NicknameEditSheet: React.FC<Props> = ({
  visible, onClose, currentNickname, lastChangedAt, onSave,
}) => {
  const [draft, setDraft] = useState(currentNickname);
  const [touched, setTouched] = useState(false);

  // 시트가 열릴 때마다 초기화
  useEffect(() => {
    if (visible) {
      setDraft(currentNickname);
      setTouched(false);
    }
  }, [visible, currentNickname]);

  const cooldown = useMemo(() => getCooldownStatus(lastChangedAt ?? null), [lastChangedAt]);

  // 입력 중 검증 — 사용자가 한 번이라도 타이핑한 후에만 에러 노출
  const validation = useMemo(() => validateNickname(draft.trim()), [draft]);
  const showError = touched && !validation.ok;
  const unchanged = draft.trim() === currentNickname.trim();
  const canSubmit = cooldown.canChange && validation.ok && !unchanged;

  const handleSave = () => {
    if (!canSubmit || !validation.ok) return;
    haptic('success');
    onSave(draft.trim());
  };

  return (
    <DragSheet visible={visible} onClose={onClose} maxHeightRatio={0.82}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>닉네임 변경</Text>
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={COLORS.gray600} />
          </Pressable>
        </View>

        {/* 30일 쿨다운 안내 */}
        <View style={[styles.notice, !cooldown.canChange && styles.noticeLocked]}>
          <Ionicons
            name={cooldown.canChange ? 'information-circle-outline' : 'lock-closed'}
            size={16}
            color={cooldown.canChange ? COLORS.primaryInk : COLORS.error}
          />
          <Text style={[styles.noticeText, !cooldown.canChange && styles.noticeTextLocked]}>
            {cooldown.canChange
              ? `닉네임은 ${NICKNAME_RULES.cooldownDays}일에 한 번 변경할 수 있어요.`
              : `${cooldown.daysRemaining}일 후 다시 변경할 수 있어요.`}
          </Text>
        </View>

        {/* 입력 필드 */}
        <View style={[
          styles.inputWrap,
          showError && styles.inputWrapError,
          !cooldown.canChange && styles.inputWrapDisabled,
        ]}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={(v) => { setDraft(v); setTouched(true); }}
            placeholder="새 닉네임"
            placeholderTextColor={COLORS.textLight}
            // 한글 max(10)와 영문 max(16) 중 큰 값을 maxLength로. 실제 검증은 별도.
            maxLength={NICKNAME_RULES.englishMax}
            autoCapitalize="none"
            autoCorrect={false}
            editable={cooldown.canChange}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {draft.length > 0 && cooldown.canChange && (
            <Pressable
              onPress={() => { setDraft(''); setTouched(true); }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
            </Pressable>
          )}
        </View>

        {/* 검증 에러 또는 카운트 */}
        {showError && !validation.ok ? (
          <Text style={styles.errorText}>{validation.reason}</Text>
        ) : (
          <Text style={styles.counter}>{[...draft].length} / {NICKNAME_RULES.englishMax}</Text>
        )}

        {/* 규칙 안내 */}
        <View style={styles.rulesBlock}>
          <Text style={styles.rulesTitle}>닉네임 규칙</Text>
          {NICKNAME_RULE_LINES.map((line) => (
            <View key={line} style={styles.ruleRow}>
              <Ionicons name="checkmark" size={14} color={COLORS.primaryInk} />
              <Text style={styles.ruleText}>{line}</Text>
            </View>
          ))}
        </View>

        <View style={styles.btnRow}>
          <PressableScale style={[styles.btn, styles.btnGhost]} onPress={onClose} haptic="light">
            <Text style={styles.btnGhostText}>취소</Text>
          </PressableScale>
          <PressableScale
            style={[styles.btn, styles.btnPrimary, !canSubmit && styles.btnDisabled]}
            onPress={handleSave}
            haptic="medium"
            disabled={!canSubmit}
          >
            <Text style={styles.btnPrimaryText}>저장</Text>
          </PressableScale>
        </View>
      </View>
    </DragSheet>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  noticeLocked: { backgroundColor: '#FDECEC' },
  noticeText: {
    flex: 1,
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.primaryInk,
    lineHeight: LINE_HEIGHTS.bodySm * 1.4,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  noticeTextLocked: { color: COLORS.error },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: TOUCH_TARGET_MIN + 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapError: { borderColor: COLORS.error },
  inputWrapDisabled: { opacity: 0.6 },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.bodyLg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    padding: 0,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: FONT_SIZES.caption,
    color: COLORS.textLight,
    marginTop: -SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: -SPACING.sm,
  },

  rulesBlock: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 6,
  },
  rulesTitle: {
    fontSize: FONT_SIZES.bodySm,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginBottom: 4,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ruleText: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.bodySm * 1.4 },

  btnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  btn: {
    flex: 1,
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  btnPrimary: { backgroundColor: COLORS.primaryDark },
  btnPrimaryText: { color: COLORS.white, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold },
  btnGhost: { backgroundColor: COLORS.gray100 },
  btnGhostText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.semibold },
  btnDisabled: { opacity: 0.5 },
});
