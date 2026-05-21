import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Perfume } from '../../types';

const TAG_GRADIENTS: Record<string, [string, string]> = {
  '플로럴':  ['#FDDDE6', '#F0A0C0'],
  '시트러스': ['#FFF9C4', '#FFD54F'],
  '우디':    ['#D7C4A8', '#8D6440'],
  '머스크':  ['#E8D5F5', '#B07BD0'],
  '프레시':  ['#C8EEF8', '#42B8DC'],
  '오리엔탈': ['#FFD9B0', '#E87A40'],
  '아쿠아틱': ['#A8E0FF', '#1890C8'],
  '구르망':  ['#FFE5B0', '#F4A026'],
  '스파이시': ['#FFCBA0', '#DC5020'],
  '허벌':   ['#C0EAC0', '#3A9A40'],
  '파우더리': ['#F8D8E8', '#D84080'],
  '레더':   ['#CCC0B0', '#706050'],
  '스모키':  ['#C8D4DA', '#506070'],
  '그린':   ['#C0E8A0', '#407830'],
  '푸제르':  ['#B8D8F8', '#1050A0'],
  '시프레':  ['#E8F0B0', '#708010'],
  '발사믹':  ['#FFD8A0', '#C04808'],
  '아이리스': ['#E0D4F8', '#4818A0'],
};
const DEFAULT_GRADIENT: [string, string] = ['#EBF7F1', '#5E9E82'];

interface PerfumeImageProps {
  perfume: Perfume;
  /** 부모 컨테이너를 채우도록 flex:1 사용 (기본값). 명시적 크기가 필요하면 override */
  style?: object;
}

export const PerfumeImage: React.FC<PerfumeImageProps> = React.memo(({ perfume, style }) => {
  const [failed, setFailed] = useState(false);
  const gradient = TAG_GRADIENTS[perfume.tags[0]] ?? DEFAULT_GRADIENT;

  if (perfume.image_url && !failed) {
    return (
      <Image
        source={{ uri: perfume.image_url }}
        // flex:1 → 부모 View의 height/width를 꽉 채움
        // resizeMode cover → 비율 유지하며 잘라냄 (squish 없음)
        style={[{ flex: 1, width: '100%' }, style]}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <LinearGradient colors={gradient} style={[{ flex: 1 }, style]}>
      <View style={styles.inner}>
        <Text style={styles.brandLabel} numberOfLines={1}>
          {perfume.brand.name.toUpperCase()}
        </Text>
        <Text style={styles.initial}>{perfume.name.charAt(0)}</Text>
      </View>
    </LinearGradient>
  );
});
PerfumeImage.displayName = 'PerfumeImage';

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  brandLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(0,0,0,0.3)', letterSpacing: 1.5 },
  initial: { fontSize: 48, fontWeight: '900', color: 'rgba(0,0,0,0.15)', lineHeight: 56 },
});
