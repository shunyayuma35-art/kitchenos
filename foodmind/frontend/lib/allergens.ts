export type AllergenKey =
  | "shrimp" | "crab" | "walnut" | "wheat" | "buckwheat"
  | "egg" | "dairy" | "peanut" | "macadamia" | "cashew"
  | "almond" | "abalone" | "squid" | "salmon_roe" | "orange"
  | "kiwi" | "beef" | "sesame" | "salmon" | "mackerel"
  | "soy" | "chicken" | "banana" | "pork" | "peach"
  | "yam" | "apple" | "gelatin";

export interface Allergen {
  key: AllergenKey;
  name: string;
  emoji: string;
  mandatory: boolean;
}

export const ALLERGENS: Allergen[] = [
  // ── 義務付け（10品目）──────────────────────────
  { key: "shrimp",    name: "えび",           emoji: "🦐", mandatory: true  },
  { key: "crab",      name: "かに",           emoji: "🦀", mandatory: true  },
  { key: "walnut",    name: "くるみ",         emoji: "🌰", mandatory: true  },
  { key: "wheat",     name: "小麦",           emoji: "🌾", mandatory: true  },
  { key: "buckwheat", name: "そば",           emoji: "🍜", mandatory: true  },
  { key: "egg",       name: "卵",             emoji: "🥚", mandatory: true  },
  { key: "dairy",     name: "乳",             emoji: "🥛", mandatory: true  },
  { key: "peanut",    name: "落花生",         emoji: "🥜", mandatory: true  },
  { key: "macadamia", name: "マカダミアナッツ", emoji: "🫘", mandatory: true  },
  { key: "cashew",    name: "カシューナッツ",  emoji: "🫘", mandatory: true  },
  // ── 推奨（18品目）──────────────────────────────
  { key: "almond",    name: "アーモンド",     emoji: "🌰", mandatory: false },
  { key: "abalone",   name: "あわび",         emoji: "🦪", mandatory: false },
  { key: "squid",     name: "いか",           emoji: "🦑", mandatory: false },
  { key: "salmon_roe",name: "いくら",         emoji: "🍣", mandatory: false },
  { key: "orange",    name: "オレンジ",       emoji: "🍊", mandatory: false },
  { key: "kiwi",      name: "キウイフルーツ", emoji: "🥝", mandatory: false },
  { key: "beef",      name: "牛肉",           emoji: "🐄", mandatory: false },
  { key: "sesame",    name: "ごま",           emoji: "🫘", mandatory: false },
  { key: "salmon",    name: "さけ",           emoji: "🐟", mandatory: false },
  { key: "mackerel",  name: "さば",           emoji: "🐟", mandatory: false },
  { key: "soy",       name: "大豆",           emoji: "🫘", mandatory: false },
  { key: "chicken",   name: "鶏肉",           emoji: "🐔", mandatory: false },
  { key: "banana",    name: "バナナ",         emoji: "🍌", mandatory: false },
  { key: "pork",      name: "豚肉",           emoji: "🐷", mandatory: false },
  { key: "peach",     name: "もも",           emoji: "🍑", mandatory: false },
  { key: "yam",       name: "やまいも",       emoji: "🍠", mandatory: false },
  { key: "apple",     name: "りんご",         emoji: "🍎", mandatory: false },
  { key: "gelatin",   name: "ゼラチン",       emoji: "🧊", mandatory: false },
];

export const MANDATORY_ALLERGENS = ALLERGENS.filter((a) => a.mandatory);
export const RECOMMENDED_ALLERGENS = ALLERGENS.filter((a) => !a.mandatory);

// 食材名 → 含まれるアレルゲンキー
export const ALLERGEN_FOOD_MAP: Partial<Record<string, AllergenKey[]>> = {
  // 義務付け
  "えび":             ["shrimp"],
  "バナメイえび":     ["shrimp"],
  "かに":             ["crab"],
  "かに缶":           ["crab"],
  "くるみ":           ["walnut"],
  "小麦粉":           ["wheat"],
  "強力粉":           ["wheat"],
  "薄力粉":           ["wheat"],
  "パン粉":           ["wheat"],
  "そば":             ["buckwheat"],
  "卵":               ["egg"],
  "牛乳":             ["dairy"],
  "バター":           ["dairy"],
  "チーズ":           ["dairy"],
  "生クリーム":       ["dairy"],
  "ヨーグルト":       ["dairy"],
  "粉チーズ":         ["dairy"],
  "落花生":           ["peanut"],
  "ピーナッツバター": ["peanut"],
  "マカダミアナッツ": ["macadamia"],
  "カシューナッツ":   ["cashew"],
  // 推奨
  "アーモンド":       ["almond"],
  "あわび":           ["abalone"],
  "いか":             ["squid"],
  "いくら":           ["salmon_roe"],
  "オレンジ":         ["orange"],
  "キウイフルーツ":   ["kiwi"],
  "牛肉":             ["beef"],
  "ごま":             ["sesame"],
  "ごま油":           ["sesame"],
  "練りごま":         ["sesame"],
  "さけ":             ["salmon"],
  "さけ缶":           ["salmon"],
  "鮭フレーク":       ["salmon"],
  "さば":             ["mackerel"],
  "さば缶（水煮）":   ["mackerel"],
  "さば缶（みそ）":   ["mackerel"],
  "豆腐":             ["soy"],
  "納豆":             ["soy"],
  "豆乳":             ["soy"],
  "大豆缶":           ["soy"],
  "みそ":             ["soy", "wheat"],
  "しょうゆ":         ["soy", "wheat"],
  "鶏もも肉":         ["chicken"],
  "鶏胸肉":           ["chicken"],
  "鶏ひき肉":         ["chicken"],
  "やきとり缶":       ["chicken"],
  "バナナ":           ["banana"],
  "豚バラ肉":         ["pork"],
  "豚こま肉":         ["pork"],
  "豚ひき肉":         ["pork"],
  "豚ロース":         ["pork"],
  "もも":             ["peach"],
  "もも缶":           ["peach"],
  "やまいも":         ["yam"],
  "りんご":           ["apple"],
  "ゼラチン":         ["gelatin"],
};

export function getAllergensForFood(name: string): Allergen[] {
  const keys = ALLERGEN_FOOD_MAP[name] ?? [];
  return keys.map((k) => ALLERGENS.find((a) => a.key === k)!).filter(Boolean);
}

const STORAGE_KEY = "allergen_exclusions";

export function loadExcludedAllergens(): AllergenKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllergenKey[]) : [];
  } catch {
    return [];
  }
}

export function saveExcludedAllergens(keys: AllergenKey[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function getAllergenNamesFromKeys(keys: AllergenKey[]): string[] {
  return keys.map((k) => ALLERGENS.find((a) => a.key === k)?.name ?? k);
}
