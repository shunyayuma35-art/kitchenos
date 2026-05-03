import Anthropic from "@anthropic-ai/sdk";
import { Recipe, Category } from "../types";

export interface IdentifiedItem {
  name: string;
  category: Category;
  quantity: number;
  expiryDays: number;
}

const client = new Anthropic(); // ANTHROPIC_API_KEY を env から自動取得

export async function generateRecipes(items: string[], allItems?: string[], allergenExclusions?: string[]): Promise<Recipe[]> {
  const priorityList = items.join("、");
  const allList = allItems && allItems.length > 0
    ? `\n全在庫食材（参考）：${allItems.join("、")}`
    : "";
  const allergenNote = allergenExclusions && allergenExclusions.length > 0
    ? `\n⚠️ 除外アレルゲン（使用禁止）：${allergenExclusions.join("、")}`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `あなたは家庭料理AIアシスタントです。

優先使用食材（期限が近い）：${priorityList}${allList}${allergenNote}

上記の食材を使ったレシピを3つ作ってください。

条件：
- 優先食材を必ず使う
- 不足材料は代替案を提示する
- 「節約」「時短」「健康」の3種類を1つずつ
- 現実的な家庭料理レベル
- 調理手順は4〜6ステップで具体的に
- 調理時間と難易度も含める
- 除外アレルゲンが指定されている場合は絶対に使用しない

以下のJSON配列のみ返してください（説明文不要）：
[
  {
    "title": "レシピ名",
    "type": "節約 | 時短 | 健康",
    "cookTime": "15分",
    "difficulty": "簡単 | 普通 | 本格",
    "ingredients": ["使用食材（分量付き）"],
    "missingIngredients": ["不足食材"],
    "substitutions": ["代替案"],
    "steps": [
      "1. 手順の説明",
      "2. 手順の説明"
    ]
  }
]`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("AIレスポンスのパースに失敗しました");

  return JSON.parse(jsonMatch[0]) as Recipe[];
}

export async function identifyFoodItems(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<IdentifiedItem[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          {
            type: "text",
            text: `この冷蔵庫・冷凍庫の写真に写っている食材をすべて識別してください。

以下のJSON配列のみ返してください（説明文不要）：
[
  {
    "name": "食材名（日本語）",
    "category": "fridge | freezer | vegetable",
    "quantity": 1,
    "expiryDays": 日数（整数）
  }
]

category基準：vegetable=野菜・果物、freezer=冷凍食品、fridge=それ以外
expiryDays基準：野菜3〜7日、肉魚3〜5日、乳製品7〜14日、冷凍30日`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("識別結果のパースに失敗しました");
  return JSON.parse(jsonMatch[0]) as IdentifiedItem[];
}
