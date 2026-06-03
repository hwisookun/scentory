import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
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

interface FolderPickerProps {
  visible: boolean;
  onClose: () => void;
  perfumeId: string; // 폴더 배정할 향수 ID
}

/**
 * 위시리스트 폴더 선택 시트.
 * - 기존 폴더 리스트 + 체크 토글로 다중 폴더 배정
 * - 상단에 "새 폴더 만들기" 인라인 입력
 */
export const FolderPicker: React.FC<FolderPickerProps> = ({ visible, onClose, perfumeId }) => {
  const folders = useAppStore((s) => s.wishlistFolders);
  const addFolder = useAppStore((s) => s.addWishlistFolder);
  const toggleFolderPerfume = useAppStore((s) => s.toggleFolderPerfume);
  const deleteFolder = useAppStore((s) => s.deleteWishlistFolder);
  const showToast = useAppStore((s) => s.showToast);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreating(false);
      return;
    }
    const id = addFolder(trimmed);
    toggleFolderPerfume(id, perfumeId);
    haptic('success');
    showToast(`'${trimmed}' 폴더를 만들고 담았어요`);
    setNewName('');
    setCreating(false);
  };

  const handleToggle = (folder: WishlistFolder) => {
    haptic('selection');
    toggleFolderPerfume(folder.id, perfumeId);
  };

  const handleDelete = (folder: WishlistFolder) => {
    haptic('warning');
    deleteFolder(folder.id);
    showToast(`'${folder.name}' 폴더를 삭제했어요`);
  };

  return (
    <DragSheet visible={visible} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>폴더에 담기</Text>
          <Pressable onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={COLORS.gray600} />
          </Pressable>
        </View>

        {/* 새 폴더 만들기 */}
        {creating ? (
          <View style={styles.createRow}>
            <View style={styles.createIconWrap}>
              <Ionicons name="folder-outline" size={20} color={COLORS.primaryDark} />
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
        ) : (
          <PressableScale
            style={styles.addRow}
            onPress={() => setCreating(true)}
            haptic="light"
            scaleTo={0.98}
          >
            <View style={styles.createIconWrap}>
              <Ionicons name="add" size={20} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.addText}>새 폴더 만들기</Text>
          </PressableScale>
        )}

        {/* 기존 폴더 리스트 */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {folders.length === 0 && !creating && (
            <Text style={styles.emptyText}>아직 만든 폴더가 없어요.{'\n'}새 폴더부터 시작해보세요.</Text>
          )}
          {folders.map((f) => {
            const checked = f.perfumeIds.includes(perfumeId);
            return (
              <View key={f.id} style={styles.folderRow}>
                <PressableScale
                  style={styles.folderTap}
                  onPress={() => handleToggle(f)}
                  scaleTo={0.98}
                  haptic={null}
                >
                  <View style={[styles.folderIconWrap, checked && styles.folderIconWrapActive]}>
                    <Ionicons
                      name={checked ? 'folder' : 'folder-outline'}
                      size={20}
                      color={checked ? COLORS.white : COLORS.primaryInk}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.folderName} numberOfLines={1}>{f.name}</Text>
                    <Text style={styles.folderCount}>{f.perfumeIds.length}개</Text>
                  </View>
                  <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                    {checked && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                  </View>
                </PressableScale>
                <Pressable
                  onPress={() => handleDelete(f)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.deleteBtn}
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
    maxHeight: 540,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.h3, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    minHeight: TOUCH_TARGET_MIN,
    marginBottom: SPACING.sm,
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
  createIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
  },
  addText: { flex: 1, fontSize: FONT_SIZES.bodyLg, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.bold },
  createInput: {
    flex: 1,
    fontSize: FONT_SIZES.bodyLg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    padding: 0,
  },

  list: { maxHeight: 320 },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.bodySm,
    lineHeight: 22,
    paddingVertical: SPACING.xl,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  folderTap: {
    flex: 1,
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
  },
  folderIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  folderIconWrapActive: { backgroundColor: COLORS.primaryDark },
  folderName: { fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  folderCount: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },

  checkbox: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },

  deleteBtn: {
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 16,
  },

  doneBtn: {
    marginTop: SPACING.md,
  },
  doneText: { color: COLORS.white, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold },
});
