"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchToday, fetchItems, generateRecipes, addItem,
  clearAllItems, consumeItem, deleteItem, updateItem, visionIdentify,
} from "@/lib/api";
import type { FoodItem, Recipe } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import FoodCard from "@/components/FoodCard";
import RecipeCard from "@/components/RecipeCard";
import { useT } from "@/lib/LangContext";
import { loadExcludedAllergens, getAllergenNamesFromKeys } from "@/lib/allergens";

const DEMO_ITEMS = [
  { name: "キャベツ",   category: "vegetable" as const, quantity: 1, expiryDays: 2   },
  { name: "鶏もも肉",  category: "fridge"    as const, quantity: 2, expiryDays: 2   },
  { name: "卵",         category: "fridge"    as const, quantity: 6, expiryDays: 10  },
  { name: "にんじん",  category: "vegetable" as const, quantity: 2, expiryDays: 4   },
  { name: "豚バラ肉",  category: "fridge"    as const, quantity: 1, expiryDays: 3   },
  { name: "ツナ缶",    category: "pantry"    as const, quantity: 3, expiryDays: 365 },
  { name: "冷凍餃子",  category: "freezer"   as const, quantity: 2, expiryDays: 60  },
  { name: "じゃがいも",category: "vegetable" as const, quantity: 4, expiryDays: 14  },
  { name: "豆腐",      category: "fridge"    as const, quantity: 1, expiryDays: 4   },
  { name: "パックご飯",category: "pantry"    as const, quantity: 2, expiryDays: 365 },
];

export default function Home() {
  const t = useT();
  const [priorityItems, setPriorityItems] = useState<FoodItem[]>([]);
  const [allItems, setAllItems]           = useState<FoodItem[]>([]);
  const [recipes, setRecipes]             = useState<Recipe[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [demoLoading, setDemoLoading]     = useState(false);
  const [error, setError]                 = useState("");

  const [editingItem, setEditingItem]   = useState<FoodItem | null>(null);
  const [editQty, setEditQty]           = useState(1);
  const [editDays, setEditDays]         = useState(3);
  const [photoLoading, setPhotoLoading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

  const urgentItems  = priorityItems.filter((i) => i.expiryDays <= 2);
  const warningItems = priorityItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 5);
  const today = new Date().toLocaleDateString(t.locale, { month: "long", day: "numeric", weekday: "short" });

  // 冷蔵庫スコア計算
  const fridgeScore = Math.max(0, Math.min(100,
    100
    - allItems.filter((i) => i.expiryDays <= 2).length * 20
    - allItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 7).length * 8
  ));
  const scoreMeta = fridgeScore >= 85
    ? { label: "いい感じ！", color: "text-emerald-300" }
    : fridgeScore >= 65
      ? { label: "まあまあ", color: "text-yellow-200" }
      : fridgeScore >= 45
        ? { label: "使っちゃおう", color: "text-orange-200" }
        : { label: "たすけて〜", color: "text-red-200" };

  // 今日助けられる食材（1〜3日以内）
  const savingsCount = allItems.filter((i) => i.expiryDays >= 1 && i.expiryDays <= 3).length;

  const loadData = useCallback(async () => {
    try {
      const [d, items] = await Promise.all([fetchToday(), fetchItems()]);
      setPriorityItems(d.priorityItems);
      setAllItems(items);
    } catch {
      setError(t.homeErrFetch);
    }
  }, [t.homeErrFetch]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleGenerate = useCallback(async (items?: FoodItem[], all?: FoodItem[]) => {
    const pri = items ?? priorityItems;
    const allI = all ?? allItems;
    if (pri.length === 0) return;
    setLoadingRecipes(true);
    setError("");
    try {
      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const { recipes } = await generateRecipes(pri.map((i) => i.name), allI.map((i) => i.name), excluded);
      setRecipes(recipes);
    } catch {
      setError(t.homeErrRecipe);
    } finally {
      setLoadingRecipes(false);
    }
  }, [priorityItems, allItems, t.homeErrRecipe]);

  async function handleDemo() {
    setDemoLoading(true);
    setError("");
    try {
      await clearAllItems();
      await Promise.all(DEMO_ITEMS.map((item) => addItem(item)));
      const [d, items] = await Promise.all([fetchToday(), fetchItems()]);
      setPriorityItems(d.priorityItems);
      setAllItems(items);
      setLoadingRecipes(true);
      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const { recipes } = await generateRecipes(d.priorityItems.map((i) => i.name), items.map((i) => i.name), excluded);
      setRecipes(recipes);
    } catch {
      setError(t.homeErrRecipe);
    } finally {
      setDemoLoading(false);
      setLoadingRecipes(false);
    }
  }

  async function handleConsumeInHome(item: FoodItem) {
    await consumeItem({ foodId: item.id, amount: 1 });
    loadData();
  }

  async function handleDeleteInHome(id: string) {
    if (!confirm(t.invDeleteConfirm)) return;
    await deleteItem(id);
    loadData();
  }

  function handleEditOpen(item: FoodItem) {
    setEditingItem(item);
    setEditQty(item.quantity);
    setEditDays(item.expiryDays);
  }

  async function handleSaveEdit() {
    if (!editingItem) return;
    await updateItem(editingItem.id, { quantity: editQty, expiryDays: editDays });
    setEditingItem(null);
    loadData();
  }

  async function handlePhotoRecipe(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setError("");
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload  = () => res((r.result as string).split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const { items: identified } = await visionIdentify(base64, file.type as "image/jpeg" | "image/png" | "image/webp");
      const names = identified.map((i) => i.name);
      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const { recipes } = await generateRecipes(names, names, excluded);
      setRecipes(recipes);
    } catch {
      setError("写真からの読み取りに失敗しました");
    } finally {
      setPhotoLoading(false);
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  const isEmpty = !loading && allItems.length === 0;

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      {/* ── ヘッダー ── */}
      <div className="gradient-header px-5 pt-12 pb-10">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t.homeSubtitle}</p>
        <h1 className="text-white text-4xl font-bold tracking-tight">パシャ食</h1>
        <p className="text-white/90 text-sm font-medium mt-0.5">{t.homeTagline}</p>
        <p className="text-white/60 text-xs mt-2">{today}</p>

        {/* 冷蔵庫スコア */}
        {!loading && allItems.length > 0 && (
          <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">🥬 冷蔵庫スコア</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-white text-2xl font-black">{fridgeScore}点</span>
                <span className={`text-sm font-bold ${scoreMeta.color}`}>{scoreMeta.label}</span>
              </div>
            </div>
            {savingsCount > 0 && (
              <p className="text-white/70 text-xs text-right leading-snug">
                今日は{savingsCount}つの食材を<br />ムダにせず使えそう
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── たすけて〜カード ── */}
      <div className="px-4 -mt-5 space-y-2">
        {urgentItems.length > 0 && (
          <button
            onClick={() => handleGenerate()}
            disabled={loadingRecipes}
            className="w-full bg-white rounded-2xl px-4 py-4 card-shadow-md animate-slide-up
                       border-2 border-red-100 text-left active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl shrink-0 animate-pulse-soft">🥺</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-red-500 text-base truncate">
                  {urgentItems.map((i) => i.name).slice(0, 3).join("・")}
                  　たすけて〜！
                </p>
                <p className="text-xs text-gray-400 mt-0.5">タップで今すぐレシピを考えてもらう →</p>
              </div>
            </div>
          </button>
        )}
        {warningItems.length > 0 && urgentItems.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 animate-slide-up flex items-center gap-3">
            <span className="text-2xl shrink-0">🥕</span>
            <p className="text-amber-700 font-semibold text-sm">
              {warningItems.map((i) => i.name).slice(0, 3).join("・")} がそろそろ使い時です
            </p>
          </div>
        )}
      </div>

      <div className="px-4 mt-6 space-y-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* ── 優先食材 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.homePriorityTitle}</h2>
            <span className="text-sm text-gray-400">{t.homeItemCount(priorityItems.length)}</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-white rounded-2xl card-shadow animate-pulse" />)}
            </div>
          ) : priorityItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center card-shadow">
              {/* ぷるんぷるん ブロッコリーキャラクター */}
              <div className="flex justify-center mb-3">
                <svg
                  viewBox="0 0 100 115"
                  className="w-24 h-28 animate-veggie-bounce"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 茎 */}
                  <rect x="43" y="86" width="14" height="22" rx="6" fill="#4A7C28" />
                  {/* 影 */}
                  <ellipse cx="50" cy="110" rx="18" ry="4" fill="#000" opacity="0.07" />

                  {/* ボディ（ブロッコリーの房） */}
                  <circle cx="50" cy="64" r="28" fill="#5CB83A" />
                  <circle cx="28" cy="56" r="20" fill="#63C43F" />
                  <circle cx="72" cy="56" r="20" fill="#63C43F" />
                  <circle cx="50" cy="42" r="22" fill="#63C43F" />
                  <circle cx="32" cy="44" r="16" fill="#75D150" />
                  <circle cx="68" cy="44" r="16" fill="#75D150" />
                  <circle cx="50" cy="30" r="19" fill="#75D150" />
                  <circle cx="38" cy="34" r="12" fill="#85DC60" />
                  <circle cx="62" cy="34" r="12" fill="#85DC60" />
                  <circle cx="50" cy="20" r="13" fill="#85DC60" />

                  {/* 顔エリア */}
                  <ellipse cx="50" cy="72" rx="20" ry="16" fill="#5CB83A" />

                  {/* 目（白目） */}
                  <circle cx="41" cy="68" r="6" fill="white" />
                  <circle cx="59" cy="68" r="6" fill="white" />
                  {/* 瞳 */}
                  <circle cx="42" cy="69" r="3.2" fill="#1A1A1A" />
                  <circle cx="60" cy="69" r="3.2" fill="#1A1A1A" />
                  {/* キラキラ */}
                  <circle cx="43.5" cy="67.5" r="1.3" fill="white" />
                  <circle cx="61.5" cy="67.5" r="1.3" fill="white" />
                  <circle cx="44.5" cy="70" r="0.6" fill="white" />
                  <circle cx="62.5" cy="70" r="0.6" fill="white" />

                  {/* ほっぺ */}
                  <ellipse cx="31" cy="74" rx="8" ry="5" fill="#FF8FAB" opacity="0.55" />
                  <ellipse cx="69" cy="74" rx="8" ry="5" fill="#FF8FAB" opacity="0.55" />

                  {/* 口（笑顔） */}
                  <path d="M 40 77 Q 50 86 60 77" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  {/* 舌 */}
                  <ellipse cx="50" cy="82" rx="5" ry="3.5" fill="#FF6B8A" opacity="0.8" />
                </svg>
              </div>
              <p className="text-gray-500 text-base font-semibold">{t.homeEmptyTitle}</p>
              <p className="text-gray-400 text-sm mt-1">{t.homeEmptyHint}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {priorityItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onConsume={() => handleConsumeInHome(item)}
                  onEdit={() => handleEditOpen(item)}
                  onDelete={() => handleDeleteInHome(item.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── デモモード ── */}
        {isEmpty && (
          <section>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
              <p className="text-xl mb-1">✨</p>
              <p className="font-bold text-amber-800 text-base mb-1">{t.demoTitle}</p>
              <p className="text-amber-600 text-sm mb-4">{t.demoDesc}</p>
              <button
                onClick={handleDemo}
                disabled={demoLoading}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-base
                           shadow-md shadow-amber-200 disabled:opacity-50 active:scale-98 transition-all"
              >
                {demoLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.demoLoading}
                  </span>
                ) : t.demoBtn}
              </button>
            </div>
          </section>
        )}

        {/* ── レシピ ── */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{t.homeTodayTitle}</h2>
          {recipes.length === 0 && (
            <p className="text-xs text-gray-400 mb-3">{t.homeGenerateDesc}</p>
          )}

          {recipes.length === 0 ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerate()}
                disabled={loadingRecipes || photoLoading || priorityItems.length === 0}
                className="flex-1 py-5 rounded-2xl font-bold text-base transition-all
                           bg-amber-600 text-white shadow-md shadow-amber-200
                           disabled:opacity-40 disabled:shadow-none active:scale-98"
              >
                {loadingRecipes ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.homeGenerating}
                  </span>
                ) : t.homeGenerate}
              </button>

              <button
                onClick={() => cameraRef.current?.click()}
                disabled={loadingRecipes || photoLoading}
                title="写真から献立を考える"
                className="w-16 rounded-2xl bg-white border border-amber-200 text-amber-600
                           shadow-md shadow-amber-100 text-2xl flex items-center justify-center
                           disabled:opacity-40 active:scale-95 transition-all"
              >
                {photoLoading
                  ? <span className="animate-spin w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full inline-block" />
                  : "📸"}
              </button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoRecipe}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {recipes.map((r, i) => <RecipeCard key={i} recipe={r} index={i} />)}
              <button onClick={() => setRecipes([])} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
                {t.homeRegenerate}
              </button>
            </div>
          )}
        </section>
      </div>

      <BottomNav />

      {/* ── 食材変更モーダル ── */}
      {editingItem && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-t-3xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
            <h3 className="font-bold text-lg text-gray-800">{editingItem.name}</h3>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.addQtyLabel}</label>
              <input
                type="number"
                min={1}
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-3 text-base focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.addExpiryLabel}</label>
              <input
                type="number"
                min={1}
                value={editDays}
                onChange={(e) => setEditDays(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-3 text-base focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 font-semibold"
              >
                {t.addModalCancel}
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 rounded-2xl bg-teal-600 text-white font-bold shadow-md shadow-teal-100"
              >
                {t.invSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
