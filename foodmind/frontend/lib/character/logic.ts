export type CharacterMood = "happy" | "warning" | "sad" | "neutral";

export interface CharItem {
  name:     string;
  daysLeft: number;
}

export interface CharacterState {
  mood:       CharacterMood;
  emoji:      string;
  messages:   string[];
  urgentItem: CharItem | null;
}

const EMOJI: Record<CharacterMood, string> = {
  happy:   "😆",
  warning: "😨",
  sad:     "🥲",
  neutral: "🙂",
};

export function resolveCharacterState(items: CharItem[], fridgeScore: number): CharacterState {
  if (items.length === 0) {
    return {
      mood:       "sad",
      emoji:      EMOJI.sad,
      messages:   ["なにもないよ…買い物して🥲"],
      urgentItem: null,
    };
  }

  const urgent = items
    .filter((i) => i.daysLeft <= 2)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (urgent.length > 0) {
    const item = urgent[0];
    return {
      mood:       "warning",
      emoji:      EMOJI.warning,
      messages:   [`⚠️ ${item.name}が危ないよ！`, "早く使ってあげて！"],
      urgentItem: item,
    };
  }

  if (fridgeScore >= 80) {
    return {
      mood:       "happy",
      emoji:      EMOJI.happy,
      messages:   ["完璧だね！冷蔵庫が輝いてる✨", "この調子で育てよう！"],
      urgentItem: null,
    };
  }

  return {
    mood:       "neutral",
    emoji:      EMOJI.neutral,
    messages:   ["いい感じに管理できてるよ"],
    urgentItem: null,
  };
}

// XP delta per state snapshot:
//   +20 fridgeScore >= 80
//   +10 items exist with no expired
//   -10 any item expired (daysLeft <= 0)
export function calcXpDelta(items: CharItem[], fridgeScore: number): number {
  const hasExpired = items.some((i) => i.daysLeft <= 0);
  let xp = 0;
  if (hasExpired) xp -= 10;
  if (items.length > 0 && !hasExpired) xp += 10;
  if (fridgeScore >= 80) xp += 20;
  return xp;
}
