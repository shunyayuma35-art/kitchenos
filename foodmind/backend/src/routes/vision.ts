import { Router, Request, Response } from "express";
import { identifyFoodItems } from "../services/aiService";
import { db } from "../db";
import { FoodItem } from "../types";

const router = Router();

// 写真から食材を識別（確認用）
router.post("/identify", async (req: Request, res: Response) => {
  const { image, mediaType = "image/jpeg" } = req.body;

  if (!image || typeof image !== "string") {
    res.status(400).json({ error: "image (base64文字列) は必須です" });
    return;
  }

  try {
    const items = await identifyFoodItems(image, mediaType);
    res.json({ items });
  } catch (err) {
    console.error("Vision識別エラー:", err);
    res.status(500).json({ error: "画像からの食材識別に失敗しました" });
  }
});

// 識別した食材を一括保存
router.post("/save", async (req: Request, res: Response) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "items は必須です" });
    return;
  }

  try {
    const saved: FoodItem[] = [];
    for (const item of items) {
      const foodItem: FoodItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: item.name,
        category: item.category ?? "fridge",
        quantity: Number(item.quantity) || 1,
        expiryDays: Number(item.expiryDays) || 7,
        createdAt: new Date(),
      };
      saved.push(await db.addItem(foodItem));
    }
    res.status(201).json({ saved });
  } catch (err) {
    console.error("一括保存エラー:", err);
    res.status(500).json({ error: "食材の保存に失敗しました" });
  }
});

export default router;
