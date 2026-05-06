import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  // ③ APIキーの存在チェック
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が未設定です。.env ファイルを確認してください。" },
      { status: 500 },
    );
  }

  const { image, mediaType = "image/jpeg" } = await req.json();

  // ④ 画像データが空でないか検証
  if (!image || image.length === 0) {
    return NextResponse.json({ error: "image が空です" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: image },
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
    const items = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ items });
  } catch (err) {
    // ① サーバー側の詳細ログ（ターミナルで確認可能）
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Vision error:", detail);
    return NextResponse.json(
      { error: `画像識別エラー: ${detail}` },
      { status: 500 },
    );
  }
}
