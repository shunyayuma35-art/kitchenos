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
import { useT, useLang } from "@/lib/LangContext";
import { LANG_META, type Lang } from "@/lib/i18n";
import { loadExcludedAllergens, getAllergenNamesFromKeys } from "@/lib/allergens";
import { rt, getFallbackRecipes, translateRecipe } from "@/utils/recipe_translations";
import {
  getPoints, addPoints, checkInToday, markCooked,
  getLevel, getNextLevelPts, POINTS, type PointsState,
} from "@/lib/points";

// ② 画像リサイズ（最大1024px・JPEG変換）—— vision送信前処理
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

// ルールベース「あと1品」提案（AI不使用・超軽量）
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

  const [pts, setPts]                   = useState<PointsState>(() =>
    typeof window !== "undefined" ? getPoints() : { total: 0, streakDays: 0, lastVisitDate: "", cookedToday: [] }
  );
  const [servings, setServings]         = useState(1);
  const [editingItem, setEditingItem]   = useState<FoodItem | null>(null);
  const [editQty, setEditQty]           = useState(1);
  const [editDays, setEditDays]         = useState(3);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoCount, setPhotoCount]     = useState(0);
  const [langOpen, setLangOpen]         = useState(false);
  const cameraRef        = useRef<HTMLInputElement>(null);
  const lastGenParams    = useRef<{ priority: string[]; all: string[] } | null>(null);

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
    setPhotoCount(getFridgePhotoCount());
    // チェックイン（初回ログイン時のみポイント加算）
    const { state } = checkInToday();
    setPts(state);
  }, [loadData]);

  // 料理完了ハンドラ — 食材消費 + ポイント + スコア再計算
  async function handleCooked(recipe: Recipe) {
    // 1. ポイントはRecipeCard側のmarkCookedで加算済み → stateだけ同期
    setPts(getPoints());

    // 2. レシピ食材と在庫を名前で照合して消費
    const toConsume = recipe.ingredients
      .map((ing) => allItems.find((item) => ing.includes(item.name)))
      .filter((item): item is FoodItem => item !== undefined);

    // 3. 期限2日以内の食材を消費したらボーナスP
    const urgentConsumed = toConsume.filter((i) => i.expiryDays <= 2);
    if (urgentConsumed.length > 0) {
      addPoints(POINTS.EXPIRE_SAVE * urgentConsumed.length);
      setPts(getPoints());
    }

    await Promise.all(toConsume.map((item) =>
      consumeItem({ foodId: item.id, amount: 1 })
    ));

    // 4. 冷蔵庫データを再取得してスコアを更新
    await loadData();

    // 5. スコア90点ボーナス判定（loadData後に fridgeScore が変わるので useEffect 経由でなく直接判定）
    const freshItems = await fetchItems();
    const newScore = Math.max(0, Math.min(100,
      100
      - freshItems.filter((i) => i.expiryDays <= 2).length * 20
      - freshItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 7).length * 8
    ));
    if (newScore >= 90) {
      addPoints(POINTS.SCORE_90);
      setPts(getPoints());
    }
  }

  // 言語切り替え：UIを即時更新し、レシピがある場合は同じ食材で再生成
  // lastGenParams がなければ現在の優先食材リストで代替
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
    const pri = items ?? priorityItems;
    const allI = all ?? allItems;
    if (pri.length === 0) return;
    setLoadingRecipes(true);
    setError("");
    try {
      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const photoItems = getFridgePhotoItems();
      const priorityNames = Array.from(new Set([...pri.map((i) => i.name), ...photoItems]));
      const allNames = Array.from(new Set([...allI.map((i) => i.name), ...photoItems]));
      const { recipes } = await generateRecipes(priorityNames, allNames, excluded, lang);
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
      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const priorityNames = d.priorityItems.map((i) => i.name);
      const allNames = items.map((i) => i.name);
      const { recipes } = await generateRecipes(priorityNames, allNames, excluded, lang);
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
    // ① 複数ファイル対応・空ファイル除外
    const files = Array.from(e.target.files || []).filter((f) => f.size > 0);
    if (files.length === 0) {
      setError("画像ファイルが空です。もう一度撮影してください。");
      return;
    }

    setPhotoLoading(true);
    setError("");
    try {
      // ① 全画像を並列処理（Promise.allSettled → 1枚失敗しても継続）
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const { base64, mediaType } = await resizeImage(file);
          const result = await visionIdentify(base64, mediaType);
          saveFridgePhoto(base64, mediaType, result.items.map((i) => i.name));
          return result.items;
        })
      );

      setPhotoCount(getFridgePhotoCount());

      // ② fulfilled のみ取り出し → フラット化 → 重複削除
      const allIdentified = results
        .filter((r): r is PromiseFulfilledResult<IdentifiedItem[]> => r.status === "fulfilled")
        .flatMap((r) => r.value);
      const names = Array.from(new Set(allIdentified.map((i) => i.name)));

      // ③ フォールバック：写真識別0件 → 在庫食材 → 最低限
      const existingItems = allItems.map((i) => i.name);
      const priorityNames =
        names.length > 0         ? names :
        existingItems.length > 0 ? existingItems :
        ["卵", "ご飯"];

      // ⑤⑥ generateRecipes を個別 try/catch で囲む → 失敗でも必ずレシピ表示
      const excluded = getAllergenNamesFromKeys(loadExcludedAllergens());
      const combined = Array.from(new Set([...priorityNames, ...existingItems]));
      let recipes: Recipe[];
      try {
        const result = await generateRecipes(priorityNames, combined, excluded, lang);
        lastGenParams.current = { priority: priorityNames, all: combined };
        recipes = result.recipes;
      } catch {
        recipes = getFallbackRecipes(lang);
      }
      setRecipes(recipes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`写真エラー: ${msg}`);
    } finally {
      setPhotoLoading(false);
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  const isEmpty = !loading && allItems.length === 0;
  const sideDish = suggestSideDish(recipes.flatMap((r) => r.ingredients), lang);

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      {/* 言語ドロップダウン外クリック閉じ */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
      {/* ── ヘッダー ── */}
      <div className="gradient-header px-5 pt-12 pb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t.homeSubtitle}</p>
            <h1 className="text-white text-2xl font-bold tracking-tight">食材を入れる</h1>
            <p className="text-white/50 text-xs mt-0.5">冷蔵庫に登録</p>
            <p className="text-white/60 text-xs mt-2">{today}</p>
            {/* ポイント・レベル表示 */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1">
                <span className="text-amber-300 text-sm">⭐</span>
                <span className="text-white font-black text-sm">{pts.total}P</span>
                <span className="text-white/50 text-[10px] ml-0.5">Lv{getLevel(pts.total)}</span>
              </div>
              {pts.streakDays >= 2 && (
                <div className="flex items-center gap-1 bg-white/20 rounded-xl px-2.5 py-1">
                  <span className="text-orange-300 text-sm">🔥</span>
                  <span className="text-white text-[11px] font-bold">{pts.streakDays}日</span>
                </div>
              )}
              {(() => {
                const next = getNextLevelPts(pts.total);
                if (!next) return <span className="text-amber-300 text-[10px] font-bold">MAX!</span>;
                const pct = Math.round((pts.total / next) * 100);
                return (
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                );
              })()}
            </div>
          </div>
          {/* 言語セレクタ */}
          <div className="relative mt-1">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40
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

        {/* 冷蔵庫スコア */}
        {!loading && allItems.length > 0 && (
          <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{t.homeFridgeScore}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-white text-2xl font-black">{fridgeScore}点</span>
                <span className={`text-sm font-bold ${scoreMeta.color}`}>{scoreMeta.label}</span>
              </div>
            </div>
            {savingsCount > 0 && (
              <p className="text-white/70 text-xs text-right leading-snug">
                {t.homeSavingsDesc(savingsCount)}
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
              <span className="text-3xl shrink-0 animate-puru-puru inline-block">🥺</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-red-500 text-base truncate">
                  {urgentItems.map((i) => i.name).slice(0, 3).join(t.nameSep)}
                  　{t.homeUrgentLabel}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t.homeUrgentTap}</p>
              </div>
            </div>
          </button>
        )}
        {warningItems.length > 0 && urgentItems.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 animate-slide-up flex items-center gap-3">
            <span className="text-2xl shrink-0 animate-yura-yura inline-block">🥕</span>
            <p className="text-amber-700 font-semibold text-sm">
              {t.homeWarning(warningItems.map((i) => i.name).slice(0, 3).join(t.nameSep))}
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

              <div className="relative w-16 shrink-0">
                <button
                  onClick={() => cameraRef.current?.click()}
                  disabled={loadingRecipes || photoLoading}
                  title="写真から献立を考える"
                  className="w-full h-full min-h-[60px] rounded-2xl bg-white border border-amber-200 text-amber-600
                             shadow-md shadow-amber-100 text-2xl flex items-center justify-center
                             disabled:opacity-40 active:scale-95 transition-all"
                >
                  {photoLoading
                    ? <span className="animate-spin w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full inline-block" />
                    : "📸"}
                </button>
                {photoCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white
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
            </div>
          ) : (
            <div className="space-y-3">
              {/* 人数セレクター */}
              <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2.5 card-shadow">
                <span className="text-xs font-semibold text-gray-500">{t.homeServingNote}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-base flex items-center justify-center active:bg-gray-200"
                  >−</button>
                  <span className="text-sm font-bold text-gray-800 w-16 text-center">{t.homeServings(servings)}</span>
                  <button
                    onClick={() => setServings((s) => Math.min(6, s + 1))}
                    className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-base flex items-center justify-center active:bg-amber-200"
                  >＋</button>
                </div>
              </div>
              {recipes.map((r, i) => (
                <RecipeCard key={i} recipe={r} index={i} servings={servings} onCooked={handleCooked} />
              ))}
              {sideDish && (
                <p className="text-xs text-center text-amber-700 bg-amber-50 rounded-xl py-2.5 px-3 font-medium">
                  {sideDish}
                </p>
              )}
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
