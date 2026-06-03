import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInRight, FadeIn,
} from 'react-native-reanimated';
import { SPRING } from '../../constants/motion';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { PressableScale } from '../../components/common/PressableScale';
import { Button } from '../../components/common/Button';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN, BUTTON_HEIGHT,
} from '../../constants/theme';
import { Purpose, PriceRange, ScentTag } from '../../types';
import { useBrands } from '../../lib/api/hooks';

const PURPOSES: Purpose[] = ['일상용', '데이트', '직장·비즈니스', '선물', '특별한 날', '컬렉션'];
const PRICE_RANGES: { label: string; value: PriceRange; desc: string }[] = [
  { label: '~5만원', value: 'under50k', desc: '가볍게 시작하기 좋은 입문 향수' },
  { label: '5~15만원', value: '50k_150k', desc: '다양한 브랜드, 합리적인 선택' },
  { label: '15~30만원', value: '150k_300k', desc: '고급 브랜드, 퀄리티 있는 향' },
  { label: '30만원~', value: 'over300k', desc: '니치 향수, 프리미엄 경험' },
];
const SCENT_TAGS: ScentTag[] = [
  '플로럴', '시트러스', '우디', '머스크', '프레시', '오리엔탈',
  '아쿠아틱', '구르망', '스파이시', '허벌', '파우더리', '레더',
  '스모키', '그린', '푸제르', '시프레', '발사믹', '아이리스',
];
const NOTES = [
  '베르가못', '자스민', '장미', '시다우드', '바닐라', '라벤더',
  '파출리', '앰버', '머스크', '샌달우드', '통카빈', '베티버',
  '아이리스', '네롤리', '진저', '시트러스', '페퍼', '오렌지',
];

const TIPS: Record<string, string> = {
  purpose: '향수 사용 목적을 알면 더 정확하게 추천해드릴 수 있어요.',
  price: '선호 가격대에 따라 브랜드 선택지가 달라져요.',
  brand: '선택한 가격대의 주력 브랜드들이에요. 여러 개 선택 가능해요.',
  scent: '각 향 계열은 독특한 분위기를 가져요. 메이저부터 비주류 순으로 정렬했어요.',
  notes: '향수의 원료가 되는 소재예요. 좋아하는 향 원료를 골라보세요.',
};

type Step = 'purpose' | 'price' | 'brand' | 'scent' | 'notes';
const STEPS: Step[] = ['purpose', 'price', 'brand', 'scent', 'notes'];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [stepIdx, setStepIdx] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const currentStep = STEPS[stepIdx];

  const onboarding = useAppStore((s) => s.onboarding);
  const setOnboardingPurpose = useAppStore((s) => s.setOnboardingPurpose);
  const setOnboardingPriceRange = useAppStore((s) => s.setOnboardingPriceRange);
  const toggleOnboardingBrand = useAppStore((s) => s.toggleOnboardingBrand);
  const toggleOnboardingScent = useAppStore((s) => s.toggleOnboardingScent);
  const toggleOnboardingNote = useAppStore((s) => s.toggleOnboardingNote);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const progress = (stepIdx + 1) / STEPS.length;

  // 진행 바 스프링 애니메이션
  const progressSV = useSharedValue(progress);
  useEffect(() => {
    progressSV.value = withSpring(progress, SPRING.snappy);
  }, [progress]);
  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progressSV.value * 100}%`,
  }));

  const { data: allBrands = [] } = useBrands();
  const brandsForPriceRange = onboarding.priceRange
    ? allBrands.filter((b) => b.priceRange === onboarding.priceRange)
    : allBrands;

  const canGoNext = () => {
    if (currentStep === 'purpose') return !!onboarding.purpose;
    if (currentStep === 'price') return !!onboarding.priceRange;
    return true;
  };

  const goMain = () => {
    completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else goMain();
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const isLast = stepIdx === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backBtn, stepIdx === 0 && styles.hidden]}
          disabled={stepIdx === 0}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressFillStyle]} />
          </View>
          <Text style={styles.progressText}>{stepIdx + 1} / {STEPS.length}</Text>
        </View>

        <TouchableOpacity onPress={() => setTooltipVisible(true)} style={styles.tipBtn}>
          <View style={styles.tipCircle}>
            <Text style={styles.tipQ}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View key={currentStep} entering={FadeInRight.duration(280)}>
        {currentStep === 'purpose' && (
          <>
            <Text style={styles.title}>어떤 향수를 찾고 계세요?</Text>
            <Text style={styles.subtitle}>주요 사용 목적을 알려주세요</Text>
            <View style={styles.grid}>
              {PURPOSES.map((p) => (
                <PressableScale
                  key={p}
                  style={[styles.chip, onboarding.purpose === p && styles.chipSelected]}
                  onPress={() => setOnboardingPurpose(p)}
                  haptic="selection"
                  scaleTo={0.94}
                >
                  <Text style={[styles.chipText, onboarding.purpose === p && styles.chipTextSelected]}>{p}</Text>
                </PressableScale>
              ))}
            </View>
          </>
        )}

        {currentStep === 'price' && (
          <>
            <Text style={styles.title}>예산이 어느 정도인가요?</Text>
            <Text style={styles.subtitle}>선호하는 가격대를 선택해주세요</Text>
            <View style={styles.listContainer}>
              {PRICE_RANGES.map((pr) => (
                <PressableScale
                  key={pr.value}
                  style={[styles.listItem, onboarding.priceRange === pr.value && styles.listItemSelected]}
                  onPress={() => setOnboardingPriceRange(pr.value)}
                  haptic="selection"
                  scaleTo={0.97}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listItemText, onboarding.priceRange === pr.value && styles.listItemTextSelected]}>
                      {pr.label}
                    </Text>
                    <Text style={styles.listItemDesc}>{pr.desc}</Text>
                  </View>
                  {onboarding.priceRange === pr.value && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryDark} />
                  )}
                </PressableScale>
              ))}
            </View>
          </>
        )}

        {currentStep === 'brand' && (
          <>
            <Text style={styles.title}>좋아하는 브랜드가 있나요?</Text>
            <Text style={styles.subtitle}>
              {onboarding.priceRange ? `선택한 가격대의 브랜드예요 · ` : ''}복수 선택 가능
            </Text>
            <View style={styles.grid}>
              {brandsForPriceRange.map((b) => (
                <PressableScale
                  key={b.id}
                  style={[styles.chip, onboarding.preferredBrands.includes(b.id) && styles.chipSelected]}
                  onPress={() => toggleOnboardingBrand(b.id)}
                  haptic="selection"
                  scaleTo={0.94}
                >
                  <Text style={[styles.chipText, onboarding.preferredBrands.includes(b.id) && styles.chipTextSelected]}>
                    {b.name}
                  </Text>
                  {b.isNiche && (
                    <Text style={[styles.nicheTag, onboarding.preferredBrands.includes(b.id) && styles.nicheTagSelected]}>
                      니치
                    </Text>
                  )}
                </PressableScale>
              ))}
            </View>
          </>
        )}

        {currentStep === 'scent' && (
          <>
            <Text style={styles.title}>나는 무슨 향을 좋아할까?</Text>
            <Text style={styles.subtitle}>선호하는 향 계열을 골라보세요 · 복수 선택 가능</Text>
            <View style={styles.grid}>
              {SCENT_TAGS.map((tag) => (
                <PressableScale
                  key={tag}
                  style={[styles.chip, onboarding.preferredScents.includes(tag) && styles.chipSelected]}
                  onPress={() => toggleOnboardingScent(tag)}
                  haptic="selection"
                  scaleTo={0.94}
                >
                  <Text style={[styles.chipText, onboarding.preferredScents.includes(tag) && styles.chipTextSelected]}>
                    {tag}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </>
        )}

        {currentStep === 'notes' && (
          <>
            <Text style={styles.title}>좋아하는 향 원료는?</Text>
            <Text style={styles.subtitle}>선호하는 소재를 골라보세요 · 복수 선택 가능</Text>
            <View style={styles.grid}>
              {NOTES.map((note) => (
                <PressableScale
                  key={note}
                  style={[styles.chip, onboarding.preferredNotes.includes(note) && styles.chipSelected]}
                  onPress={() => toggleOnboardingNote(note)}
                  haptic="selection"
                  scaleTo={0.94}
                >
                  <Text style={[styles.chipText, onboarding.preferredNotes.includes(note) && styles.chipTextSelected]}>
                    {note}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </>
        )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isLast ? '시작하기' : '다음'}
          icon="arrow-forward"
          iconRight
          onPress={handleNext}
          disabled={!canGoNext()}
        />
        <TouchableOpacity style={styles.skipTextBtn} onPress={goMain}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Tooltip Modal */}
      <Modal visible={tooltipVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setTooltipVisible(false)}>
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipTitle}>도움말</Text>
            <Text style={styles.tooltipText}>{TIPS[currentStep]}</Text>
            <TouchableOpacity style={styles.tooltipClose} onPress={() => setTooltipVisible(false)}>
              <Text style={styles.tooltipCloseText}>확인</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.sm },
  hidden: { opacity: 0 },
  progressWrap: { flex: 1, gap: 4 },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: { fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textSecondary, textAlign: 'right', minWidth: 32 },
  tipBtn: { padding: SPACING.sm },
  tipCircle: {
    width: 26, height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center', alignItems: 'center',
  },
  tipQ: { fontSize: FONT_SIZES.bodySm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray600 },
  content: { padding: SPACING.lg, paddingBottom: 140 },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: LINE_HEIGHTS.h1,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: LINE_HEIGHTS.body,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGET_MIN,
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  chipSelected: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  chipText: { fontSize: FONT_SIZES.body, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold },
  chipTextSelected: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  nicheTag: {
    fontSize: 9,
    color: COLORS.primaryInk,
    fontWeight: FONT_WEIGHTS.bold,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  nicheTagSelected: { color: COLORS.white, backgroundColor: 'rgba(255,255,255,0.25)' },
  listContainer: { gap: SPACING.sm },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: TOUCH_TARGET_MIN,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  listItemSelected: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.secondary },
  listItemText: {
    fontSize: FONT_SIZES.h4,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  listItemTextSelected: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHTS.bold },
  listItemDesc: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, lineHeight: LINE_HEIGHTS.small },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: BUTTON_HEIGHT.lg,
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.md,
  },
  nextButtonDisabled: { backgroundColor: COLORS.gray300 },
  nextButtonText: { color: COLORS.white, fontSize: FONT_SIZES.h4, fontWeight: FONT_WEIGHTS.bold },
  skipTextBtn: { alignItems: 'center', paddingVertical: SPACING.sm, minHeight: TOUCH_TARGET_MIN, justifyContent: 'center' },
  skipText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodySm },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  tooltipCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOW.lg,
  },
  tooltipTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tooltipText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.body,
    marginBottom: SPACING.lg,
  },
  tooltipClose: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm + 2,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipCloseText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body },
});
