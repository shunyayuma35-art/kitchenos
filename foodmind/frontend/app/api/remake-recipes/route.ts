import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { leftover } = await req.json();

  if (!leftover || !String(leftover).trim()) {
    return NextResponse.json({ error: "残り物の名前は必須です" }, { status: 400 });
  }

  const prompt = `「${String(leftover).trim()}」が余っています。これをリメークする家庭向けのアイデアを3つ提案してください。

条件：
- 短く・簡単・家庭向けで特別な調理器具不要
- タイトルは料理名のみ（短く）
- pointは「なぜこのリメークが良いか」を1文で
- 日本語のみで出力する

以下のJSON配列のみ返してください（説明文・コードブロック不要）：
[
  {
    "title": "リメーク料理名",
    "point": "リメークのポイント（1文）",
    "time": "調理時間（例：15分）"
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
    console.error("Remake recipe error:", err);
    return NextResponse.json({ error: "リメーク案の生成に失敗しました" }, { status: 500 });
  }
}
