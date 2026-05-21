import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';
import { ImageViewer } from './ImageViewer';

interface ReviewImagesProps {
  images: string[];
  // 카드 내부 가로 가용 폭 (좌우 padding 제외). 미지정 시 화면 너비에서 추정.
  contentWidth?: number;
  // 카드 내부 좌우 패딩(인셋). 기본 0
  horizontalInset?: number;
}

const GAP = 6;

/**
 * 한줄평 첨부 이미지 그리드.
 * - 1장: 풀폭 16:10 가로 비율
 * - 2장: 1:1 가로 2등분
 * - 3장 이상: 1:1 가로 3등분 (4장째부터는 마지막 셀에 "+N" 오버레이)
 * - 탭 시 풀스크린 ImageViewer 오픈
 */
export const ReviewImages: React.FC<ReviewImagesProps> = ({
  images,
  contentWidth,
  horizontalInset = 0,
}) => {
  const { width: screenW } = useWindowDimensions();
  const [viewer, setViewer] = useState<{ visible: boolean; index: number }>({
    visible: false,
    index: 0,
  });

  if (!images || images.length === 0) return null;

  // 가용 폭 결정
  const availW = (contentWidth ?? screenW) - horizontalInset * 2;

  // 보일 셀 개수 (4장 이상은 첫 3장만 보이고 마지막 셀에 +N 표시)
  const visible = images.slice(0, 3);
  const overflow = Math.max(0, images.length - 3);

  // 셀 크기 계산
  const open = (i: number) => setViewer({ visible: true, index: i });
  const close = () => setViewer((v) => ({ ...v, visible: false }));

  let cells: { uri: string; w: number; h: number; idx: number; plus?: number }[];
  if (images.length === 1) {
    const w = availW;
    const h = Math.round(w * 0.62);
    cells = [{ uri: visible[0], w, h, idx: 0 }];
  } else if (images.length === 2) {
    const w = Math.floor((availW - GAP) / 2);
    cells = [
      { uri: visible[0], w, h: w, idx: 0 },
      { uri: visible[1], w, h: w, idx: 1 },
    ];
  } else {
    const w = Math.floor((availW - GAP * 2) / 3);
    cells = visible.map((uri, i) => ({ uri, w, h: w, idx: i }));
    if (overflow > 0) {
      cells[2] = { ...cells[2], plus: overflow };
    }
  }

  return (
    <>
      <View style={styles.row}>
        {cells.map((c, i) => (
          <Pressable
            key={c.uri + i}
            onPress={() => open(c.idx)}
            style={({ pressed }) => [
              styles.cellWrap,
              { width: c.w, height: c.h, marginLeft: i === 0 ? 0 : GAP },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Image source={{ uri: c.uri }} style={styles.image} />
            {c.plus ? (
              <View style={styles.plusOverlay} pointerEvents="none">
                <Text style={styles.plusText}>+{c.plus}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
      <ImageViewer
        visible={viewer.visible}
        images={images}
        initialIndex={viewer.index}
        onClose={close}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cellWrap: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.gray100,
  },
  image: { width: '100%', height: '100%' },
  plusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBox: { paddingHorizontal: 10, paddingVertical: 6 },
  plusText: { color: COLORS.white, fontSize: 18, fontWeight: '900' },
});
