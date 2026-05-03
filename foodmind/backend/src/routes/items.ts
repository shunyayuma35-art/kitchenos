import { Router, Request, Response } from "express";
import { db } from "../db";
import { FoodItem, Category } from "../types";

const router = Router();
const VALID_CATEGORIES: Category[] = ["fridge", "freezer", "vegetable", "pantry"];

router.get("/", async (_req: Request, res: Response) => {
  try {
    res.json(await db.getItems());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "在庫取得に失敗しました" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { name, category, quantity, expiryDays } = req.body;

  if (!name || !category || quantity == null || expiryDays == null) {
    res.status(400).json({ error: "name, category, quantity, expiryDays は必須です" });
    return;
  }
  if (!VALID_CATEGORIES.includes(category)) {
    res.status(400).json({ error: "category は fridge / freezer / vegetable / pantry のいずれかです" });
    return;
  }

  try {
    const item: FoodItem = {
      id: Date.now().toString(),
      name,
      category,
      quantity: Number(quantity),
      expiryDays: Number(expiryDays),
      createdAt: new Date(),
    };
    res.status(201).json(await db.addItem(item));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "食材の追加に失敗しました" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { quantity, expiryDays } = req.body;
  try {
    const items = await db.getItems();
    if (!items.find((i) => i.id === req.params.id)) {
      res.status(404).json({ error: "食材が見つかりません" });
      return;
    }
    const updated = await db.updateItem(req.params.id, {
      ...(quantity != null && { quantity: Number(quantity) }),
      ...(expiryDays != null && { expiryDays: Number(expiryDays) }),
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新に失敗しました" });
  }
});

router.delete("/", async (_req: Request, res: Response) => {
  try {
    await db.clearItems();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "全削除に失敗しました" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const items = await db.getItems();
    if (!items.find((i) => i.id === req.params.id)) {
      res.status(404).json({ error: "食材が見つかりません" });
      return;
    }
    await db.deleteItem(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

export default router;
