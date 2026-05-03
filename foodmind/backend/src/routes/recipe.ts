import { Router, Request, Response } from "express";
import { generateRecipes } from "../services/aiService";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { items, allItems, allergenExclusions } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "items に食材リストを渡してください" });
    return;
  }

  try {
    const recipes = await generateRecipes(items, allItems, allergenExclusions);
    res.json({ recipes });
  } catch (err) {
    console.error("レシピ生成エラー:", err);
    res.status(500).json({ error: "レシピ生成に失敗しました" });
  }
});

export default router;
