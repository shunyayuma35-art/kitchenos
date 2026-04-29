/**
 * 日本アレルゲン表示制度（2025年4月施行）に基づく29品目の多言語翻訳辞書
 *
 * 義務表示 8品目: egg, milk, wheat, buckwheat, peanut, shrimp, crab, walnut
 * 推奨表示 20品目: almond, abalone, squid, salmon_roe, orange, cashew, kiwi,
 *                   beef, sesame, salmon, mackerel, soybean, chicken, banana,
 *                   pork, matsutake, peach, yam, apple, gelatin
 * 将来追加候補 1品目: pistachio
 */

export type AllergenKey =
  // ── 義務表示 8品目 ──────────────────────────
  | "egg" | "milk" | "wheat" | "buckwheat"
  | "peanut" | "shrimp" | "crab" | "walnut"
  // ── 推奨表示 20品目 ──────────────────────────
  | "almond" | "abalone" | "squid" | "salmon_roe"
  | "orange" | "cashew" | "kiwi" | "beef"
  | "sesame" | "salmon" | "mackerel" | "soybean"
  | "chicken" | "banana" | "pork" | "matsutake"
  | "peach" | "yam" | "apple" | "gelatin"
  // ── 将来追加候補 1品目 ───────────────────────
  | "pistachio";

export type AllergenLang =
  | "ja" | "en" | "vi" | "id" | "ne" | "my"
  | "zh-CN" | "zh-TW" | "ko" | "zh-HK";

export type AllergenValue = true | false | null; // null = unknown

export type AllergenMap = Record<AllergenKey, AllergenValue>;

/** 義務表示 8品目 */
export const MANDATORY_ALLERGENS: AllergenKey[] = [
  "egg", "milk", "wheat", "buckwheat",
  "peanut", "shrimp", "crab", "walnut",
];

/** 推奨表示 20品目 */
export const RECOMMENDED_ALLERGENS: AllergenKey[] = [
  "almond", "abalone", "squid", "salmon_roe",
  "orange", "cashew", "kiwi", "beef",
  "sesame", "salmon", "mackerel", "soybean",
  "chicken", "banana", "pork", "matsutake",
  "peach", "yam", "apple", "gelatin",
];

/** 将来追加候補 */
export const FUTURE_ALLERGENS: AllergenKey[] = ["pistachio"];

/** 全29品目（表示順序） */
export const ALL_ALLERGENS: AllergenKey[] = [
  ...MANDATORY_ALLERGENS,
  ...RECOMMENDED_ALLERGENS,
  ...FUTURE_ALLERGENS,
];

/** デフォルト（全 null = 未調査） */
export function emptyAllergenMap(): AllergenMap {
  return Object.fromEntries(
    ALL_ALLERGENS.map((k) => [k, null])
  ) as AllergenMap;
}

/** 29品目 × 10言語 翻訳辞書 */
export const ALLERGEN_NAMES: Record<AllergenKey, Record<AllergenLang, string>> = {
  egg: {
    ja: "卵", en: "Egg", vi: "Trứng", id: "Telur",
    ne: "अण्डा", my: "ဥ", "zh-CN": "鸡蛋", "zh-TW": "雞蛋",
    ko: "달걀", "zh-HK": "雞蛋",
  },
  milk: {
    ja: "乳", en: "Milk", vi: "Sữa", id: "Susu",
    ne: "दूध", my: "နို့", "zh-CN": "乳制品", "zh-TW": "乳製品",
    ko: "유제품", "zh-HK": "奶製品",
  },
  wheat: {
    ja: "小麦", en: "Wheat", vi: "Lúa mì", id: "Gandum",
    ne: "गहुँ", my: "ဂျုံ", "zh-CN": "小麦", "zh-TW": "小麥",
    ko: "밀", "zh-HK": "小麥",
  },
  buckwheat: {
    ja: "そば", en: "Buckwheat", vi: "Kiều mạch", id: "Soba",
    ne: "फापर", my: "ဘတ်ကဝိပ်", "zh-CN": "荞麦", "zh-TW": "蕎麥",
    ko: "메밀", "zh-HK": "蕎麥",
  },
  peanut: {
    ja: "落花生", en: "Peanut", vi: "Đậu phộng", id: "Kacang tanah",
    ne: "बदाम", my: "မြေပဲ", "zh-CN": "花生", "zh-TW": "花生",
    ko: "땅콩", "zh-HK": "花生",
  },
  shrimp: {
    ja: "えび", en: "Shrimp", vi: "Tôm", id: "Udang",
    ne: "झिंगा", my: "ပုဇွန်", "zh-CN": "虾", "zh-TW": "蝦",
    ko: "새우", "zh-HK": "蝦",
  },
  crab: {
    ja: "かに", en: "Crab", vi: "Cua", id: "Kepiting",
    ne: "केकडा", my: "ကဏန်း", "zh-CN": "螃蟹", "zh-TW": "螃蟹",
    ko: "게", "zh-HK": "螃蟹",
  },
  walnut: {
    ja: "くるみ", en: "Walnut", vi: "Quả óc chó", id: "Kenari",
    ne: "अखरोट", my: "သစ်ကြားသီး", "zh-CN": "核桃", "zh-TW": "核桃",
    ko: "호두", "zh-HK": "合桃",
  },
  almond: {
    ja: "アーモンド", en: "Almond", vi: "Hạnh nhân", id: "Almond",
    ne: "बादाम", my: "ဗာဒံ", "zh-CN": "杏仁", "zh-TW": "杏仁",
    ko: "아몬드", "zh-HK": "杏仁",
  },
  abalone: {
    ja: "あわび", en: "Abalone", vi: "Bào ngư", id: "Abalon",
    ne: "एबेलोन", my: "ပင်လယ်ကျောက်ကပ်", "zh-CN": "鲍鱼", "zh-TW": "鮑魚",
    ko: "전복", "zh-HK": "鮑魚",
  },
  squid: {
    ja: "いか", en: "Squid", vi: "Mực", id: "Cumi-cumi",
    ne: "स्क्विड", my: "ငါးမြင်တာ", "zh-CN": "鱿鱼", "zh-TW": "魷魚",
    ko: "오징어", "zh-HK": "魷魚",
  },
  salmon_roe: {
    ja: "いくら", en: "Salmon roe", vi: "Trứng cá hồi", id: "Telur salmon",
    ne: "साल्मन रो", my: "ဆော်မွန်ငါးဥ", "zh-CN": "鲑鱼子", "zh-TW": "鮭魚卵",
    ko: "연어알", "zh-HK": "三文魚子",
  },
  orange: {
    ja: "オレンジ", en: "Orange", vi: "Cam", id: "Jeruk",
    ne: "सुन्तला", my: "လိမ္မော်သီး", "zh-CN": "橙子", "zh-TW": "柳橙",
    ko: "오렌지", "zh-HK": "橙",
  },
  cashew: {
    ja: "カシューナッツ", en: "Cashew nut", vi: "Hạt điều", id: "Kacang mete",
    ne: "काजू", my: "သီဟိုဠ်ကဲ့သို့သောဆေး", "zh-CN": "腰果", "zh-TW": "腰果",
    ko: "캐슈넛", "zh-HK": "腰果",
  },
  kiwi: {
    ja: "キウイ", en: "Kiwi", vi: "Kiwi", id: "Kiwi",
    ne: "किवी", my: "ကီဝီသီး", "zh-CN": "猕猴桃", "zh-TW": "奇異果",
    ko: "키위", "zh-HK": "奇異果",
  },
  beef: {
    ja: "牛肉", en: "Beef", vi: "Thịt bò", id: "Daging sapi",
    ne: "गाईको मासु", my: "နွားသား", "zh-CN": "牛肉", "zh-TW": "牛肉",
    ko: "쇠고기", "zh-HK": "牛肉",
  },
  sesame: {
    ja: "ごま", en: "Sesame", vi: "Mè/Vừng", id: "Wijen",
    ne: "तिल", my: "နှမ်း", "zh-CN": "芝麻", "zh-TW": "芝麻",
    ko: "참깨", "zh-HK": "芝麻",
  },
  salmon: {
    ja: "さけ", en: "Salmon", vi: "Cá hồi", id: "Salmon",
    ne: "साल्मन माछा", my: "ဆော်မွန်ငါး", "zh-CN": "鲑鱼", "zh-TW": "鮭魚",
    ko: "연어", "zh-HK": "三文魚",
  },
  mackerel: {
    ja: "さば", en: "Mackerel", vi: "Cá thu", id: "Ikan kembung",
    ne: "म्याकरेल माछा", my: "ငါးဟင်းချက်", "zh-CN": "鲭鱼", "zh-TW": "鯖魚",
    ko: "고등어", "zh-HK": "鯖魚",
  },
  soybean: {
    ja: "大豆", en: "Soybean", vi: "Đậu nành", id: "Kedelai",
    ne: "सोयाबिन", my: "ပဲပုပ်", "zh-CN": "大豆", "zh-TW": "大豆",
    ko: "대두", "zh-HK": "大豆",
  },
  chicken: {
    ja: "鶏肉", en: "Chicken", vi: "Thịt gà", id: "Daging ayam",
    ne: "कुखुराको मासु", my: "ကြက်သား", "zh-CN": "鸡肉", "zh-TW": "雞肉",
    ko: "닭고기", "zh-HK": "雞肉",
  },
  banana: {
    ja: "バナナ", en: "Banana", vi: "Chuối", id: "Pisang",
    ne: "केरा", my: "ငှက်ပျောသီး", "zh-CN": "香蕉", "zh-TW": "香蕉",
    ko: "바나나", "zh-HK": "香蕉",
  },
  pork: {
    ja: "豚肉", en: "Pork", vi: "Thịt lợn/heo", id: "Daging babi",
    ne: "सुँगुरको मासु", my: "ဝက်သား", "zh-CN": "猪肉", "zh-TW": "豬肉",
    ko: "돼지고기", "zh-HK": "豬肉",
  },
  matsutake: {
    ja: "まつたけ", en: "Matsutake mushroom", vi: "Nấm thông", id: "Jamur matsutake",
    ne: "म्याटसुटाके च्याउ", my: "မတ်ဆူတာကေမှိုများ", "zh-CN": "松茸", "zh-TW": "松茸",
    ko: "송이버섯", "zh-HK": "松茸",
  },
  peach: {
    ja: "もも", en: "Peach", vi: "Đào", id: "Persik",
    ne: "आड़ू", my: "ပန်းသီး", "zh-CN": "桃子", "zh-TW": "桃子",
    ko: "복숭아", "zh-HK": "桃子",
  },
  yam: {
    ja: "やまいも", en: "Yam (Japanese)", vi: "Khoai mỡ Nhật", id: "Talas Jepang",
    ne: "जापानी तरुल", my: "ဂျပန်ကြုပ်", "zh-CN": "山药", "zh-TW": "山藥",
    ko: "마", "zh-HK": "山藥",
  },
  apple: {
    ja: "りんご", en: "Apple", vi: "Táo", id: "Apel",
    ne: "स्याउ", my: "ပန်းသီး", "zh-CN": "苹果", "zh-TW": "蘋果",
    ko: "사과", "zh-HK": "蘋果",
  },
  gelatin: {
    ja: "ゼラチン", en: "Gelatin", vi: "Gelatin", id: "Gelatin",
    ne: "जिलेटिन", my: "ဂျယ်လတင်", "zh-CN": "明胶", "zh-TW": "明膠",
    ko: "젤라틴", "zh-HK": "明膠",
  },
  pistachio: {
    ja: "ピスタチオ", en: "Pistachio", vi: "Hạt dẻ cười", id: "Pistachio",
    ne: "पिस्ता", my: "ပစ်တာချိုး", "zh-CN": "开心果", "zh-TW": "開心果",
    ko: "피스타치오", "zh-HK": "開心果",
  },
};

/** 言語ラベル */
export const ALLERGEN_LANG_NAMES: Record<AllergenLang, string> = {
  ja: "日本語", en: "English", vi: "Tiếng Việt", id: "Bahasa Indonesia",
  ne: "नेपाली", my: "မြန်မာ", "zh-CN": "中文（简体）",
  "zh-TW": "中文（繁體）", ko: "한국어", "zh-HK": "廣東話",
};

/** アレルゲン名を指定言語で取得（フォールバック: ja） */
export function getAllergenName(key: AllergenKey, lang: AllergenLang | string): string {
  const entry = ALLERGEN_NAMES[key];
  if (!entry) return key;
  return (entry as Record<string, string>)[lang] ?? entry["ja"] ?? key;
}
