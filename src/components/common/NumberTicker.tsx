import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface NumberTickerProps {
  value: number;
  style?: StyleProp<TextStyle>;
  // 자릿수 변화를 보고 싶을 때 — 기본은 자릿수만큼 슬롯 자동
  minDigits?: number;
  // 숫자 변화 애니메이션 지속시간 (ms)
  duration?: number;
}

/**
 * 토스 스타일 숫자 카운터.
 * 값 변경 시 각 자릿수 슬롯이 위/아래로 슬라이드하며 새 숫자로 전환.
 *
 * 사용 예: <NumberTicker value={wishlist.length} style={styles.count} />
 */
export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  style,
  minDigits = 1,
  duration = 360,
}) => {
  const safeValue = Math.max(0, Math.floor(value));
  const digits = padDigits(safeValue, minDigits);

  return (
    <View style={styles.row}>
      {digits.map((d, i) => (
        <DigitSlot key={`${digits.length - i}`} digit={d} style={style} duration={duration} />
      ))}
    </View>
  );
};

interface DigitSlotProps {
  digit: string;
  style?: StyleProp<TextStyle>;
  duration: number;
}

const DigitSlot: React.FC<DigitSlotProps> = ({ digit, style, duration }) => {
  const [height, setHeight] = useState(0);
  const targetIndex = isDigit(digit) ? parseInt(digit, 10) : 0;
  const offset = useSharedValue(targetIndex);

  useEffect(() => {
    if (!isDigit(digit)) return;
    offset.value = withTiming(targetIndex, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetIndex, duration, digit]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -offset.value * height }],
  }));

  // 숫자가 아닌 문자 (쉼표, 마이너스 등)는 정적으로 렌더
  if (!isDigit(digit)) {
    return <Text style={style}>{digit}</Text>;
  }

  // 첫 페인트: 단일 디지트로 line-height 측정. 측정 직후 컬럼 모드로 전환.
  if (height === 0) {
    return (
      <Text
        style={style}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        {digit}
      </Text>
    );
  }

  return (
    <View style={[styles.slot, { height }]}>
      <Animated.View style={animatedStyle}>
        {DIGITS.map((d) => (
          <Text key={d} style={style}>{d}</Text>
        ))}
      </Animated.View>
    </View>
  );
};

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function isDigit(s: string): boolean {
  return s.length === 1 && s >= '0' && s <= '9';
}

function padDigits(n: number, min: number): string[] {
  const str = String(n);
  if (str.length >= min) return str.split('');
  return ('0'.repeat(min - str.length) + str).split('');
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { overflow: 'hidden' },
});
