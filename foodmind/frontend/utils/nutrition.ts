// 栄養計算ロジック — 独立モジュール（既存コードに影響なし）
// 使い方: calculateNutrition(recipe.ingredients) → { cal, protein, fat, carbs }

import { lookupNutrition, NutritionPer100g } from "./nutrition_db";

export interface NutritionTotal {
  cal: number;
  protein: number;
  fat: number;
  carbs: number;
}

// "鶏もも肉 200g" → { name: "鶏もも肉", grams: 200 }
// "卵 2個" → { name: "卵", grams: 120 }  (1個=60g 概算)
// "醤油 大さじ1" → { name: "醤油", grams: 18 }
function parseIngredient(raw: string): { name: string; grams: number } {
  const s = raw.trim();

  // grams: 数字+g|グラム
  const gramMatch = s.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?/);
  if (gramMatch) {
    const grams = parseFloat(gramMatch[1]);
    const name = s.replace(gramMatch[0], "").trim();
    return { name: cleanName(name), grams };
  }

  // 大さじ(15ml≒15g), 小さじ(5ml≒5g)
  const tbspMatch = s.match(/大さじ\s*(\d+(?:\.\d+)?)/);
  if (tbspMatch) {
    const grams = parseFloat(tbspMatch[1]) * 15;
    return { name: cleanName(s.replace(tbspMatch[0], "")), grams };
  }
  const tspMatch = s.match(/小さじ\s*(\d+(?:\.\d+)?)/);
  if (tspMatch) {
    const grams = parseFloat(tspMatch[1]) * 5;
    return { name: cleanName(s.replace(tspMatch[0], "")), grams };
  }

  // 個・枚・本・切れ: 単位ごとの概算グラム
  const UNIT_GRAMS: Record<string, number> = {
    個: 60, 枚: 30, 本: 80, 切れ: 80, 束: 100, 袋: 100, 缶: 200, パック: 150,
    膳: 150, 杯: 150, 玉: 150, 株: 80,
  };
  for (const [unit, unitG] of Object.entries(UNIT_GRAMS)) {
    const re = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}`);
    const m = s.match(re);
    if (m) {
      const grams = parseFloat(m[1]) * unitG;
      return { name: cleanName(s.replace(m[0], "")), grams };
    }
  }

  // 数字のみ（例: "卵 2"）→ 60g/個換算
  const numOnly = s.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
  if (numOnly) {
    return { name: cleanName(numOnly[1]), grams: parseFloat(numOnly[2]) * 60 };
  }

  // 単位不明 → 100g として計算
  return { name: cleanName(s), grams: 100 };
}

function cleanName(s: string): string {
  return s.replace(/[（(].*?[)）]/g, "").replace(/[少々適量お好みで]/g, "").trim();
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function calculateNutrition(ingredients: string[]): NutritionTotal {
  try {
    const total: NutritionTotal = { cal: 0, protein: 0, fat: 0, carbs: 0 };

    for (const raw of ingredients) {
      try {
        const { name, grams } = parseIngredient(raw);
        if (!name || grams <= 0) continue;

        const db: NutritionPer100g | null = lookupNutrition(name);
        if (!db) continue;

        const ratio = grams / 100;
        total.cal     += db.cal     * ratio;
        total.protein += db.protein * ratio;
        total.fat     += db.fat     * ratio;
        total.carbs   += db.carbs   * ratio;
      } catch {
        // 1食材のパースに失敗しても続行
      }
    }

    return {
      cal:     round1(total.cal),
      protein: round1(total.protein),
      fat:     round1(total.fat),
      carbs:   round1(total.carbs),
    };
  } catch {
    return { cal: 0, protein: 0, fat: 0, carbs: 0 };
  }
}
