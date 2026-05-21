import { create } from 'zustand';

interface ToastStore {
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
}

// Toast 전용 store — 전역 스토어에서 분리하여 2.2초 자동숨김 시 다른 화면이 리렌더링되지 않도록
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  visible: false,
  message: '',
  show: (message) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: true, message });
    hideTimer = setTimeout(() => set({ visible: false }), 2200);
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: false });
  },
}));
