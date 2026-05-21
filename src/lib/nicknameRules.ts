/**
 * 닉네임 규칙 — 카카오·네이버·토스 등 한국 서비스 통용 기준을 종합:
 *   · 한글(완성형 가-힣): 2~10자
 *   · 영문(a-zA-Z) + 숫자(0-9): 2~16자
 *   · 혼합 시 한글이 한 글자라도 포함되면 더 엄격한 한글 기준 적용
 *   · 이모지, 특수문자, 공백, 자음·모음 단독(ㄱㅎㅏㅣ) 모두 불허
 *   · 30일에 한 번만 변경 가능
 *
 * 이 규칙들은 "한글 글자 폭이 영문보다 넓어서 표시 영역을 안정적으로 유지"
 * 한다는 디스플레이 안전성 + DB 컬럼 길이 안전성 두 가지를 동시에 만족시켜요.
 */

export const NICKNAME_RULES = {
  minLength: 2,
  koreanMax: 10,
  englishMax: 16,
  cooldownDays: 30,
} as const;

/** UI에 그대로 표시할 규칙 문구 — 한 군데에서 관리 */
export const NICKNAME_RULE_LINES = [
  `한글 ${NICKNAME_RULES.minLength}~${NICKNAME_RULES.koreanMax}자`,
  `영문 · 숫자 ${NICKNAME_RULES.minLength}~${NICKNAME_RULES.englishMax}자`,
  '이모지 · 특수문자 · 공백 사용 불가',
];

const ALLOWED_RE = /^[가-힣a-zA-Z0-9]+$/;
const HAS_KOREAN_RE = /[가-힣]/;

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateNickname(input: string): ValidationResult {
  if (!input || input.length === 0) {
    return { ok: false, reason: '닉네임을 입력해 주세요.' };
  }
  if (/\s/.test(input)) {
    return { ok: false, reason: '공백은 사용할 수 없어요.' };
  }
  if (!ALLOWED_RE.test(input)) {
    // 이모지·특수문자·미완성 한글(ㄱㅏ 등) 모두 여기서 걸려요.
    return { ok: false, reason: '이모지나 특수문자는 사용할 수 없어요.' };
  }
  // [...str].length는 코드 포인트 단위 길이 — surrogate pair 안전.
  const len = [...input].length;
  const hasKorean = HAS_KOREAN_RE.test(input);
  const max = hasKorean ? NICKNAME_RULES.koreanMax : NICKNAME_RULES.englishMax;
  if (len < NICKNAME_RULES.minLength) {
    return { ok: false, reason: `${NICKNAME_RULES.minLength}자 이상 입력해 주세요.` };
  }
  if (len > max) {
    return {
      ok: false,
      reason: hasKorean
        ? `한글 닉네임은 ${NICKNAME_RULES.koreanMax}자까지 가능해요.`
        : `영문·숫자 닉네임은 ${NICKNAME_RULES.englishMax}자까지 가능해요.`,
    };
  }
  return { ok: true };
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface CooldownStatus {
  canChange: boolean;
  daysRemaining: number;   // canChange=true면 0
  nextAvailableAt: Date | null;
}

export function getCooldownStatus(changedAtIso: string | null | undefined, now: Date = new Date()): CooldownStatus {
  if (!changedAtIso) {
    return { canChange: true, daysRemaining: 0, nextAvailableAt: null };
  }
  const last = new Date(changedAtIso);
  const next = new Date(last.getTime() + NICKNAME_RULES.cooldownDays * MS_PER_DAY);
  const diff = next.getTime() - now.getTime();
  if (diff <= 0) {
    return { canChange: true, daysRemaining: 0, nextAvailableAt: null };
  }
  return {
    canChange: false,
    daysRemaining: Math.ceil(diff / MS_PER_DAY),
    nextAvailableAt: next,
  };
}
