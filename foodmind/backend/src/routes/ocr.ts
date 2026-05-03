import { Router, Request, Response } from "express";
import Tesseract from "tesseract.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { image } = req.body;

  if (!image || typeof image !== "string") {
    res.status(400).json({ error: "image (base64文字列) は必須です" });
    return;
  }

  try {
    const result = await Tesseract.recognize(image, "jpn+eng");
    const raw = result.data.text;
    const items = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    res.json({ raw, items });
  } catch (err) {
    console.error("OCRエラー:", err);
    res.status(500).json({ error: "画像の解析に失敗しました" });
  }
});

export default router;
