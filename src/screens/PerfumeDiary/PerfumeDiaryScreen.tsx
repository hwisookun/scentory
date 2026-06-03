import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, TOUCH_TARGET_MIN,
  BORDER_RADIUS, BUTTON_HEIGHT, LINE_HEIGHTS,
} from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { usePerfumes } from '../../lib/api/hooks';
import type { Perfume, DiaryEntry } from '../../types';
import { DragSheet } from '../../components/common/DragSheet';
import { Button } from '../../components/common/Button';
import { haptic } from '../../lib/haptic';
import { addOrUpdateDiaryEvent, deleteDiaryEvent } from '../../lib/calendar';

// ─────────────────────────────────────────────────────────────
// 날짜 유틸
// ─────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function buildMonth(view: Date): (Date | null)[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const last = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const lead = first.getDay();
  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─────────────────────────────────────────────────────────────
// 별점 컴포넌트
// ─────────────────────────────────────────────────────────────
const StarRow: React.FC<{ value: number; size?: number; onChange?: (v: number) => void }> = ({
  value, size = 18, onChange,
}) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((i) => {
      const filled = i <= value;
      const Star = (
        <Ionicons
          name={filled ? 'star' : 'star-outline'}
          size={size}
          color={filled ? COLORS.star : COLORS.gray400}
        />
      );
      if (!onChange) return <View key={i}>{Star}</View>;
      return (
        <Pressable
          key={i}
          onPress={() => { haptic('selection'); onChange(i === value ? 0 : i); }}
          hitSlop={6}
        >
          {Star}
        </Pressable>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────────────────
// 메인 스크린
// ─────────────────────────────────────────────────────────────
export const PerfumeDiaryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);

  const diary = useAppStore((s) => s.perfumeDiary);
  const cells = useMemo(() => buildMonth(view), [view]);

  const monthLabel = `${view.getFullYear()}년 ${view.getMonth() + 1}월`;

  const goPrev = () => { haptic('selection'); setView(new Date(view.getFullYear(), view.getMonth() - 1, 1)); };
  const goNext = () => { haptic('selection'); setView(new Date(view.getFullYear(), view.getMonth() + 1, 1)); };
  const goToday = () => {
    haptic('light');
    setView(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
  };

  const entriesThisMonth = useMemo(
    () => Object.values(diary).filter((e) => {
      const [y, m] = e.dateKey.split('-').map(Number);
      return y === view.getFullYear() && m === view.getMonth() + 1;
    }),
    [diary, view],
  );

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
        <Text style={styles.headerTitle}>향수 다이어리</Text>
        <Pressable
          onPress={goToday}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.todayLabel}>오늘</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
        <View style={styles.monthBar}>
          <Pressable onPress={goPrev} style={styles.monthArrow} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable onPress={goNext} style={styles.monthArrow} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEK.map((w, i) => (
            <Text
              key={w}
              style={[
                styles.weekday,
                i === 0 && { color: COLORS.accentInk },
                i === 6 && { color: COLORS.primaryInk },
              ]}
            >
              {w}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, idx) => {
            if (!cell) return <View key={`e-${idx}`} style={styles.cell} />;
            const key = toKey(cell);
            const entry = diary[key];
            const isToday = sameDay(cell, today);
            const dow = cell.getDay();

            return (
              <Pressable
                key={key}
                onPress={() => { haptic('selection'); setSelected(cell); }}
                style={styles.cell}
                android_ripple={{ color: COLORS.primaryLight, borderless: true }}
              >
                <View style={[
                  styles.dayWrap,
                  isToday && styles.dayWrapToday,
                  !!entry && styles.dayWrapHasEntry,
                ]}>
                  <Text style={[
                    styles.dayNum,
                    dow === 0 && { color: COLORS.accentInk },
                    dow === 6 && { color: COLORS.primaryInk },
                    isToday && styles.dayNumToday,
                  ]}>
                    {cell.getDate()}
                  </Text>
                  {entry && (
                    <View style={styles.dot}>
                      {entry.rating > 0 && (
                        <Text style={styles.dotStars}>{'★'.repeat(entry.rating)}</Text>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{entriesThisMonth.length}</Text>
            <Text style={styles.summaryLabel}>이번 달 기록</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>
              {entriesThisMonth.length > 0
                ? (entriesThisMonth.reduce((a, b) => a + b.rating, 0) / entriesThisMonth.length).toFixed(1)
                : '–'}
            </Text>
            <Text style={styles.summaryLabel}>평균 별점</Text>
          </View>
        </View>
      </ScrollView>

      <DiarySheet
        date={selected}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// 다이어리 시트 (peek/edit)
// ─────────────────────────────────────────────────────────────
type SheetMode = 'view' | 'edit';

const DiarySheet: React.FC<{ date: Date | null; onClose: () => void }> = ({ date, onClose }) => {
  const dateKey = date ? toKey(date) : null;
  const entry = useAppStore((s) => (dateKey ? s.perfumeDiary[dateKey] : undefined));
  const upsert = useAppStore((s) => s.upsertDiaryEntry);
  const remove = useAppStore((s) => s.deleteDiaryEntry);
  const setEventId = useAppStore((s) => s.setDiaryCalendarEventId);
  const showToast = useAppStore((s) => s.showToast);
  const { data: allPerfumes = [] } = usePerfumes();

  const [mode, setMode] = useState<SheetMode>('view');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [perfumeId, setPerfumeId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // 시트가 열릴 때마다 모드/필드 초기화
  React.useEffect(() => {
    if (!date) return;
    if (entry) {
      setMode('view');
      setPerfumeId(entry.perfumeId);
      setRating(entry.rating);
      setNote(entry.note);
    } else {
      setMode('edit');
      setPerfumeId(null);
      setRating(0);
      setNote('');
    }
  }, [date, entry?.dateKey]);

  const perfume: Perfume | undefined = useMemo(
    () => (perfumeId ? allPerfumes.find((p) => p.id === perfumeId) : undefined),
    [perfumeId, allPerfumes],
  );

  const dateLabel = date
    ? `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEK[date.getDay()]}요일`
    : '';

  const handleSave = async () => {
    if (!dateKey || !perfumeId) return;
    setSaving(true);
    const saved = upsert(dateKey, { perfumeId, rating, note });

    Alert.alert(
      '캘린더에 추가할까요?',
      '아이폰·갤럭시 기본 캘린더에 오늘의 향수 기록이 함께 보여요.',
      [
        {
          text: '나중에',
          style: 'cancel',
          onPress: () => {
            setSaving(false);
            showToast('다이어리에 기록했어요.');
            onClose();
          },
        },
        {
          text: '추가',
          onPress: async () => {
            const eventId = await addOrUpdateDiaryEvent({
              dateKey,
              perfumeName: perfume?.name ?? '',
              brandName: perfume?.brand?.name,
              rating: saved.rating,
              note: saved.note,
              existingEventId: saved.calendarEventId,
            });
            if (eventId) {
              setEventId(dateKey, eventId);
              showToast('캘린더에도 담아 봤어요.');
            } else {
              showToast('캘린더 접근 권한이 필요해요.');
            }
            setSaving(false);
            onClose();
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleDelete = () => {
    if (!dateKey || !entry) return;
    Alert.alert('이 날의 기록을 지울까요?', '캘린더에 추가된 이벤트도 함께 지워요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '지우기',
        style: 'destructive',
        onPress: async () => {
          if (entry.calendarEventId) await deleteDiaryEvent(entry.calendarEventId);
          remove(dateKey);
          showToast('기록을 지웠어요.');
          onClose();
        },
      },
    ]);
  };

  const visible = date !== null;
  const maxH = mode === 'view' ? 0.55 : 0.88;

  return (
    <>
      <DragSheet visible={visible && !pickerOpen} onClose={onClose} maxHeightRatio={maxH}>
        <View style={sheetStyles.body}>
          <Text style={sheetStyles.date}>{dateLabel}</Text>

          {mode === 'view' && entry ? (
            <ViewMode
              entry={entry}
              perfume={perfume}
              onEdit={() => setMode('edit')}
              onDelete={handleDelete}
            />
          ) : (
            <EditMode
              perfume={perfume}
              rating={rating}
              note={note}
              saving={saving}
              onPickPerfume={() => setPickerOpen(true)}
              onRating={setRating}
              onNote={setNote}
              onCancel={() => (entry ? setMode('view') : onClose())}
              onSave={handleSave}
            />
          )}
        </View>
      </DragSheet>

      <PerfumePickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => { setPerfumeId(id); setPickerOpen(false); }}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// View / Edit 모드
// ─────────────────────────────────────────────────────────────
const ViewMode: React.FC<{
  entry: DiaryEntry;
  perfume?: Perfume;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ entry, perfume, onEdit, onDelete }) => (
  <View style={{ gap: SPACING.md }}>
    <PerfumeRow perfume={perfume} />
    <StarRow value={entry.rating} size={22} />
    {entry.note ? (
      <Text style={sheetStyles.noteRead}>{entry.note}</Text>
    ) : (
      <Text style={sheetStyles.notePlaceholder}>오늘은 짧은 메모 없이 향만 남겨 뒀어요.</Text>
    )}
    <View style={sheetStyles.btnRow}>
      <Pressable style={[sheetStyles.btn, sheetStyles.btnGhost]} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        <Text style={[sheetStyles.btnGhostText, { color: COLORS.error }]}>지우기</Text>
      </Pressable>
      <Button
        title="수정하기"
        icon="create-outline"
        fullWidth={false}
        style={sheetStyles.btnFlex}
        onPress={onEdit}
      />
    </View>
  </View>
);

const EditMode: React.FC<{
  perfume?: Perfume;
  rating: number;
  note: string;
  saving: boolean;
  onPickPerfume: () => void;
  onRating: (v: number) => void;
  onNote: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}> = ({ perfume, rating, note, saving, onPickPerfume, onRating, onNote, onCancel, onSave }) => (
  <View style={{ gap: SPACING.md }}>
    <Pressable onPress={onPickPerfume} style={sheetStyles.pickerCard}>
      {perfume ? (
        <PerfumeRow perfume={perfume} chevron />
      ) : (
        <View style={sheetStyles.pickerEmpty}>
          <Ionicons name="add-circle-outline" size={22} color={COLORS.primaryInk} />
          <Text style={sheetStyles.pickerEmptyText}>오늘의 향수를 골라 주세요</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
        </View>
      )}
    </Pressable>

    <View style={sheetStyles.section}>
      <Text style={sheetStyles.label}>오늘의 별점</Text>
      <StarRow value={rating} size={28} onChange={onRating} />
    </View>

    <View style={sheetStyles.section}>
      <Text style={sheetStyles.label}>다섯 줄 일기</Text>
      <TextInput
        style={sheetStyles.textArea}
        value={note}
        onChangeText={onNote}
        placeholder="오늘 이 향과 함께한 작은 기억을 남겨 보세요."
        placeholderTextColor={COLORS.textLight}
        multiline
        numberOfLines={5}
        maxLength={200}
        textAlignVertical="top"
      />
      <Text style={sheetStyles.counter}>{note.length} / 200</Text>
    </View>

    <View style={sheetStyles.btnRow}>
      <Pressable style={[sheetStyles.btn, sheetStyles.btnGhost]} onPress={onCancel} disabled={saving}>
        <Text style={sheetStyles.btnGhostText}>취소</Text>
      </Pressable>
      <Button
        title="저장"
        icon="checkmark"
        fullWidth={false}
        style={sheetStyles.btnFlex}
        onPress={onSave}
        disabled={!perfume}
        loading={saving}
      />
    </View>
  </View>
);

const PerfumeRow: React.FC<{ perfume?: Perfume; chevron?: boolean }> = ({ perfume, chevron }) => {
  if (!perfume) return null;
  return (
    <View style={sheetStyles.perfumeRow}>
      <Image source={{ uri: perfume.image_url }} style={sheetStyles.perfumeImg} />
      <View style={{ flex: 1 }}>
        <Text style={sheetStyles.perfumeBrand} numberOfLines={1}>{perfume.brand.name}</Text>
        <Text style={sheetStyles.perfumeName} numberOfLines={1}>{perfume.name}</Text>
      </View>
      {chevron && <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// 향수 선택 시트 (Wishlist + Collection)
// ─────────────────────────────────────────────────────────────
const PerfumePickerSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}> = ({ visible, onClose, onSelect }) => {
  const wishlist = useAppStore((s) => s.wishlist);
  const collections = useAppStore((s) => s.collections);

  const list = useMemo(() => {
    const map = new Map<string, Perfume>();
    wishlist.forEach((w) => map.set(w.perfume_id, w.perfume));
    collections.forEach((c) => map.set(c.perfume_id, c.perfume));
    return Array.from(map.values());
  }, [wishlist, collections]);

  return (
    <DragSheet visible={visible} onClose={onClose} maxHeightRatio={0.72}>
      <View style={pickerStyles.body}>
        <Text style={pickerStyles.title}>향수 고르기</Text>
        <Text style={pickerStyles.subtitle}>위시리스트와 컬렉션에 담은 향수예요.</Text>
        {list.length === 0 ? (
          <View style={pickerStyles.empty}>
            <Ionicons name="search-outline" size={32} color={COLORS.gray400} />
            <Text style={pickerStyles.emptyText}>
              아직 담은 향수가 없어요.{'\n'}찾아보기에서 마음에 드는 향을 먼저 담아 주세요.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 420 }}>
            {list.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => { haptic('selection'); onSelect(p.id); }}
                style={pickerStyles.row}
                android_ripple={{ color: COLORS.primaryLight }}
              >
                <Image source={{ uri: p.image_url }} style={pickerStyles.img} />
                <View style={{ flex: 1 }}>
                  <Text style={pickerStyles.brand}>{p.brand.name}</Text>
                  <Text style={pickerStyles.name} numberOfLines={1}>{p.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </DragSheet>
  );
};

// ─────────────────────────────────────────────────────────────
// styles
// ─────────────────────────────────────────────────────────────
const CELL_PAD = SPACING.xs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  iconBtn: {
    width: TOUCH_TARGET_MIN, height: TOUCH_TARGET_MIN,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.h4, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text,
  },
  todayLabel: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.primaryInk },

  monthBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  monthArrow: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  monthLabel: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },

  weekRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.md, marginBottom: SPACING.xs,
  },
  weekday: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.small, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.textSecondary,
    paddingVertical: SPACING.xs,
  },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md - CELL_PAD,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: CELL_PAD,
  },
  dayWrap: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    paddingTop: 6,
    gap: 2,
  },
  dayWrapToday: {
    backgroundColor: COLORS.primaryLight,
  },
  dayWrapHasEntry: {
    backgroundColor: COLORS.secondary,
  },
  dayNum: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  dayNumToday: {
    color: COLORS.primaryDeep,
    fontWeight: FONT_WEIGHTS.extrabold,
  },
  dot: {
    marginTop: 'auto',
    marginBottom: 6,
    minHeight: 12,
    justifyContent: 'flex-end',
  },
  dotStars: {
    fontSize: 9,
    color: COLORS.star,
    letterSpacing: -1,
  },

  summary: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  summaryNum: { fontSize: FONT_SIZES.h2, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.primaryDeep },
  summaryLabel: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
});

const sheetStyles = StyleSheet.create({
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  date: {
    fontSize: FONT_SIZES.bodySm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  pickerCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  pickerEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    minHeight: 56,
  },
  pickerEmptyText: { flex: 1, fontSize: FONT_SIZES.body, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },

  perfumeRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  perfumeImg: {
    width: 52, height: 64, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.gray200,
  },
  perfumeBrand: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  perfumeName: { fontSize: FONT_SIZES.bodyLg, color: COLORS.text, fontWeight: FONT_WEIGHTS.bold, marginTop: 2 },

  section: { gap: SPACING.sm },
  label: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },

  textArea: {
    minHeight: 120,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    color: COLORS.text,
  },
  counter: { alignSelf: 'flex-end', fontSize: FONT_SIZES.caption, color: COLORS.textLight },

  noteRead: { fontSize: FONT_SIZES.body, lineHeight: LINE_HEIGHTS.body, color: COLORS.text },
  notePlaceholder: { fontSize: FONT_SIZES.body, color: COLORS.textLight, fontStyle: 'italic' },

  btnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  btnFlex: { flex: 1 },
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

const pickerStyles = StyleSheet.create({
  body: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.lg, gap: SPACING.sm },
  title: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.bodySm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  img: { width: 44, height: 54, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.gray200 },
  brand: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold },
  name: { fontSize: FONT_SIZES.body, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});
