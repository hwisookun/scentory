import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const TEN_MB = 10 * 1024 * 1024;

interface PickImagesOptions {
  maxImages: number;
  currentCount: number;
  maxSizeBytes?: number; // 기본 10MB
}

/**
 * 권한 요청 + 갤러리 열기 + 사이즈 검증을 한 번에 처리.
 * iOS: Photos 권한 / Android: Media Library 권한
 * 한도 초과/거부 등은 내부에서 Alert 처리.
 * @returns 선택된 이미지 URI 배열 (취소·실패 시 빈 배열)
 */
export async function pickImages({
  maxImages,
  currentCount,
  maxSizeBytes = TEN_MB,
}: PickImagesOptions): Promise<string[]> {
  // 한도 체크
  if (currentCount >= maxImages) {
    Alert.alert('최대 첨부 한도', `사진은 최대 ${maxImages}장까지 첨부할 수 있어요.`);
    return [];
  }

  // 권한 요청
  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    const label = Platform.OS === 'ios' ? '사진' : '갤러리';
    if (!canAskAgain) {
      Alert.alert(
        `${label} 접근이 차단됐어요`,
        '설정에서 권한을 허용해주세요.',
        [
          { text: '닫기', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(`${label} 접근 권한이 필요해요`);
    }
    return [];
  }

  // 갤러리 열기
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: maxImages - currentCount,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return [];

  // 10MB 사이즈 필터 — 초과 항목은 제외하고 사용자에게 알림
  const accepted: string[] = [];
  const rejected: string[] = [];
  for (const asset of result.assets) {
    const size = asset.fileSize ?? 0;
    if (size > 0 && size > maxSizeBytes) {
      rejected.push(asset.fileName ?? '이미지');
    } else {
      accepted.push(asset.uri);
    }
  }

  if (rejected.length > 0) {
    const mb = Math.round(maxSizeBytes / 1024 / 1024);
    Alert.alert(
      `${mb}MB를 초과한 사진이 있어요`,
      `${rejected.length}장의 사진이 너무 커서 제외됐어요. ${mb}MB 이하의 사진만 첨부할 수 있어요.`,
    );
  }

  return accepted.slice(0, maxImages - currentCount);
}
