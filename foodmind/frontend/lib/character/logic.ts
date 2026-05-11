export type CharacterMood = "happy" | "warning" | "sad" | "neutral";

export interface CharItem {
  name:     string;
  daysLeft: number;
}

export interface CharacterState {
  mood:       CharacterMood;
  emoji:      string;  // 食材対応絵文字 or 表情絵文字
  moodEmoji:  string;  // 常に表情絵文字（リング色ヒント用）
  messages:   string[];
  urgentItem: CharItem | null;
}

const MOOD_EMOJI: Record<CharacterMood, string> = {
  happy:   "😆",
  warning: "😨",
  sad:     "🥲",
  neutral: "🙂",
};

// 食材名→絵文字マッピング
const FOOD_EMOJI_MAP: { words: string[]; emoji: string }[] = [
  { words: ["鶏", "チキン", "もも", "むね", "とり"],           emoji: "🐔" },
  { words: ["にんじん", "人参"],                               emoji: "🥕" },
  { words: ["トマト"],                                         emoji: "🍅" },
  { words: ["ブロッコリー"],                                   emoji: "🥦" },
  { words: ["たまご", "卵", "玉子"],                           emoji: "🥚" },
  { words: ["鮭", "さんま", "あじ", "まぐろ", "魚", "さかな"], emoji: "🐟" },
  { words: ["豚", "ポーク", "ぶた"],                           emoji: "🐷" },
  { words: ["牛", "ビーフ"],                                   emoji: "🐄" },
  { words: ["たまねぎ", "玉ねぎ"],                             emoji: "🧅" },
  { words: ["じゃがいも", "ポテト"],                           emoji: "🥔" },
  { words: ["キャベツ", "レタス"],                             emoji: "🥬" },
  { words: ["とうもろこし", "コーン"],                         emoji: "🌽" },
  { words: ["えび", "海老"],                                   emoji: "🦐" },
  { words: ["バナナ"],                                         emoji: "🍌" },
  { words: ["りんご", "リンゴ"],                               emoji: "🍎" },
  { words: ["牛乳", "ミルク"],                                 emoji: "🥛" },
  { words: ["なす", "ナス"],                                   emoji: "🍆" },
  { words: ["きゅうり", "キュウリ"],                           emoji: "🥒" },
  { words: ["ピーマン"],                                       emoji: "🫑" },
  { words: ["しいたけ", "きのこ"],                             emoji: "🍄" },
  { words: ["いちご", "苺"],                                   emoji: "🍓" },
  { words: ["さつまいも"],                                     emoji: "🍠" },
];

export function pickFoodEmoji(name: string): string | null {
  for (const { words, emoji } of FOOD_EMOJI_MAP) {
    if (words.some((w) => name.includes(w))) return emoji;
  }
  return null;
}

export function resolveCharacterState(items: CharItem[], fridgeScore: number): CharacterState {
  const moodEmoji = MOOD_EMOJI;

  if (items.length === 0) {
    return {
      mood:       "sad",
      emoji:      moodEmoji.sad,
      moodEmoji:  moodEmoji.sad,
      messages:   ["なにもないよ…買い物して🥲"],
      urgentItem: null,
    };
  }

  const urgent = items
    .filter((i) => i.daysLeft <= 2)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (urgent.length > 0) {
    const item = urgent[0];
    const foodEmoji = pickFoodEmoji(item.name) ?? moodEmoji.warning;
    return {
      mood:       "warning",
      emoji:      foodEmoji,
      moodEmoji:  moodEmoji.warning,
      messages:   [`${foodEmoji} ${item.name}が危ないよ〜！`, "早く使ってあげて！"],
      urgentItem: item,
    };
  }

  if (fridgeScore >= 80) {
    return {
      mood:       "happy",
      emoji:      moodEmoji.happy,
      moodEmoji:  moodEmoji.happy,
      messages:   ["完璧だね！冷蔵庫が輝いてる✨", "この調子で育てよう！"],
      urgentItem: null,
    };
  }

  return {
    mood:       "neutral",
    emoji:      moodEmoji.neutral,
    moodEmoji:  moodEmoji.neutral,
    messages:   ["いい感じに管理できてるよ"],
    urgentItem: null,
  };
}

export function calcXpDelta(items: CharItem[], fridgeScore: number): number {
  const hasExpired = items.some((i) => i.daysLeft <= 0);
  let xp = 0;
  if (hasExpired) xp -= 10;
  if (items.length > 0 && !hasExpired) xp += 10;
  if (fridgeScore >= 80) xp += 20;
  return xp;
}
