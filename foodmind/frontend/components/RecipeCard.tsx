"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/api";
import { useT, useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/i18n";
import { calculateNutrition } from "@/utils/nutrition";
import { makeRt } from "@/utils/recipe_translations";
import { markCooked } from "@/lib/points";

const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  時短:     { color: "bg-orange-100 text-orange-700",   icon: "⚡" },
  バランス: { color: "bg-emerald-100 text-emerald-700", icon: "🥗" },
  アレンジ: { color: "bg-purple-100 text-purple-700",   icon: "✨" },
  節約:     { color: "bg-blue-100 text-blue-700",       icon: "💰" },
  健康:     { color: "bg-emerald-100 text-emerald-700", icon: "🥗" },
};

const TYPE_LABEL: Record<Lang, Record<string, string>> = {
  ja:      { 時短:"時短", バランス:"バランス", アレンジ:"アレンジ", 節約:"節約", 健康:"健康" },
  en:      { 時短:"Quick", バランス:"Balanced", アレンジ:"Creative", 節約:"Budget", 健康:"Healthy" },
  vi:      { 時短:"Nhanh", バランス:"Cân bằng", アレンジ:"Sáng tạo", 節約:"Tiết kiệm", 健康:"Lành mạnh" },
  my:      { 時短:"မြန်", バランス:"ညှိနှိုင်း", アレンジ:"ဖန်တီး", 節約:"စွေ", 健康:"ကျန်းမာ" },
  ne:      { 時短:"छिटो", バランス:"सन्तुलित", アレンジ:"रचनात्मक", 節約:"बचत", 健康:"स्वस्थ" },
  id:      { 時短:"Cepat", バランス:"Seimbang", アレンジ:"Kreatif", 節約:"Hemat", 健康:"Sehat" },
  zh:      { 時短:"快捷", バランス:"均衡", アレンジ:"创意", 節約:"节省", 健康:"健康" },
  ko:      { 時短:"빠른", バランス:"균형", アレンジ:"창의적", 節約:"절약", 健康:"건강" },
  pt:      { 時短:"Rápido", バランス:"Equilibrado", アレンジ:"Criativo", 節約:"Econômico", 健康:"Saudável" },
  th:      { 時短:"เร็ว", バランス:"สมดุล", アレンジ:"สร้างสรรค์", 節約:"ประหยัด", 健康:"สุขภาพ" },
  "zh-TW": { 時短:"快速", バランス:"均衡", アレンジ:"創意", 節約:"節省", 健康:"健康" },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  簡単: "text-emerald-600",
  普通: "text-amber-600",
  本格: "text-red-600",
};

const DIFFICULTY_LABEL: Record<Lang, Record<string, string>> = {
  ja:      { 簡単:"簡単", 普通:"普通", 本格:"本格" },
  en:      { 簡単:"Easy", 普通:"Medium", 本格:"Advanced" },
  vi:      { 簡単:"Dễ", 普通:"Trung bình", 本格:"Khó" },
  my:      { 簡単:"လွယ်", 普通:"အလတ်", 本格:"ခက်" },
  ne:      { 簡単:"सजिलो", 普通:"मध्यम", 本格:"कठिन" },
  id:      { 簡単:"Mudah", 普通:"Sedang", 本格:"Sulit" },
  zh:      { 簡単:"简单", 普通:"中等", 本格:"复杂" },
  ko:      { 簡単:"쉬움", 普通:"보통", 本格:"어려움" },
  pt:      { 簡単:"Fácil", 普通:"Médio", 本格:"Difícil" },
  th:      { 簡単:"ง่าย", 普通:"ปานกลาง", 本格:"ยาก" },
  "zh-TW": { 簡単:"簡單", 普通:"中等", 本格:"困難" },
};

function scaleIngredients(ingredients: string[], servings: number): string[] {
  if (servings === 1) return ingredients;
  return ingredients.map((ing) =>
    ing.replace(/(\d+(?:[./]\d+)?)/g, (match) => {
      const parts = match.split("/");
      const n = parts.length === 2
        ? Number(parts[0]) / Number(parts[1])
        : parseFloat(match);
      const scaled = (n as number) * servings;
      return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1).replace(/\.0$/, "");
    })
  );
}

function addToShoppingCart(items: string[]) {
  try {
    const existing: { id: string; text: string; done: boolean }[] =
      JSON.parse(localStorage.getItem("shop_cart") || "[]");
    const newItems = items
      .filter((name) => !existing.some((c) => c.text === name))
      .map((name) => ({ id: `${Date.now()}-${name}`, text: name, done: false }));
    localStorage.setItem("shop_cart", JSON.stringify([...existing, ...newItems]));
    return newItems.length;
  } catch {
    return 0;
  }
}

export default function RecipeCard({
  recipe,
  index,
  servings = 1,
  onCooked,
}: {
  recipe: Recipe;
  index: number;
  servings?: number;
  onCooked?: (recipe: Recipe) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [sent, setSent] = useState(false);
  const [cookedState, setCookedState] = useState<"idle" | "loading" | "done">("idle");
  const [earnedPts, setEarnedPts] = useState(0);
  const t = useT();
  const { lang } = useLang();
  const cfg = TYPE_CONFIG[recipe.type] ?? { color: "bg-gray-100 text-gray-600", icon: "🍴" };
  const typeLabel = TYPE_LABEL[lang]?.[recipe.type] ?? recipe.type;
  const diffLabel = recipe.difficulty ? (DIFFICULTY_LABEL[lang]?.[recipe.difficulty] ?? recipe.difficulty) : undefined;

  const scaledIngredients = scaleIngredients(recipe.ingredients, servings);
  const rT = makeRt(lang);

  function handleSendMissing() {
    addToShoppingCart(recipe.missingIngredients);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  async function handleCooked() {
    if (cookedState !== "idle") return;
    setCookedState("loading");
    const { earned } = markCooked(recipe.title);
    setEarnedPts(earned);
    if (onCooked) await onCooked(recipe);
    setCookedState("done");
  }

  return (
    <div
      className="bg-white rounded-2xl card-shadow animate-slide-up overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.color}`}>
                {typeLabel}
              </span>
              {recipe.cookTime && (
                <span className="text-[10px] text-gray-400">⏱ {recipe.cookTime}</span>
              )}
              {diffLabel && (
                <span className={`text-[10px] font-semibold ${DIFFICULTY_COLOR[recipe.difficulty ?? ""] ?? "text-gray-500"}`}>
                  {diffLabel}
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-snug">{recipe.title}</p>
            <p className="text-xs text-gray-400 mt-1">{scaledIngredients.join(" · ")}</p>
            {recipe.missingIngredients.length > 0 && (
              <div className="mt-1.5">
                <p className="text-xs text-amber-500">
                  {t.recipeMissing} {recipe.missingIngredients.join(t.nameSep)}
                  {recipe.substitutions.length > 0 && ` → ${recipe.substitutions[0]}`}
                </p>
                <button
                  onClick={handleSendMissing}
                  className={`mt-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                    sent
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-700 active:scale-95"
                  }`}
                >
                  {sent ? t.homeMissingSent : `🛒 ${t.homeMissingSend}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {recipe.steps && recipe.steps.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1
                       py-1.5 rounded-xl bg-emerald-50 active:bg-emerald-100"
          >
            {expanded ? t.recipeClose : t.recipeOpen}
          </button>
        )}
      </div>

      {expanded && recipe.steps && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex gap-2.5 text-xs text-gray-700 leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold
                               flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
              <span>{step.replace(/^\d+\.\s*/, "")}</span>
            </div>
          ))}
          {(() => {
            const n = calculateNutrition(scaledIngredients);
            if (n.cal <= 0) return null;
            return (
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-around text-center">
                <div>
                  <p className="text-xs font-bold text-gray-700">{n.cal}<span className="text-[10px] font-normal text-gray-400"> kcal</span></p>
                  <p className="text-[10px] text-gray-400">{rT("nutrition.calories")}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600">{n.protein}<span className="text-[10px] font-normal text-gray-400"> g</span></p>
                  <p className="text-[10px] text-gray-400">{rT("nutrition.protein")}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-500">{n.fat}<span className="text-[10px] font-normal text-gray-400"> g</span></p>
                  <p className="text-[10px] text-gray-400">{rT("nutrition.fat")}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600">{n.carbs}<span className="text-[10px] font-normal text-gray-400"> g</span></p>
                  <p className="text-[10px] text-gray-400">{rT("nutrition.carbs")}</p>
                </div>
              </div>
            );
          })()}

          {/* ── 料理した！ボタン ── */}
          <button
            onClick={handleCooked}
            disabled={cookedState !== "idle"}
            className={`mt-3 w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95
              ${cookedState === "done"
                ? "bg-emerald-100 text-emerald-700 cursor-default"
                : cookedState === "loading"
                  ? "bg-amber-50 text-amber-400 cursor-wait"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200"
              }`}
          >
            {cookedState === "done"
              ? earnedPts > 0
                ? `✅ 今日作った！ +${earnedPts}P 獲得`
                : "✅ 今日すでに料理しました"
              : cookedState === "loading"
                ? "記録中…"
                : "🍳 料理した！ +30P"}
          </button>
        </div>
      )}
    </div>
  );
}
