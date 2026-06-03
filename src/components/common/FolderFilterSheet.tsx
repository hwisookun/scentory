import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, TOUCH_TARGET_MIN,
  BUTTON_HEIGHT,
} from '../../constants/theme';
import { DragSheet } from './DragSheet';
import { PressableScale } from './PressableScale';
import { Button } from './Button';
import { useAppStore, WishlistFolder } from '../../store/useAppStore';
import { haptic } from '../../lib/haptic';

export type FolderFilterValue = 'all' | string;

interface FolderFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selected: FolderFilterValue;
  onSelect: (value: FolderFilterValue) => void;
}

/**
 * 위시리스트 폴더 필터 시트.
 * - 단일 선택 (전체 또는 특정 폴더)
 * - 상단 '+'로 새 폴더 추가
 * - 각 폴더 우측 trash로 삭제
 */
export const FolderFilterSheet: React.FC<FolderFilterSheetProps> = ({
  visible, onClose, selected, onSelect,
}) => {
  const folders = useAppStore((s) => s.wishlistFolders);
  const addFolder = useAppStore((s) => s.addWishlistFolder);
  const deleteFolder = useAppStore((s) => s.deleteWishlistFolder);
  const showToast = useAppStore((s) => s.showToast);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreating(false);
      setNewName('');
      return;
    }
    addFolder(trimmed);
    haptic('success');
    showToast(`'${trimmed}' 폴더를 만들었어요`);
    setNewName('');
    setCreating(false);
  };

  const pick = (value: FolderFilterValue) => {
    haptic('selection');
    onSelect(value);
    onClose();
  };

  const handleDelete = (folder: WishlistFolder) => {
    Alert.alert(
      `'${folder.name}' 폴더를 지울까요?`,
      '폴더에 담아 둔 향수는 위시리스트에 그대로 남아요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '지우기',
          style: 'destructive',
          onPress: () => {
            haptic('warning');
            deleteFolder(folder.id);
            if (selected === folder.id) onSelect('all');
            showToast(`'${folder.name}' 폴더를 지웠어요`);
          },
        },
      ],
    );
  };

  return (
    <DragSheet visible={visible} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>폴더</Text>
          <PressableScale
            onPress={() => { haptic('light'); setCreating(true); }}
            style={styles.addBtn}
            scaleTo={0.92}
            haptic={null}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </PressableScale>
        </View>

        {creating && (
          <View style={styles.createRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="folder-outline" size={18} color={COLORS.primaryDark} />
            </View>
            <TextInput
              style={styles.createInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="폴더 이름"
              placeholderTextColor={COLORS.textLight}
              autoFocus
              maxLength={24}
              onSubmitEditing={handleCreate}
              onBlur={handleCreate}
              returnKeyType="done"
            />
          </View>
        )}

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {/* 전체 (no filter) */}
          <Pressable onPress={() => pick('all')} style={styles.row}>
            <View style={[styles.iconWrap, selected === 'all' && styles.iconWrapActive]}>
              <Ionicons
                name="albums"
                size={18}
                color={selected === 'all' ? COLORS.white : COLORS.primaryInk}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>전체</Text>
              <Text style={styles.subtext}>위시리스트 모두 보기</Text>
            </View>
            {selected === 'all' && (
              <Ionicons name="checkmark" size={20} color={COLORS.primaryDark} />
            )}
          </Pressable>

          {folders.length === 0 && !creating && (
            <Text style={styles.emptyText}>
              아직 만든 폴더가 없어요.{'\n'}오른쪽 위 + 버튼으로 시작해 보세요.
            </Text>
          )}

          {folders.map((f) => {
            const active = selected === f.id;
            return (
              <View key={f.id} style={styles.folderRow}>
                <Pressable
                  onPress={() => pick(f.id)}
                  style={[styles.row, styles.folderTap]}
                >
                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                    <Ionicons
                      name={active ? 'folder' : 'folder-outline'}
                      size={18}
                      color={active ? COLORS.white : COLORS.primaryInk}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{f.name}</Text>
                    <Text style={styles.subtext}>{f.perfumeIds.length}개</Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primaryDark} />
                  )}
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(f)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.trashBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.gray400} />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        <Button title="완료" onPress={onClose} style={styles.doneBtn} />
      </View>
    </DragSheet>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    maxHeight: 560,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center', alignItems: 'center',
  },

  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
    minHeight: TOUCH_TARGET_MIN,
    marginBottom: SPACING.sm,
  },
  createInput: {
    flex: 1,
    fontSize: FONT_SIZES.bodyLg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    padding: 0,
  },

  list: { maxHeight: 360 },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.bodySm,
    lineHeight: 22,
    paddingVertical: SPACING.xl,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGET_MIN,
    marginBottom: 6,
  },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  folderTap: { flex: 1, marginBottom: 6 },
  iconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  iconWrapActive: { backgroundColor: COLORS.primaryDark },
  name: { fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  subtext: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },

  trashBtn: {
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 16,
  },

  doneBtn: {
    marginTop: SPACING.md,
  },
});
