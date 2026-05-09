import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { flavor } = await req.json();

  if (!flavor || !String(flavor).trim()) {
    return NextResponse.json({ error: "ラーメンの味は必須です" }, { status: 400 });
  }

  const prompt = `「${String(flavor).trim()}味の即席ラーメン」を使ったアレンジ料理を3つ提案してください。

条件：
- 短く・簡単・家庭向けで特別な調理器具不要
- タイトルはアレンジ名のみ（短く）
- pointは「どう変わるか・なぜ美味しいか」を1文で
- 日本語のみで出力する

以下のJSON配列のみ返してください（説明文・コードブロック不要）：
[
  {
    "title": "アレンジ名",
    "point": "アレンジのポイント（1文）",
    "time": "調理時間（例：10分）"
  }
]`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("パース失敗");

    const ideas = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("Ramen remake error:", err);
    return NextResponse.json({ error: "アレンジ案の生成に失敗しました" }, { status: 500 });
  }
}
