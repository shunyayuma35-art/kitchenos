import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { items } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items は必須です" }, { status: 400 });
  }
  const saved = items.map((item) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: item.name,
    category: item.category ?? "fridge",
    quantity: Number(item.quantity) || 1,
    expiryDays: Number(item.expiryDays) || 7,
    createdAt: new Date().toISOString(),
  }));
  return NextResponse.json({ saved });
}
