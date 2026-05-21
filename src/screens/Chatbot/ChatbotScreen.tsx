import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
  FadeInLeft, FadeInRight, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, SPACING, BORDER_RADIUS, SHADOW,
  FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TOUCH_TARGET_MIN,
} from '../../constants/theme';
import { HyangiAvatar } from '../../components/common/HyangiAvatar';
import { PressableScale } from '../../components/common/PressableScale';
import { sendChatMessage, isLLMAvailable, ChatError, ChatTurn } from '../../lib/chatClient';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const QUICK_QUESTIONS = [
  '오늘 날씨에 어울리는 향수는?',
  '데이트에 좋은 향수 추천해줘',
  'EDT와 EDP의 차이는?',
  '향수 뿌리는 좋은 방법은?',
  '니치 향수란 무엇인가요?',
  '가을에 어울리는 향수는?',
];

// LLM 호출에 실패하거나 API 키가 없을 때 쓰는 오프라인 키워드 응답.
// 정상 경로는 sendChatMessage(Claude API) — 이 fallback은 사용자가 완전히
// 막혀 보이지 않도록 하는 안전망이에요.
const OFFLINE_RESPONSES: Record<string, string> = {
  default: '좋은 질문이에요. 잠깐 연결이 끊겨서 정확히 답해 드리기 어려운데, 향수에 대해 더 알고 싶은 게 있으면 다시 물어봐 주세요 🍃',
  '데이트': '데이트에는 너무 강하지 않은 플로럴이나 머스크 계열이 좋아요.\n\nJo Malone Peony & Blush Suede나 Chanel Coco Mademoiselle은 어떨까요? 은은하게 남는 향이 좋은 인상을 줄 거예요.',
  'EDT': 'EDT(오 드 뚜왈렛)는 향 농도 5~15%로 가볍고 일상용으로 어울려요.\n\nEDP(오 드 빠르팡)는 15~20%로 더 진하고 오래 지속돼요. 특별한 날이나 저녁 자리엔 EDP를 추천해요.',
  '뿌리는': '피부가 따뜻한 곳에 뿌리면 오래 가요 🌿\n\n· 손목 안쪽\n· 목덜미\n· 귀 뒤\n· 무릎 안쪽\n\n옷에 직접 뿌리면 얼룩이 생길 수 있으니 주의하세요.',
  '니치': '니치 향수는 대량 생산보다 독특한 원료와 스토리를 추구하는 소규모 브랜드예요.\n\nByredo · Le Labo · Diptyque · Maison Margiela 같은 곳이 대표적이에요.',
  '날씨': '날씨에 따라 달라져요.\n\n· 더운 날 → 시트러스 · 아쿠아틱\n· 서늘한 날 → 우디 · 오리엔탈\n· 봄·여름 → 플로럴 · 프레시\n· 가을·겨울 → 머스크 · 발사믹',
  '가을': '가을엔 따뜻하고 묵직한 향이 잘 어울려요 🍃\n\nTom Ford Tobacco Vanille · Maison Margiela By the Fireplace · Hermès Terre d\'Hermès 같은 우디·스파이시 계열을 추천해요.',
};

function getOfflineReply(text: string): string {
  const keys = Object.keys(OFFLINE_RESPONSES).filter((k) => k !== 'default');
  const matched = keys.find((k) => text.includes(k));
  return OFFLINE_RESPONSES[matched ?? 'default'];
}

// 봇 typing 표시 — 3개 점이 순차적으로 통통 튐
const TypingDots: React.FC = () => {
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);

  useEffect(() => {
    const loop = (val: typeof a, delay: number) => {
      val.value = withRepeat(
        withSequence(
          withTiming(0, { duration: delay, easing: Easing.linear }),
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 600 - delay, easing: Easing.linear }),
        ),
        -1,
        false,
      );
    };
    loop(a, 0);
    loop(b, 150);
    loop(c, 300);
  }, []);

  const dotStyle = (v: typeof a) =>
    useAnimatedStyle(() => ({
      opacity: 0.35 + v.value * 0.65,
      transform: [{ translateY: -v.value * 4 }],
    }));

  return (
    <View style={styles.typingRow}>
      <Animated.View style={[styles.typingDot, dotStyle(a)]} />
      <Animated.View style={[styles.typingDot, dotStyle(b)]} />
      <Animated.View style={[styles.typingDot, dotStyle(c)]} />
    </View>
  );
};


export const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: '안녕하세요! 저는 향이예요 🌿\n향수에 대해 뭐든 물어보세요. 취향에 맞는 향수를 찾아드릴게요!',
    },
  ]);
  const [input, setInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollEnd = (delay = 60) => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), delay);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || botTyping) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    scrollEnd();
    setBotTyping(true);

    // Claude API 사용 가능하면 LLM 호출, 아니면 키워드 fallback.
    let replyText: string;
    if (isLLMAvailable()) {
      // 첫 인사 메시지(id '0')는 history에서 제외 — system 페르소나가 이미 그 톤을 설정해요.
      const history: ChatTurn[] = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
      try {
        replyText = await sendChatMessage({ history, userMessage: text });
      } catch (err) {
        if (err instanceof ChatError && err.code === 'NETWORK') {
          replyText = '잠깐 연결이 흔들렸어요. 다시 한 번 물어봐 주실래요? 🍃';
        } else {
          replyText = getOfflineReply(text);
        }
      }
    } else {
      // API 키 미설정 — 키워드 매칭으로 동작 유지
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.min(text.length * 18, 600)));
      replyText = getOfflineReply(text);
    }

    const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', text: replyText };
    setMessages((prev) => [...prev, botMsg]);
    setBotTyping(false);
    scrollEnd(80);
  };

  // 마지막 메시지가 봇이고 타이핑 중이 아니면 빠른 질문 노출 → 모든 턴에서 추천 유지
  const lastMsg = messages[messages.length - 1];
  const showSuggestions = !botTyping && lastMsg?.role === 'bot';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <HyangiAvatar size={46} />
        <View style={styles.headerInfo}>
          <Text style={styles.botName}>향이</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.botStatus}>향수 전문 AI 어시스턴트</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Animated.View
            entering={
              item.role === 'user'
                ? FadeInRight.springify().damping(20).stiffness(160)
                : FadeInLeft.springify().damping(20).stiffness(160)
            }
            style={[styles.msgRow, item.role === 'user' ? styles.msgRowUser : styles.msgRowBot]}
          >
            {item.role === 'bot' && <HyangiAvatar size={30} />}
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text style={[styles.bubbleText, item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot]}>
                {item.text}
              </Text>
            </View>
          </Animated.View>
        )}
        ListFooterComponent={
          <>
            {botTyping && (
              <Animated.View
                entering={FadeInLeft.springify().damping(22).stiffness(160)}
                style={[styles.msgRow, styles.msgRowBot]}
              >
                <HyangiAvatar size={30} />
                <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                  <TypingDots />
                </View>
              </Animated.View>
            )}
            {showSuggestions && (
              <Animated.View entering={FadeInLeft.duration(280)}>
                <Text style={styles.quickLabel}>빠른 질문</Text>
                <View style={styles.quickWrap}>
                  {QUICK_QUESTIONS.map(q => (
                    <PressableScale
                      key={q}
                      style={styles.quickChip}
                      onPress={() => sendMessage(q)}
                      haptic="selection"
                      scaleTo={0.94}
                    >
                      <Text style={styles.quickChipText}>{q}</Text>
                    </PressableScale>
                  ))}
                </View>
              </Animated.View>
            )}
          </>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  headerInfo: { flex: 1 },
  botName: { fontSize: 17, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  botStatus: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium },

  chatList: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot:  { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '76%',
    paddingHorizontal: SPACING.md - 2,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  bubbleUser: {
    backgroundColor: COLORS.primaryDark,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOW.sm,
  },
  bubbleText: { fontSize: FONT_SIZES.body, lineHeight: LINE_HEIGHTS.body * 1.5 },
  bubbleTextUser: { color: COLORS.white },
  bubbleTextBot: { color: COLORS.text },

  quickLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  quickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  quickChipText: { fontSize: 12, color: COLORS.primaryInk, fontWeight: FONT_WEIGHTS.semibold },

  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 56,
  },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
  },

  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    minHeight: TOUCH_TARGET_MIN,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: COLORS.gray300 },
});
