import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

const CALENDAR_TITLE = '맡다. 향수 다이어리';
const CALENDAR_COLOR = '#6FB88F';

/**
 * 캘린더 쓰기 권한 요청. 거부 시 false.
 * iOS 17+는 write-only 권한도 허용.
 */
export async function requestCalendarAccess(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

/**
 * '맡다.' 전용 캘린더를 찾거나 새로 만들어 ID 반환.
 * - iOS: 기본 소스(보통 iCloud → 로컬 폴백)에 생성
 * - Android: 기존 calendars 중 isPrimary 또는 가장 권한 높은 것에 연결
 */
async function getOrCreateScentoryCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  const existing = calendars.find((c) => c.title === CALENDAR_TITLE);
  if (existing) return existing.id;

  if (Platform.OS === 'ios') {
    let source =
      calendars.find((c) => c.source?.name === 'iCloud')?.source ??
      calendars[0]?.source;
    if (!source) {
      // 시뮬레이터 등에서 캘린더가 하나도 없을 때 로컬 소스 폴백
      source = { isLocalAccount: true, name: 'Default', type: 'LOCAL' } as Calendar.Source;
    }
    return Calendar.createCalendarAsync({
      title: CALENDAR_TITLE,
      color: CALENDAR_COLOR,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source.id,
      source,
      name: 'matda-diary',
      ownerAccount: 'matda',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
  }

  // Android: 새 ACCOUNT_TYPE_LOCAL 캘린더 생성
  return Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: CALENDAR_COLOR,
    entityType: Calendar.EntityTypes.EVENT,
    name: 'matda-diary',
    ownerAccount: 'matda',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

export interface AddDiaryEventInput {
  dateKey: string;         // YYYY-MM-DD
  perfumeName: string;
  brandName?: string;
  rating: number;          // 0–5
  note: string;
  existingEventId?: string;
}

/**
 * 향수 다이어리 이벤트를 시스템 캘린더에 추가/수정.
 * - 종일(all-day) 이벤트
 * - 제목: `[브랜드] 향수명` 또는 `향수명`
 * - 노트: `★★★☆☆\n\n{일기}`
 * 반환: 이벤트 ID (실패 시 null)
 */
export async function addOrUpdateDiaryEvent(
  input: AddDiaryEventInput,
): Promise<string | null> {
  const granted = await requestCalendarAccess();
  if (!granted) return null;

  const calendarId = await getOrCreateScentoryCalendarId();
  if (!calendarId) return null;

  const [y, m, d] = input.dateKey.split('-').map(Number);
  const startDate = new Date(y, m - 1, d, 0, 0, 0);
  const endDate = new Date(y, m - 1, d, 23, 59, 0);

  const title = input.brandName
    ? `${input.brandName} ${input.perfumeName}`
    : input.perfumeName;

  const stars =
    '★'.repeat(Math.max(0, Math.min(5, input.rating))) +
    '☆'.repeat(Math.max(0, 5 - input.rating));
  const notes = input.note ? `${stars}\n\n${input.note}` : stars;

  const details: Partial<Calendar.Event> = {
    title,
    startDate,
    endDate,
    allDay: true,
    notes,
    // iOS는 url, Android는 description으로 fallback
    ...(Platform.OS === 'android' ? { description: notes } : {}),
  };

  try {
    if (input.existingEventId) {
      await Calendar.updateEventAsync(input.existingEventId, details);
      return input.existingEventId;
    }
    return await Calendar.createEventAsync(calendarId, details);
  } catch {
    return null;
  }
}

export async function deleteDiaryEvent(eventId: string): Promise<boolean> {
  const granted = await requestCalendarAccess();
  if (!granted) return false;
  try {
    await Calendar.deleteEventAsync(eventId);
    return true;
  } catch {
    return false;
  }
}
