import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Perfume, UserProfile, WishlistItem, CollectionItem,
  BrandSubscription, ScentTag, Purpose, PriceRange, DiaryEntry,
} from '../types';

interface OnboardingState {
  purpose: Purpose | null;
  priceRange: PriceRange | null;
  preferredBrands: string[];
  preferredScents: ScentTag[];
  preferredNotes: string[];
  isCompleted: boolean;
}

interface ToastState {
  visible: boolean;
  message: string;
}

interface NotificationSettings {
  dailyRecommendation: boolean;
  brandUpdates: boolean;
}

export interface WishlistFolder {
  id: string;
  name: string;
  perfumeIds: string[];
  createdAt: string;
}

export interface GachaPull {
  dateKey: string;     // YYYY-MM-DD
  perfumeId: string;
  story: string;
}

export interface GachaState {
  lastPullDate: string | null;  // YYYY-MM-DD
  history: GachaPull[];         // 최신순
}

interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isFirstLaunch: boolean;

  onboarding: OnboardingState;

  wishlist: WishlistItem[];
  wishlistFolders: WishlistFolder[];
  collections: CollectionItem[];
  brandSubscriptions: BrandSubscription[];
  reviewCount: number;

  perfumeDiary: Record<string, DiaryEntry>;
  gacha: GachaState;

  toast: ToastState;
  notificationSettings: NotificationSettings;

  // Auth
  loginAsGuest: () => void;
  loginWithSocial: (
    type: 'apple' | 'kakao' | 'naver',
    profile?: { id?: string; nickname?: string; email?: string },
  ) => void;
  logout: () => void;

  // Onboarding
  setOnboardingPurpose: (purpose: Purpose) => void;
  setOnboardingPriceRange: (range: PriceRange) => void;
  toggleOnboardingBrand: (brandId: string) => void;
  toggleOnboardingScent: (scent: ScentTag) => void;
  toggleOnboardingNote: (note: string) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;

  // Wishlist
  toggleWishlist: (perfume: Perfume) => void;
  isWishlisted: (perfumeId: string) => boolean;

  // Collection
  addToCollection: (perfume: Perfume, memo?: string, rating?: number) => void;
  removeFromCollection: (perfumeId: string) => void;
  isInCollection: (perfumeId: string) => boolean;

  // Brand subscriptions
  toggleBrandSubscription: (brandId: string) => void;
  setBrandNotification: (brandId: string, type: 'push' | 'email', value: boolean) => void;

  // Review
  incrementReviewCount: () => void;

  // Toast
  showToast: (message: string) => void;
  hideToast: () => void;

  // Notification settings
  setNotificationSetting: (key: keyof NotificationSettings, value: boolean) => void;

  // Inline 편집
  setNickname: (nickname: string) => void;

  // 위시리스트 폴더
  addWishlistFolder: (name: string) => string;
  renameWishlistFolder: (folderId: string, name: string) => void;
  deleteWishlistFolder: (folderId: string) => void;
  toggleFolderPerfume: (folderId: string, perfumeId: string) => void;

  // 향수 다이어리
  upsertDiaryEntry: (
    dateKey: string,
    patch: Pick<DiaryEntry, 'perfumeId' | 'rating' | 'note'> & { calendarEventId?: string },
  ) => DiaryEntry;
  deleteDiaryEntry: (dateKey: string) => void;
  setDiaryCalendarEventId: (dateKey: string, eventId: string | undefined) => void;

  // 오늘의 향 가챠
  recordGachaPull: (dateKey: string, perfumeId: string, story: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isFirstLaunch: true,

  onboarding: {
    purpose: null,
    priceRange: null,
    preferredBrands: [],
    preferredScents: [],
    preferredNotes: [],
    isCompleted: false,
  },

  wishlist: [],
  wishlistFolders: [],
  collections: [],
  brandSubscriptions: [],
  reviewCount: 0,

  perfumeDiary: {},
  gacha: { lastPullDate: null, history: [] },

  toast: { visible: false, message: '' },

  notificationSettings: {
    dailyRecommendation: true,
    brandUpdates: true,
  },

  loginAsGuest: () =>
    set({
      isAuthenticated: true,
      isGuest: true,
      user: {
        id: 'guest',
        nickname: '게스트',
        email: '',
        loginType: 'guest',
        pref_scents: [],
        pref_notes: [],
        created_at: new Date().toISOString(),
      },
    }),

  loginWithSocial: (type, profile) => {
    // profile이 주어지면 (실제 OAuth 결과) 그 값을 우선 사용,
    // 없으면 (개발 모드 fallback) 프로바이더별 placeholder.
    const fallbackNickname =
      type === 'apple' ? 'Apple 사용자'
      : type === 'kakao' ? '카카오 사용자'
      : '네이버 사용자';
    set({
      isAuthenticated: true,
      isGuest: false,
      user: {
        id: profile?.id ?? `${type}_user`,
        nickname: profile?.nickname?.trim() || fallbackNickname,
        email: profile?.email ?? `user@${type}.com`,
        loginType: type,
        pref_scents: [],
        pref_notes: [],
        created_at: new Date().toISOString(),
      },
    });
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      wishlist: [],
      wishlistFolders: [],
      collections: [],
      perfumeDiary: {},
      gacha: { lastPullDate: null, history: [] },
      onboarding: {
        purpose: null,
        priceRange: null,
        preferredBrands: [],
        preferredScents: [],
        preferredNotes: [],
        isCompleted: false,
      },
    }),

  setOnboardingPurpose: (purpose) =>
    set((s) => ({ onboarding: { ...s.onboarding, purpose } })),

  setOnboardingPriceRange: (priceRange) =>
    set((s) => ({ onboarding: { ...s.onboarding, priceRange } })),

  toggleOnboardingBrand: (brandId) =>
    set((s) => {
      const brands = s.onboarding.preferredBrands.includes(brandId)
        ? s.onboarding.preferredBrands.filter((b) => b !== brandId)
        : [...s.onboarding.preferredBrands, brandId];
      return { onboarding: { ...s.onboarding, preferredBrands: brands } };
    }),

  toggleOnboardingScent: (scent) =>
    set((s) => {
      const scents = s.onboarding.preferredScents.includes(scent)
        ? s.onboarding.preferredScents.filter((sc) => sc !== scent)
        : [...s.onboarding.preferredScents, scent];
      return { onboarding: { ...s.onboarding, preferredScents: scents } };
    }),

  toggleOnboardingNote: (note) =>
    set((s) => {
      const notes = s.onboarding.preferredNotes.includes(note)
        ? s.onboarding.preferredNotes.filter((n) => n !== note)
        : [...s.onboarding.preferredNotes, note];
      return { onboarding: { ...s.onboarding, preferredNotes: notes } };
    }),

  completeOnboarding: () =>
    set((s) => ({
      isFirstLaunch: false,
      onboarding: { ...s.onboarding, isCompleted: true },
    })),

  skipOnboarding: () =>
    set((s) => ({
      isFirstLaunch: false,
      onboarding: { ...s.onboarding, isCompleted: true },
    })),

  toggleWishlist: (perfume) =>
    set((s) => {
      const exists = s.wishlist.some((w) => w.perfume_id === perfume.id);
      if (exists) {
        get().showToast('위시리스트에서 제거했어요.');
        return { wishlist: s.wishlist.filter((w) => w.perfume_id !== perfume.id) };
      }
      get().showToast('향을 내 마음에 담아 봤어요.');
      const newItem: WishlistItem = {
        id: Date.now().toString(),
        user_id: s.user?.id ?? 'guest',
        perfume_id: perfume.id,
        perfume,
        added_at: new Date().toISOString(),
      };
      return { wishlist: [...s.wishlist, newItem] };
    }),

  isWishlisted: (perfumeId) => get().wishlist.some((w) => w.perfume_id === perfumeId),

  addToCollection: (perfume, memo, rating) =>
    set((s) => {
      if (s.collections.some((c) => c.perfume_id === perfume.id)) return s;
      get().showToast('컬렉션에 추가됐어요.');
      const newItem: CollectionItem = {
        id: Date.now().toString(),
        user_id: s.user?.id ?? 'guest',
        perfume_id: perfume.id,
        perfume,
        memo,
        rating,
      };
      return { collections: [...s.collections, newItem] };
    }),

  removeFromCollection: (perfumeId) =>
    set((s) => ({
      collections: s.collections.filter((c) => c.perfume_id !== perfumeId),
    })),

  isInCollection: (perfumeId) => get().collections.some((c) => c.perfume_id === perfumeId),

  toggleBrandSubscription: (brandId) =>
    set((s) => {
      const exists = s.brandSubscriptions.find((b) => b.brand_id === brandId);
      if (exists) {
        return { brandSubscriptions: s.brandSubscriptions.filter((b) => b.brand_id !== brandId) };
      }
      return {
        brandSubscriptions: [...s.brandSubscriptions, { brand_id: brandId, push: true, email: false }],
      };
    }),

  setBrandNotification: (brandId, type, value) =>
    set((s) => ({
      brandSubscriptions: s.brandSubscriptions.map((b) =>
        b.brand_id === brandId ? { ...b, [type]: value } : b
      ),
    })),

  incrementReviewCount: () => set((s) => ({ reviewCount: s.reviewCount + 1 })),

  showToast: (message) => {
    set({ toast: { visible: true, message } });
    setTimeout(() => get().hideToast(), 2200);
  },

  hideToast: () => set({ toast: { visible: false, message: '' } }),

  setNotificationSetting: (key, value) =>
    set((s) => ({ notificationSettings: { ...s.notificationSettings, [key]: value } })),

  setNickname: (nickname) =>
    set((s) => (s.user
      ? { user: { ...s.user, nickname, nickname_changed_at: new Date().toISOString() } }
      : {})),

  // 위시리스트 폴더
  addWishlistFolder: (name: string) => {
    const id = `f-${Date.now()}`;
    const folder: WishlistFolder = {
      id,
      name: name.trim(),
      perfumeIds: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ wishlistFolders: [...s.wishlistFolders, folder] }));
    return id;
  },
  renameWishlistFolder: (folderId, name) =>
    set((s) => ({
      wishlistFolders: s.wishlistFolders.map((f) =>
        f.id === folderId ? { ...f, name: name.trim() } : f
      ),
    })),
  deleteWishlistFolder: (folderId) =>
    set((s) => ({
      wishlistFolders: s.wishlistFolders.filter((f) => f.id !== folderId),
    })),
  toggleFolderPerfume: (folderId, perfumeId) =>
    set((s) => ({
      wishlistFolders: s.wishlistFolders.map((f) => {
        if (f.id !== folderId) return f;
        const has = f.perfumeIds.includes(perfumeId);
        return {
          ...f,
          perfumeIds: has
            ? f.perfumeIds.filter((id) => id !== perfumeId)
            : [...f.perfumeIds, perfumeId],
        };
      }),
    })),

  upsertDiaryEntry: (dateKey, patch) => {
    const now = new Date().toISOString();
    const existing = get().perfumeDiary[dateKey];
    const next: DiaryEntry = existing
      ? { ...existing, ...patch, updatedAt: now }
      : {
          dateKey,
          perfumeId: patch.perfumeId,
          rating: patch.rating,
          note: patch.note,
          calendarEventId: patch.calendarEventId,
          createdAt: now,
          updatedAt: now,
        };
    set((s) => ({ perfumeDiary: { ...s.perfumeDiary, [dateKey]: next } }));
    return next;
  },

  deleteDiaryEntry: (dateKey) =>
    set((s) => {
      const { [dateKey]: _omit, ...rest } = s.perfumeDiary;
      return { perfumeDiary: rest };
    }),

  setDiaryCalendarEventId: (dateKey, eventId) =>
    set((s) => {
      const entry = s.perfumeDiary[dateKey];
      if (!entry) return s;
      return {
        perfumeDiary: {
          ...s.perfumeDiary,
          [dateKey]: { ...entry, calendarEventId: eventId, updatedAt: new Date().toISOString() },
        },
      };
    }),

  recordGachaPull: (dateKey, perfumeId, story) =>
    set((s) => {
      // 같은 날짜의 기록은 덮어쓰기 — '하루 한 번' 게이트는 화면에서 막지만 방어적으로 처리.
      const filtered = s.gacha.history.filter((h) => h.dateKey !== dateKey);
      const next: GachaPull = { dateKey, perfumeId, story };
      return {
        gacha: {
          lastPullDate: dateKey,
          history: [next, ...filtered].slice(0, 30), // 최근 30일만 보관
        },
      };
    }),
    }),
    {
      name: 'matda-app-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // toast는 UI 임시 상태 — 다음 세션으로 끌고 가지 않아요.
      // 액션(함수)은 zustand가 자동으로 제외하니까 데이터 슬라이스만 명시.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        isFirstLaunch: state.isFirstLaunch,
        onboarding: state.onboarding,
        wishlist: state.wishlist,
        wishlistFolders: state.wishlistFolders,
        collections: state.collections,
        brandSubscriptions: state.brandSubscriptions,
        reviewCount: state.reviewCount,
        notificationSettings: state.notificationSettings,
        perfumeDiary: state.perfumeDiary,
        gacha: state.gacha,
      }),
    },
  ),
);
