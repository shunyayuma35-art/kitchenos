import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANG_NAME: Record<string, string> = {
  en: "English", vi: "Vietnamese", my: "Burmese", ne: "Nepali",
  id: "Indonesian", zh: "Simplified Chinese", ko: "Korean",
  pt: "Brazilian Portuguese", th: "Thai", "zh-TW": "Traditional Chinese",
};

export async function POST(req: NextRequest) {
  const { items, allItems, allergenExclusions, lang } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "items は必須です" }, { status: 400 });
  }

  const priorityList = (items as string[]).join("、");
  const allList = allItems?.length ? `\n全在庫食材（参考）：${(allItems as string[]).join("、")}` : "";
  const allergenNote = allergenExclusions?.length
    ? `\n⚠️ 除外アレルゲン（使用禁止）：${(allergenExclusions as string[]).join("、")}`
    : "";

  const targetLang = lang && lang !== "ja" ? LANG_NAME[lang] : null;
  const langNote = targetLang
    ? `\n\n重要：JSON内のtitle・ingredients・missingIngredients・substitutions・stepsの値はすべて${targetLang}で記述すること。typeとcookTimeとdifficultyは変更しない。`
    : "";

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `あなたは家庭料理AIアシスタントです。

優先使用食材（期限が近い）：${priorityList}${allList}${allergenNote}${langNote}

上記の食材を使ったレシピを3つ作ってください。

条件：
- 優先食材を必ず使う
- 不足材料は代替案を提示する
- 「時短」「バランス」「アレンジ」の3種類を1つずつ
- 現実的な家庭料理レベル
- 調理手順は4〜10ステップで具体的に（複雑な料理は多めに）
- 調理時間と難易度も含める
- 除外アレルゲンが指定されている場合は絶対に使用しない
- 材料の分量は必ず1人前で記載する

以下のJSON配列のみ返してください（説明文・コードブロック不要）：
[
  {
    "title": "レシピ名",
    "type": "時短 | バランス | アレンジ",
    "cookTime": "15分",
    "difficulty": "簡単 | 普通 | 本格",
    "ingredients": ["使用食材（1人前の分量付き）"],
    "missingIngredients": ["不足食材名のみ"],
    "substitutions": ["代替案"],
    "steps": ["手順の説明", "手順の説明"]
  }
]`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AIレスポンスのパースに失敗しました");
    const recipes = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ recipes });
  } catch (err) {
    console.error("Recipe generation error:", err);
    return NextResponse.json({ error: "レシピ生成に失敗しました" }, { status: 500 });
  }
}
