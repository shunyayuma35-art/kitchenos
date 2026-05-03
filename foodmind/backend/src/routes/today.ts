import { Router, Request, Response } from "express";
import { db } from "../db";
import { getTopItems, calcPriority } from "../services/priorityService";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await db.getItems();
    const priorityItems = getTopItems(items).map((item) => ({
      ...item,
      score: Math.round(calcPriority(item)),
    }));
    res.json({ priorityItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

export default router;
