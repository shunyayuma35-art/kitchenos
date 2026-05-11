"use client";

import { useState, useEffect } from "react";
import type { FoodItem } from "@/lib/api";

// ── 食材名→絵文字 ──────────────────────────────────────────────
const FOOD_EMOJI_MAP: { words: string[]; emoji: string }[] = [
  { words: ["にんじん", "人参"],                                        emoji: "🥕" },
  { words: ["たまご", "卵", "玉子"],                                    emoji: "🥚" },
  { words: ["鮭", "さんま", "あじ", "まぐろ", "魚", "さかな", "タラ", "鱈", "切り身"], emoji: "🐟" },
  { words: ["ブロッコリー"],                                            emoji: "🥦" },
  { words: ["トマト"],                                                  emoji: "🍅" },
  { words: ["とうもろこし", "コーン"],                                  emoji: "🌽" },
  { words: ["たまねぎ", "玉ねぎ", "玉葱"],                             emoji: "🧅" },
  { words: ["バナナ"],                                                  emoji: "🍌" },
  { words: ["えび", "海老"],                                            emoji: "🦐" },
  { words: ["キャベツ", "レタス"],                                      emoji: "🥬" },
  { words: ["鶏", "チキン", "とり", "もも", "むね"],                   emoji: "🍗" },
  { words: ["豚", "ポーク", "ぶた"],                                    emoji: "🥩" },
  { words: ["牛", "ビーフ", "うし"],                                    emoji: "🥩" },
  { words: ["牛乳", "ミルク", "乳"],                                    emoji: "🥛" },
  { words: ["りんご", "リンゴ"],                                        emoji: "🍎" },
  { words: ["バター"],                                                  emoji: "🧈" },
  { words: ["しいたけ", "きのこ", "マッシュルーム", "えのき"],          emoji: "🍄" },
  { words: ["ねぎ", "ネギ", "長ねぎ"],                                  emoji: "🌿" },
  { words: ["いちご", "苺"],                                            emoji: "🍓" },
  { words: ["とうふ", "豆腐"],                                          emoji: "🫘" },
  { words: ["ごはん", "白米", "米"],                                    emoji: "🍚" },
  { words: ["ほうれん草", "ほうれんそう"],                              emoji: "🥬" },
  { words: ["じゃがいも", "ジャガイモ", "ポテト"],                      emoji: "🥔" },
  { words: ["なす", "ナス"],                                            emoji: "🍆" },
  { words: ["きゅうり", "キュウリ"],                                    emoji: "🥒" },
  { words: ["ピーマン"],                                                emoji: "🫑" },
  { words: ["さつまいも", "さつま芋"],                                  emoji: "🍠" },
];

function pickEmoji(name: string): string {
  for (const { words, emoji } of FOOD_EMOJI_MAP) {
    if (words.some((w) => name.includes(w))) return emoji;
  }
  return "🍽️";
}

// ── 状態→キャラ情報 ─────────────────────────────────────────────
type Mood = "urgent" | "warn" | "happy" | "lonely";

interface CharState {
  emoji:   string;
  message: string;
  mood:    Mood;
}

function resolveChar(
  urgentItems: FoodItem[],
  fridgeScore: number,
  allCount:    number
): CharState {
  if (allCount === 0) {
    return { emoji: "🛒", message: "食材がないよ〜 買いに行こう！", mood: "lonely" };
  }

  const critical = urgentItems.filter((i) => i.expiryDays <= 1);
  if (critical.length > 0) {
    const { name } = critical[0];
    return {
      emoji:   pickEmoji(name),
      message: `${name} が今日まで！今すぐ使って〜🔥`,
      mood:    "urgent",
    };
  }

  if (urgentItems.length > 0) {
    const { name, expiryDays } = urgentItems[0];
    return {
      emoji:   pickEmoji(name),
      message: `${name} があと${expiryDays}日！使ってあげて〜`,
      mood:    "warn",
    };
  }

  if (fridgeScore >= 85) {
    return { emoji: "🌟", message: "冷蔵庫スコア最高！よく使えてるね！", mood: "happy" };
  }
  if (fridgeScore < 50) {
    return { emoji: "😰", message: "冷蔵庫が心配だよ… 使い切ろう！", mood: "warn" };
  }

  const goodMessages = [
    "今日も料理がんばろう〜！🍳",
    "冷蔵庫のもの使い切れるかな？",
    "おいしいもの作れそう〜✨",
    "今日は何を作る？😋",
  ];
  return {
    emoji:   "😊",
    message: goodMessages[new Date().getDay() % goodMessages.length],
    mood:    "happy",
  };
}

// ── mood→スタイル ────────────────────────────────────────────────
const MOOD_CONFIG: Record<Mood, { bubble: string; ring: string; anim: string; tail: string }> = {
  urgent: {
    bubble: "bg-red-50 border-red-300 text-red-700",
    ring:   "ring-red-300 shadow-red-100",
    anim:   "animate-puru-puru",
    tail:   "bg-red-50 border-red-300",
  },
  warn: {
    bubble: "bg-amber-50 border-amber-300 text-amber-800",
    ring:   "ring-amber-300 shadow-amber-100",
    anim:   "animate-yura-yura",
    tail:   "bg-amber-50 border-amber-300",
  },
  happy: {
    bubble: "bg-white border-gray-200 text-gray-700",
    ring:   "ring-emerald-300 shadow-emerald-50",
    anim:   "animate-fuwa-fuwa",
    tail:   "bg-white border-gray-200",
  },
  lonely: {
    bubble: "bg-blue-50 border-blue-200 text-blue-700",
    ring:   "ring-blue-200 shadow-blue-50",
    anim:   "animate-pulse-soft",
    tail:   "bg-blue-50 border-blue-200",
  },
};

// ── コンポーネント ─────────────────────────────────────────────
interface Props {
  urgentItems: FoodItem[];
  fridgeScore: number;
  allCount:    number;
}

export default function CharacterOverlay({ urgentItems, fridgeScore, allCount }: Props) {
  const [cs, setCs]             = useState<CharState | null>(null);
  const [bubbleOn, setBubbleOn] = useState(true);

  const urgentKey = urgentItems.map((i) => `${i.id}:${i.expiryDays}`).join(",");

  useEffect(() => {
    const state = resolveChar(urgentItems, fridgeScore, allCount);
    setCs(state);
    setBubbleOn(true);
    const t = setTimeout(() => setBubbleOn(false), 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urgentKey, fridgeScore, allCount]);

  if (!cs) return null;

  const cfg = MOOD_CONFIG[cs.mood];

  return (
    <div className="fixed bottom-24 right-3 z-40 flex flex-col items-end gap-1.5 pointer-events-none select-none">
      {/* 吹き出し */}
      {bubbleOn && (
        <div
          className={`
            animate-fade-in pointer-events-auto
            relative max-w-[172px] px-3 py-2
            rounded-2xl border shadow-md text-xs font-medium leading-snug
            ${cfg.bubble}
          `}
        >
          {cs.message}
          {/* 吹き出しのしっぽ */}
          <span
            aria-hidden
            className={`absolute -bottom-[7px] right-5 block w-[13px] h-[13px] rotate-45 border-r border-b ${cfg.tail}`}
          />
        </div>
      )}

      {/* キャラクター（タップで吹き出し ON/OFF） */}
      <button
        className="pointer-events-auto focus:outline-none"
        onClick={() => setBubbleOn((v) => !v)}
        aria-label="キャラクターメッセージを表示"
      >
        <div
          className={`
            w-14 h-14 rounded-full bg-white
            flex items-center justify-center text-3xl
            shadow-lg ring-2 ${cfg.ring} ${cfg.anim}
          `}
        >
          {cs.emoji}
        </div>
      </button>
    </div>
  );
}
