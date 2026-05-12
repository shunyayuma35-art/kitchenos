"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchToday, fetchItems, generateRecipes, addItem,
  clearAllItems, consumeItem, deleteItem, updateItem, visionIdentify,
  saveFridgePhoto, getFridgePhotoItems, getFridgePhotoCount,
} from "@/lib/api";
import type { FoodItem, Recipe, IdentifiedItem } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import FoodCard from "@/components/FoodCard";
import RecipeCard from "@/components/RecipeCard";
import RemakeCard from "@/components/RemakeCard";
import RamenRemakeCard from "@/components/RamenRemakeCard";
import { useT, useLang } from "@/lib/LangContext";
import { LANG_META, type Lang } from "@/lib/i18n";
import { loadExcludedAllergens, getAllergenNamesFromKeys } from "@/lib/allergens";
import { rt, getFallbackRecipes } from "@/utils/recipe_translations";
import Link from "next/link";
import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const CharacterHUD = nextDynamic(
  () => import("@/components/CharacterHUD"),
  { ssr: false }
);

async function resizeImage(
  file: File,
  maxWidth = 1024,
  quality = 0.85,
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas取得失敗")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({
        base64:    canvas.toDataURL("image/jpeg", quality).split(",")[1],
        mediaType: "image/jpeg",
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("画像読み込み失敗")); };
    img.src = url;
  });
}

function suggestSideDish(ingredients: string[], lang: Lang): string {
  const s = ingredients.join(" ");
  if (!/(米|麺|パン)/.test(s))                                                                   return rt("side_dish.carb",    lang);
  if (!/(卵|肉|魚)/.test(s))                                                                     return rt("side_dish.protein", lang);
  if (!/(トマト|キャベツ|レタス|玉ねぎ|ほうれん草)/.test(s))                                       return rt("side_dish.veggie",  lang);
  if (!/(スープ|みそ汁|汁|コンソメ|ポタージュ|乾燥コンソメ|乾燥ポタージュ|乾燥スープ)/.test(s))    return rt("side_dish.soup",    lang);
  return "";
}

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
  const { lang, setLang } = useLang();
  const [priorityItems, setPriorityItems] = useState<FoodItem[]>([]);
  const [allItems, setAllItems]           = useState<FoodItem[]>([]);
  const [recipes, setRecipes]             = useState<Recipe[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [demoLoading, setDemoLoading]     = useState(false);
  const [error, setError]                 = useState("");
  const [servings, setServings]           = useState(1);
  const [editingItem, setEditingItem]     = useState<FoodItem | null>(null);
  const [editQty, setEditQty]             = useState(1);
  const [editDays, setEditDays]           = useState(3);
  const [photoLoading, setPhotoLoading]   = useState(false);
  const [photoCount, setPhotoCount]       = useState(0);
  const [langOpen, setLangOpen]           = useState(false);
  const cameraRef     = useRef<HTMLInputElement>(null);
  const lastGenParams = useRef<{ priority: string[]; all: string[] } | null>(null);

  const fridgeScore = Math.max(0, Math.min(100,
    100
    - allItems.filter((i) => i.expiryDays <= 2).length * 20
    - allItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 7).length * 8
  ));

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
    setPhotoCount(getFridgePhotoCount());
  }, [loadData]);

  async function handleCooked(recipe: Recipe) {
    const toConsume = recipe.ingredients
      .map((ing) => allItems.find((item) => ing.includes(item.name)))
      .filter((item): item is FoodItem => item !== undefined);
    await Promise.all(toConsume.map((item) =>
      consumeItem({ foodId: item.id, amount: 1 })
    ));
    await loadData();
  }

  function handleLangChange(newLang: Lang) {
    setLang(newLang);
    const priority = lastGenParams.current?.priority
      ?? (priorityItems.length > 0 ? priorityItems.map((i) => i.name) : null);
    if (!priority || priority.length === 0) return;
    const all = lastGenParams.current?.all ?? allItems.map((i) => i.name);
    const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
    setLoadingRecipes(true);
    generateRecipes(priority, all, excluded, newLang)
      .then(({ recipes }) => setRecipes(recipes))
      .catch(() => setRecipes(getFallbackRecipes(newLang)))
      .finally(() => setLoadingRecipes(false));
  }

  const handleGenerate = useCallback(async (items?: FoodItem[], all?: FoodItem[]) => {
    const pri  = items ?? priorityItems;
    const allI = all   ?? allItems;
    if (pri.length === 0) return;
    setLoadingRecipes(true);
    setError("");
    try {
      const excluded     = getAllergenNamesFromKeys(loadExcludedAllergens());
      const photoItems   = getFridgePhotoItems();
      const priorityNames = Array.from(new Set([...pri.map((i) => i.name), ...photoItems]));
      const allNames      = Array.from(new Set([...allI.map((i) => i.name), ...photoItems]));
      const { recipes }  = await generateRecipes(priorityNames, allNames, excluded, lang);
      lastGenParams.current = { priority: priorityNames, all: allNames };
      setRecipes(recipes);
    } catch {
      setError(t.homeErrRecipe);
    } finally {
      setLoadingRecipes(false);
    }
  }, [priorityItems, allItems, t.homeErrRecipe, lang]);

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
      const excluded      = getAllergenNamesFromKeys(loadExcludedAllergens());
      const priorityNames = d.priorityItems.map((i) => i.name);
      const allNames      = items.map((i) => i.name);
      const { recipes }   = await generateRecipes(priorityNames, allNames, excluded, lang);
      lastGenParams.current = { priority: priorityNames, all: allNames };
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
    const files = Array.from(e.target.files || []).filter((f) => f.size > 0);
    if (files.length === 0) {
      setError("画像ファイルが空です。もう一度撮影してください。");
      return;
    }
    setPhotoLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const { base64, mediaType } = await resizeImage(file);
          const result = await visionIdentify(base64, mediaType);
          saveFridgePhoto(base64, mediaType, result.items.map((i) => i.name));
          return result.items;
        })
      );
      setPhotoCount(getFridgePhotoCount());

      const allIdentified = results
        .filter((r): r is PromiseFulfilledResult<IdentifiedItem[]> => r.status === "fulfilled")
        .flatMap((r) => r.value);
      const names = Array.from(new Set(allIdentified.map((i) => i.name)));

      const existingItems  = allItems.map((i) => i.name);
      const priorityNames  =
        names.length > 0         ? names :
        existingItems.length > 0 ? existingItems :
        ["卵", "ご飯"];

      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const combined = Array.from(new Set([...priorityNames, ...existingItems]));
      let generatedRecipes: Recipe[];
      try {
        const result = await generateRecipes(priorityNames, combined, excluded, lang);
        lastGenParams.current = { priority: priorityNames, all: combined };
        generatedRecipes = result.recipes;
      } catch {
        generatedRecipes = getFallbackRecipes(lang);
      }
      setRecipes(generatedRecipes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`写真エラー: ${msg}`);
    } finally {
      setPhotoLoading(false);
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  const isEmpty   = !loading && allItems.length === 0;
  const sideDish  = suggestSideDish(recipes.flatMap((r) => r.ingredients), lang);

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}

      {/* ── ヘッダー ── */}
      <div className="gradient-header px-5 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">パシャ食Ai</h1>
            <p className="text-white/60 text-xs mt-0.5">📷 撮るだけで献立が出る</p>
          </div>
          {/* 言語セレクタ */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30
                         text-white rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
            >
              <span>{LANG_META[lang].flag}</span>
              <span className="text-xs">{LANG_META[lang].label}</span>
              <span className="text-white/60 text-[10px]">▾</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl z-50 overflow-hidden min-w-[160px]">
                {(Object.entries(LANG_META) as [import("@/lib/i18n").Lang, typeof LANG_META[keyof typeof LANG_META]][]).map(([code, meta]) => (
                  <button
                    key={code}
                    onClick={() => { handleLangChange(code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors
                      ${lang === code ? "bg-amber-50 text-amber-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <span>{meta.flag}</span>
                    <span>{meta.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-5">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* ── PRIMARY CTA ── */}
        <section>
          <p className="text-center text-gray-500 text-sm mb-3">
            AIが今ある食材で献立を考えます🍽️
          </p>

          <div className="relative">
            <button
              onClick={() => cameraRef.current?.click()}
              disabled={loadingRecipes || photoLoading}
              className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-bold text-lg
                         shadow-lg shadow-emerald-200 flex items-center justify-center gap-3
                         active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {photoLoading ? (
                <>
                  <span className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full inline-block" />
                  解析中...
                </>
              ) : (
                <>
                  <span className="text-2xl">📷</span>
                  写真で献立を考える
                </>
              )}
            </button>
            {photoCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white
                               text-[10px] font-bold rounded-full flex items-center justify-center z-10">
                {photoCount}
              </span>
            )}
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoRecipe}
          />

          {/* 在庫から生成（食材があるときのみ） */}
          {allItems.length > 0 && recipes.length === 0 && (
            <button
              onClick={() => handleGenerate()}
              disabled={loadingRecipes || priorityItems.length === 0}
              className="w-full mt-2 py-3.5 rounded-2xl border border-amber-200 bg-amber-50
                         text-amber-800 font-semibold text-sm flex items-center justify-center gap-2
                         active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loadingRecipes ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full inline-block" />
                  考え中...
                </>
              ) : (
                "🥕 今ある食材で献立を考える"
              )}
            </button>
          )}
        </section>

        {/* ── サブ機能ショートカット ── */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/inventory"
            className="flex flex-col items-center gap-1 bg-white rounded-2xl py-3.5 card-shadow active:scale-[0.97] transition-all"
          >
            <span className="text-2xl">❄️</span>
            <span className="text-[11px] font-semibold text-gray-600">食材管理</span>
          </Link>
          <Link
            href="/add"
            className="flex flex-col items-center gap-1 bg-white rounded-2xl py-3.5 card-shadow active:scale-[0.97] transition-all"
          >
            <span className="text-2xl">➕</span>
            <span className="text-[11px] font-semibold text-gray-600">食材を追加</span>
          </Link>
          <Link
            href="/baby"
            className="flex flex-col items-center gap-1 bg-pink-50 rounded-2xl py-3.5 card-shadow border border-pink-100 active:scale-[0.97] transition-all"
          >
            <span className="text-2xl">👶</span>
            <span className="text-[11px] font-semibold text-pink-600">離乳食</span>
          </Link>
        </div>

        {/* ── デモモード（食材ゼロ時のみ） ── */}
        {isEmpty && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <p className="font-bold text-amber-800 mb-1">{t.demoTitle}</p>
            <p className="text-amber-600 text-sm mb-4">{t.demoDesc}</p>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="w-full py-3 bg-amber-600 text-white rounded-2xl font-bold text-sm
                         shadow-md shadow-amber-200 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {demoLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {t.demoLoading}
                </span>
              ) : t.demoBtn}
            </button>
          </div>
        )}

        {/* ── 優先食材 ── */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-white rounded-2xl card-shadow animate-pulse" />)}
          </div>
        ) : priorityItems.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {t.homePriorityTitle}
            </h2>
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
          </section>
        )}

        {/* ── レシピ ── */}
        {recipes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t.homeTodayTitle}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center active:bg-gray-200"
                >−</button>
                <span className="text-sm font-bold text-gray-800 w-14 text-center">
                  {t.homeServings(servings)}
                </span>
                <button
                  onClick={() => setServings((s) => Math.min(6, s + 1))}
                  className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center active:bg-amber-200"
                >＋</button>
              </div>
            </div>
            <div className="space-y-3">
              {recipes.map((r, i) => (
                <RecipeCard key={i} recipe={r} index={i} servings={servings} onCooked={handleCooked} />
              ))}
              {sideDish && (
                <p className="text-xs text-center text-amber-700 bg-amber-50 rounded-xl py-2.5 px-3 font-medium">
                  {sideDish}
                </p>
              )}
              <button
                onClick={() => setRecipes([])}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                {t.homeRegenerate}
              </button>
            </div>
          </section>
        )}

        {/* ── 残り物リメークAI ── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            残り物リメーク
          </h2>
          <RemakeCard />
        </section>

        {/* ── 即席ラーメンアレンジAI ── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            即席ラーメンアレンジ
          </h2>
          <RamenRemakeCard />
        </section>
      </div>

      <CharacterHUD
        items={allItems.map((i) => ({ name: i.name, daysLeft: i.expiryDays }))}
        fridgeScore={fridgeScore}
      />
      <BottomNav />

      {/* ── 食材編集モーダル ── */}
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
