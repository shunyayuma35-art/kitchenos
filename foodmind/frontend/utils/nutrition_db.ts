// 栄養データベース — 独立モジュール（既存コードに影響なし）
// 単位：cal=kcal/100g, protein=g/100g, fat=g/100g, carbs=g/100g

export interface NutritionPer100g {
  cal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const NUTRITION_DB: Record<string, NutritionPer100g> = {
  // ── 野菜・果物 ──────────────────────────────────────────
  "キャベツ":       { cal: 23,  protein: 1.3, fat: 0.2, carbs: 5.2  },
  "にんじん":       { cal: 39,  protein: 0.7, fat: 0.1, carbs: 9.3  },
  "たまねぎ":       { cal: 37,  protein: 1.0, fat: 0.1, carbs: 8.4  },
  "玉ねぎ":         { cal: 37,  protein: 1.0, fat: 0.1, carbs: 8.4  },
  "ほうれん草":     { cal: 20,  protein: 2.2, fat: 0.4, carbs: 3.1  },
  "小松菜":         { cal: 14,  protein: 1.5, fat: 0.2, carbs: 2.4  },
  "ブロッコリー":   { cal: 33,  protein: 4.3, fat: 0.5, carbs: 6.6  },
  "トマト":         { cal: 19,  protein: 0.7, fat: 0.1, carbs: 4.7  },
  "きゅうり":       { cal: 14,  protein: 1.0, fat: 0.1, carbs: 3.0  },
  "なす":           { cal: 22,  protein: 1.1, fat: 0.1, carbs: 5.1  },
  "ピーマン":       { cal: 22,  protein: 0.9, fat: 0.2, carbs: 5.1  },
  "レタス":         { cal: 12,  protein: 0.6, fat: 0.1, carbs: 2.8  },
  "もやし":         { cal: 15,  protein: 1.7, fat: 0.1, carbs: 2.6  },
  "長ねぎ":         { cal: 34,  protein: 1.4, fat: 0.1, carbs: 8.3  },
  "にんにく":       { cal: 136, protein: 6.4, fat: 0.9, carbs: 27.5 },
  "しょうが":       { cal: 30,  protein: 0.9, fat: 0.3, carbs: 6.6  },
  "アスパラガス":   { cal: 22,  protein: 2.6, fat: 0.2, carbs: 3.9  },
  "たけのこ":       { cal: 26,  protein: 3.5, fat: 0.2, carbs: 4.3  },
  "りんご":         { cal: 54,  protein: 0.2, fat: 0.1, carbs: 16.2 },
  "バナナ":         { cal: 86,  protein: 1.1, fat: 0.2, carbs: 22.5 },
  "みかん":         { cal: 46,  protein: 0.7, fat: 0.1, carbs: 12.0 },
  "いちご":         { cal: 34,  protein: 0.9, fat: 0.1, carbs: 8.5  },

  // ── きのこ ──────────────────────────────────────────────
  "しめじ":         { cal: 18,  protein: 2.7, fat: 0.5, carbs: 4.8  },
  "えのき":         { cal: 22,  protein: 2.7, fat: 0.2, carbs: 7.6  },
  "エリンギ":       { cal: 19,  protein: 2.8, fat: 0.4, carbs: 6.0  },
  "しいたけ":       { cal: 18,  protein: 3.0, fat: 0.4, carbs: 6.4  },
  "まいたけ":       { cal: 16,  protein: 2.0, fat: 0.5, carbs: 4.4  },

  // ── 芋類 ────────────────────────────────────────────────
  "じゃがいも":     { cal: 76,  protein: 1.6, fat: 0.1, carbs: 17.6 },
  "さつまいも":     { cal: 132, protein: 1.2, fat: 0.2, carbs: 31.5 },
  "さといも":       { cal: 58,  protein: 1.5, fat: 0.1, carbs: 13.1 },
  "長芋":           { cal: 65,  protein: 2.2, fat: 0.3, carbs: 13.9 },

  // ── 肉類 ────────────────────────────────────────────────
  "鶏もも肉":       { cal: 204, protein: 16.6, fat: 14.2, carbs: 0.0 },
  "鶏むね肉":       { cal: 145, protein: 22.3, fat: 5.9,  carbs: 0.0 },
  "鶏ささみ":       { cal: 105, protein: 23.0, fat: 0.8,  carbs: 0.0 },
  "豚バラ肉":       { cal: 386, protein: 14.4, fat: 35.4, carbs: 0.1 },
  "豚ロース":       { cal: 263, protein: 19.3, fat: 19.2, carbs: 0.2 },
  "豚こま切れ":     { cal: 209, protein: 18.5, fat: 14.3, carbs: 0.1 },
  "牛もも肉":       { cal: 191, protein: 21.2, fat: 10.7, carbs: 0.4 },
  "牛バラ肉":       { cal: 381, protein: 11.0, fat: 37.4, carbs: 0.1 },
  "合いびき肉":     { cal: 272, protein: 17.0, fat: 21.5, carbs: 0.0 },
  "鶏ひき肉":       { cal: 186, protein: 17.5, fat: 12.0, carbs: 0.0 },
  "豚ひき肉":       { cal: 236, protein: 17.7, fat: 17.2, carbs: 0.0 },
  "ベーコン":       { cal: 405, protein: 12.9, fat: 39.1, carbs: 0.3 },
  "ソーセージ":     { cal: 321, protein: 13.2, fat: 28.5, carbs: 3.0 },
  "ハム":           { cal: 196, protein: 16.5, fat: 13.9, carbs: 1.3 },
  "鶏手羽元":       { cal: 197, protein: 18.2, fat: 12.8, carbs: 0.0 },

  // ── 魚介 ────────────────────────────────────────────────
  "サーモン":       { cal: 204, protein: 22.5, fat: 12.8, carbs: 0.1 },
  "鮭":             { cal: 133, protein: 22.3, fat: 4.1,  carbs: 0.1 },
  "まぐろ":         { cal: 125, protein: 26.4, fat: 1.4,  carbs: 0.1 },
  "さば":           { cal: 247, protein: 20.6, fat: 16.8, carbs: 0.3 },
  "あじ":           { cal: 126, protein: 20.7, fat: 4.5,  carbs: 0.1 },
  "いわし":         { cal: 169, protein: 19.2, fat: 9.2,  carbs: 0.2 },
  "えび":           { cal: 83,  protein: 18.4, fat: 0.6,  carbs: 0.7 },
  "いか":           { cal: 76,  protein: 17.9, fat: 0.8,  carbs: 0.4 },
  "あさり":         { cal: 30,  protein: 6.0,  fat: 0.3,  carbs: 4.0 },
  "ツナ缶":         { cal: 71,  protein: 16.0, fat: 0.7,  carbs: 0.1 },
  "鯖缶":           { cal: 190, protein: 20.9, fat: 10.7, carbs: 0.2 },
  "いわし缶":       { cal: 188, protein: 19.2, fat: 11.1, carbs: 0.3 },
  "たら":           { cal: 77,  protein: 17.6, fat: 0.2,  carbs: 0.1 },
  "ぶり":           { cal: 257, protein: 21.4, fat: 17.6, carbs: 0.3 },

  // ── 卵・乳製品 ──────────────────────────────────────────
  "卵":             { cal: 151, protein: 12.3, fat: 10.3, carbs: 0.3 },
  "牛乳":           { cal: 61,  protein: 3.3,  fat: 3.8,  carbs: 4.8 },
  "豆乳":           { cal: 46,  protein: 3.6,  fat: 2.0,  carbs: 3.1 },
  "ヨーグルト":     { cal: 62,  protein: 3.6,  fat: 3.0,  carbs: 4.9 },
  "チーズ":         { cal: 356, protein: 22.7, fat: 26.0, carbs: 1.3 },
  "バター":         { cal: 745, protein: 0.5,  fat: 81.0, carbs: 0.2 },
  "生クリーム":     { cal: 433, protein: 2.0,  fat: 45.0, carbs: 3.1 },

  // ── 豆腐・大豆製品 ──────────────────────────────────────
  "豆腐":           { cal: 56,  protein: 4.9,  fat: 3.0,  carbs: 2.0 },
  "絹ごし豆腐":     { cal: 56,  protein: 4.9,  fat: 3.0,  carbs: 2.0 },
  "木綿豆腐":       { cal: 72,  protein: 6.6,  fat: 4.2,  carbs: 1.6 },
  "納豆":           { cal: 200, protein: 16.5, fat: 10.0, carbs: 12.1 },
  "厚揚げ":         { cal: 143, protein: 10.7, fat: 11.3, carbs: 0.9 },
  "油揚げ":         { cal: 386, protein: 18.6, fat: 34.4, carbs: 0.4 },
  "高野豆腐":       { cal: 529, protein: 50.5, fat: 34.1, carbs: 4.2 },
  "味噌":           { cal: 186, protein: 12.5, fat: 6.0,  carbs: 21.9 },

  // ── 主食（米・麺・パン） ────────────────────────────────
  "ご飯":           { cal: 168, protein: 2.5,  fat: 0.3,  carbs: 37.1 },
  "白米":           { cal: 168, protein: 2.5,  fat: 0.3,  carbs: 37.1 },
  "パックご飯":     { cal: 168, protein: 2.5,  fat: 0.3,  carbs: 37.1 },
  "食パン":         { cal: 264, protein: 9.3,  fat: 4.4,  carbs: 49.0 },
  "うどん":         { cal: 105, protein: 2.6,  fat: 0.4,  carbs: 21.6 },
  "そば":           { cal: 132, protein: 4.8,  fat: 1.0,  carbs: 26.0 },
  "パスタ":         { cal: 378, protein: 13.0, fat: 1.9,  carbs: 72.2 },
  "中華麺":         { cal: 281, protein: 8.6,  fat: 1.2,  carbs: 55.7 },
  "冷凍うどん":     { cal: 105, protein: 2.6,  fat: 0.4,  carbs: 21.6 },
  "ラーメン":       { cal: 281, protein: 8.6,  fat: 1.2,  carbs: 55.7 },

  // ── 調味料・油 ──────────────────────────────────────────
  "醤油":           { cal: 71,  protein: 5.8,  fat: 0.0,  carbs: 7.9  },
  "みりん":         { cal: 241, protein: 0.3,  fat: 0.0,  carbs: 54.9 },
  "酒":             { cal: 109, protein: 0.4,  fat: 0.0,  carbs: 4.9  },
  "砂糖":           { cal: 384, protein: 0.0,  fat: 0.0,  carbs: 99.2 },
  "塩":             { cal: 0,   protein: 0.0,  fat: 0.0,  carbs: 0.0  },
  "サラダ油":       { cal: 921, protein: 0.0,  fat: 100.0,carbs: 0.0  },
  "ごま油":         { cal: 921, protein: 0.0,  fat: 100.0,carbs: 0.0  },
  "オリーブオイル": { cal: 921, protein: 0.0,  fat: 100.0,carbs: 0.0  },
  "マヨネーズ":     { cal: 703, protein: 1.5,  fat: 76.0, carbs: 3.6  },
  "ケチャップ":     { cal: 119, protein: 1.7,  fat: 0.2,  carbs: 29.9 },
  "ソース":         { cal: 132, protein: 1.1,  fat: 0.1,  carbs: 32.4 },
  "ポン酢":         { cal: 49,  protein: 3.1,  fat: 0.1,  carbs: 9.5  },
  "ドレッシング":   { cal: 490, protein: 0.5,  fat: 50.0, carbs: 7.5  },
  "コンソメ":       { cal: 233, protein: 7.6,  fat: 4.3,  carbs: 41.8 },
  "鶏がらスープ":   { cal: 14,  protein: 1.2,  fat: 0.3,  carbs: 2.0  },
  "片栗粉":         { cal: 338, protein: 0.1,  fat: 0.1,  carbs: 81.6 },
  "小麦粉":         { cal: 368, protein: 8.3,  fat: 1.5,  carbs: 75.8 },

  // ── 缶詰・レトルト ──────────────────────────────────────
  "冷凍餃子":       { cal: 191, protein: 7.6,  fat: 7.5,  carbs: 24.2 },
  "冷凍唐揚げ":     { cal: 275, protein: 16.2, fat: 14.8, carbs: 20.3 },
  "冷凍コーン":     { cal: 91,  protein: 3.2,  fat: 1.1,  carbs: 19.2 },
  "カレールー":     { cal: 512, protein: 7.3,  fat: 34.4, carbs: 43.1 },
  "トマト缶":       { cal: 20,  protein: 0.9,  fat: 0.2,  carbs: 4.4  },
};

/** 食材名でDBを検索（部分一致対応） */
export function lookupNutrition(name: string): NutritionPer100g | null {
  if (NUTRITION_DB[name]) return NUTRITION_DB[name];
  const key = Object.keys(NUTRITION_DB).find((k) => name.includes(k) || k.includes(name));
  return key ? NUTRITION_DB[key] : null;
}
