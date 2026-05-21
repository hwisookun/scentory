import * as Haptics from 'expo-haptics';
import type { HapticKind } from '../constants/motion';

// Haptic feedback wrapper — 어떤 종류든 단일 함수로
// 호출. 웹/지원 안 되는 환경에서는 silent fail.
export function haptic(kind: HapticKind = 'light') {
  try {
    switch (kind) {
      case 'selection':
        Haptics.selectionAsync();
        return;
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
    }
  } catch {
    // 지원 안 되는 환경 — 무시
  }
}
