import { Router, Request, Response } from "express";
import { db } from "../db";
import { ConsumptionLog } from "../types";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { foodId, amount, waste = false } = req.body;

  if (!foodId || amount == null) {
    res.status(400).json({ error: "foodId と amount は必須です" });
    return;
  }

  try {
    const items = await db.getItems();
    const item = items.find((i) => i.id === foodId);
    if (!item) {
      res.status(404).json({ error: "食材が見つかりません" });
      return;
    }

    const newQty = Math.max(0, item.quantity - Number(amount));
    if (newQty === 0) {
      await db.deleteItem(foodId);
    } else {
      await db.updateQuantity(foodId, newQty);
    }

    const log: ConsumptionLog = {
      id: Date.now().toString(),
      foodId,
      amount: Number(amount),
      waste: Boolean(waste),
      usedAt: new Date(),
    };

    res.status(201).json(await db.addLog(log));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "消費記録に失敗しました" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    res.json(await db.getLogs());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ログ取得に失敗しました" });
  }
});

export default router;
