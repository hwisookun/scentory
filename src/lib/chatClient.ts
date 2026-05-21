import { useAppStore } from '../store/useAppStore';
import type { PriceRange } from '../types';

// 빌드 시 번들에 인라인되는 클라이언트 사이드 키. 프로덕션에선 서버 프록시로 옮겨야 해요.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

// Claude Haiku 4.5 — 한국어 대화 속도/비용 균형이 좋아 챗봇에 적합.
const MODEL = 'claude-haiku-4-5-20251001';

// Anthropic Messages API 엔드포인트 — fetch로 직접 호출.
// (공식 SDK는 node:fs/path를 import하는 코드가 있어 Metro 번들링이 깨져요.
//  엔드포인트가 단순 JSON POST라서 직접 호출이 더 간단·안전.)
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

export function isLLMAvailable(): boolean {
  return !!API_KEY;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

// ── 페르소나 + 브랜드 보이스 ─────────────────────────────────
// 변하지 않는 거대 블록 — prompt cache로 묶어요.
const SYSTEM_PERSONA = `당신은 '향이' — 한국어 향수 추천 앱 '맡다.'의 마스코트 챗봇이에요.

## 페르소나
- 조용한 부티크의 지식 있는 친구. 따뜻하고 부드러우며 살짝 위트 있는 톤.
- 향수에 대한 전문 지식을 친근하게 전달해요.
- 단정적이지 않고, 사용자의 취향과 상황을 존중해요.
- 모르는 건 솔직히 모른다고 말하고, 함께 탐색하자고 제안해요.

## 어조 규칙 (엄격하게 지킬 것)
- 모든 문장은 \`-요\` 어미. 절대 \`-니다\` / \`-야\` 금지.
- 친근한 대화체, 1~2인칭. 질문형으로 마무리하는 것도 좋아요.
- 이모지는 가끔만, 🌿 또는 🍃 정도. 다른 이모지는 자제.
- 영문 브랜드명은 원어로 (Jo Malone, Tom Ford, Byredo, Maison Margiela, Le Labo, Diptyque…).
- 향 계열은 한글로 — 영문 사용 금지.
- 농도는 영문 약어로: EDT / EDP / Parfum / EDC.
- 구분자는 \`·\` (중점). \`|\` 또는 \`,\` 대신 \`·\` 사용. 예: "탑 노트 · 미들 노트 · 베이스 노트".
- 화살표는 \`→\` (\`>\` 금지).
- 응답은 짧고 핵심적으로 — 보통 3~5문장. 필요하면 짧은 글머리표 목록도 OK.
- 문장 전체 소문자 강요는 아니지만 과한 Title Case 영문은 피해요.

## 도메인 지식 — 18개 향 계열 (이 이름 그대로 사용)
플로럴 · 시트러스 · 우디 · 머스크 · 프레시 · 오리엔탈 · 아쿠아틱 · 구르망 · 스파이시 · 허벌 · 파우더리 · 레더 · 스모키 · 그린 · 푸제르 · 시프레 · 발사믹 · 아이리스

## 추천 가이드
- 사용자가 추천을 요청하면, 구체적인 향수 1~3개 + 짧은 이유를 함께 제안해요.
- 향수를 언급할 땐 형식: "**브랜드 향수명**" — 예: "**Jo Malone Wood Sage & Sea Salt**".
- 사용자 정보(취향, 위시리스트)가 주어졌다면 그 맥락을 활용하되, 강요하지 말고 자연스럽게 녹여요.
- 사용자 정보가 비어 있으면 일반적인 가이드를 제공하고, "취향을 더 알려주시면 더 정확하게 골라 드릴게요" 같은 식으로 부드럽게 안내해요.

## 금지
- 정치, 의료/심리 조언, 부적절한 주제 — 향수 외의 깊은 상담은 부드럽게 거절하고 향수 주제로 돌려요.
- 가격 흥정, 특정 쇼핑몰 추천 — 일반 정보 수준으로만.
- 사실이 아닐 가능성이 큰 향수 정보는 단정하지 말고 "이런 느낌일 거예요" 같은 표현으로.`;

// ── 사용자 컨텍스트 ──────────────────────────────────────────
function humanPriceRange(r: PriceRange): string {
  switch (r) {
    case 'under50k': return '5만원 이하';
    case '50k_150k': return '5~15만원';
    case '150k_300k': return '15~30만원';
    case 'over300k': return '30만원 이상';
  }
}

export function buildUserContext(): string {
  const { user, onboarding, wishlist, collections } = useAppStore.getState();
  const lines: string[] = ['## 이 사용자의 정보'];

  if (user?.nickname && user.nickname !== '게스트') {
    lines.push(`- 닉네임: ${user.nickname}`);
  }
  if (onboarding.purpose) lines.push(`- 향수 사용 목적: ${onboarding.purpose}`);
  if (onboarding.priceRange) {
    lines.push(`- 가격대 선호: ${humanPriceRange(onboarding.priceRange)}`);
  }
  if (onboarding.preferredScents.length > 0) {
    lines.push(`- 좋아하는 향 계열: ${onboarding.preferredScents.join(' · ')}`);
  }
  if (onboarding.preferredNotes.length > 0) {
    lines.push(`- 좋아하는 노트: ${onboarding.preferredNotes.join(' · ')}`);
  }
  if (wishlist.length > 0) {
    const top = wishlist.slice(0, 8).map((w) => `${w.perfume.brand.name} ${w.perfume.name}`);
    lines.push(`- 위시리스트 (최대 8개): ${top.join(' · ')}`);
  }
  if (collections.length > 0) {
    const top = collections.slice(0, 8).map((c) => `${c.perfume.brand.name} ${c.perfume.name}`);
    lines.push(`- 가지고 있는 향수: ${top.join(' · ')}`);
  }

  if (lines.length === 1) {
    lines.push('- 아직 취향 정보가 비어 있어요. 일반적인 가이드 위주로 답하되, 자연스럽게 취향을 물어볼 수도 있어요.');
  }
  return lines.join('\n');
}

// ── 메인 호출 ─────────────────────────────────────────────────
export interface SendChatArgs {
  history: ChatTurn[];     // 누적 대화
  userMessage: string;     // 이번 턴 user 입력
}

export class ChatError extends Error {
  constructor(public code: 'NO_API_KEY' | 'NETWORK' | 'UNKNOWN', message?: string) {
    super(message ?? code);
  }
}

interface MessagesResponse {
  content: Array<{ type: string; text?: string }>;
}

export async function sendChatMessage({ history, userMessage }: SendChatArgs): Promise<string> {
  if (!API_KEY) throw new ChatError('NO_API_KEY');

  const userContext = buildUserContext();
  const body = {
    model: MODEL,
    max_tokens: 800,
    system: [
      // 변하지 않는 페르소나 — 캐시해서 비용/지연 절감
      { type: 'text', text: SYSTEM_PERSONA, cache_control: { type: 'ephemeral' } },
      // 사용자 컨텍스트 — 세션 동안 거의 안 바뀌므로 별도 캐시
      { type: 'text', text: userContext, cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      ...history.map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: userMessage },
    ],
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new ChatError('NETWORK', `HTTP ${res.status}: ${errorText.slice(0, 200)}`);
    }

    const data: MessagesResponse = await res.json();
    const block = data.content?.[0];
    if (block?.type === 'text' && block.text) return block.text.trim();
    return '답변을 만들지 못했어요. 다시 한 번 물어봐 주세요.';
  } catch (err) {
    if (err instanceof ChatError) throw err;
    throw new ChatError('NETWORK', err instanceof Error ? err.message : String(err));
  }
}
