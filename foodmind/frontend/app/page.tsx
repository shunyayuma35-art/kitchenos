"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchToday, fetchItems, generateRecipes, addItem,
  clearAllItems, consumeItem, deleteItem, updateItem,
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

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [editQty, setEditQty]         = useState(1);
  const [editDays, setEditDays]       = useState(3);

  const urgentItems  = priorityItems.filter((i) => i.expiryDays <= 2);
  const warningItems = priorityItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 5);
  const today = new Date().toLocaleDateString(t.locale, { month: "long", day: "numeric", weekday: "short" });

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

  const isEmpty = !loading && allItems.length === 0;

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      {/* ── ヘッダー ── */}
      <div className="gradient-header px-5 pt-12 pb-10">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t.homeSubtitle}</p>
        <h1 className="text-white text-4xl font-bold tracking-tight">パシャ食</h1>
        <p className="text-white/90 text-sm font-medium mt-0.5">{t.homeTagline}</p>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-white/60 text-xs">{today}</p>
          {!loading && (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              urgentItems.length > 0
                ? "bg-red-500/30 text-white"
                : warningItems.length > 0
                  ? "bg-white/20 text-white/80"
                  : "bg-white/20 text-white/70"
            }`}>
              {urgentItems.length > 0 ? "🔴" : warningItems.length > 0 ? "🟡" : "🟢"}
              {urgentItems.length > 0 ? t.homeStatusUrgent : warningItems.length > 0 ? t.homeStatusWarn : t.homeStatusGood}
            </span>
          )}
        </div>
      </div>

      {/* ── アラートカード ── */}
      <div className="px-4 -mt-5 space-y-2">
        {urgentItems.length > 0 && (
          <div className="bg-red-500 text-white rounded-2xl px-4 py-4 card-shadow-md animate-slide-up">
            <p className="font-bold text-base">
              {t.homeUrgent(urgentItems.map((i) => i.name).filter((v, idx, a) => a.indexOf(v) === idx).join(t.nameSep))}
            </p>
          </div>
        )}
        {warningItems.length > 0 && (
          <div className="bg-amber-400 text-white rounded-2xl px-4 py-4 card-shadow animate-slide-up flex items-center gap-3">
            <span className="text-2xl shrink-0">🥕</span>
            <p className="font-bold text-base">
              {t.homeWarning(warningItems.map((i) => i.name).filter((v, idx, a) => a.indexOf(v) === idx).join(t.nameSep))}
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
              <p className="text-5xl mb-3">🥕</p>
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
            <button
              onClick={() => handleGenerate()}
              disabled={loadingRecipes || priorityItems.length === 0}
              className="w-full py-5 rounded-2xl font-bold text-base transition-all
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
