"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchItems } from "@/lib/api";
import type { FoodItem } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useT } from "@/lib/LangContext";

const STAPLES_BY_GROUP = [
  { group: "野菜・果物", emoji: "🥬", items: [
    "キャベツ", "にんじん", "たまねぎ", "ほうれん草", "小松菜", "ブロッコリー",
    "トマト", "きゅうり", "なす", "ピーマン", "アスパラガス", "レタス",
    "もやし", "長ねぎ", "にんにく", "しょうが", "りんご", "バナナ", "みかん",
  ]},
  { group: "きのこ", emoji: "🍄", items: [
    "しめじ", "えのき", "エリンギ", "しいたけ", "まいたけ",
  ]},
  { group: "芋類", emoji: "🥔", items: [
    "じゃがいも", "さつまいも", "さといも", "長芋",
  ]},
  { group: "お魚", emoji: "🐟", items: [
    "サーモン", "まぐろ", "さば", "鮭", "あじ", "いわし",
    "えび", "いか", "あさり", "しじみ", "ツナ缶",
  ]},
  { group: "お肉", emoji: "🥩", items: [
    "鶏もも肉", "鶏胸肉", "鶏ささみ", "手羽先", "鶏ひき肉",
    "豚バラ肉", "豚ロース", "豚こま切れ", "豚ひき肉",
    "牛バラ肉", "牛こま切れ", "牛ひき肉", "合挽き肉",
    "ベーコン", "ウインナー", "ハム",
  ]},
  { group: "乳製品・卵", emoji: "🥚", items: [
    "卵", "牛乳", "豆腐", "納豆", "バター", "チーズ", "ヨーグルト", "豆乳", "生クリーム",
  ]},
  { group: "主食", emoji: "🍚", items: [
    "白米", "食パン", "うどん", "そば", "パスタ",
  ]},
  { group: "調味料", emoji: "🧂", items: [
    "醤油", "みりん", "料理酒", "塩", "砂糖", "味噌",
    "マヨネーズ", "ケチャップ", "ソース", "ポン酢", "めんつゆ",
  ]},
  { group: "スパイス", emoji: "🌶️", items: [
    "こしょう", "一味唐辛子", "七味唐辛子", "カレー粉", "ガーリックパウダー",
  ]},
  { group: "食用油", emoji: "🫙", items: [
    "サラダ油", "ごま油", "オリーブオイル",
  ]},
  { group: "缶詰・瓶詰め", emoji: "🥫", items: [
    "コーン缶", "トマト缶", "さば缶", "ツナ缶", "大豆水煮", "はちみつ",
  ]},
  { group: "レトルト", emoji: "🍱", items: [
    "パックご飯", "レトルトカレー", "インスタントラーメン", "パスタソース",
  ]},
  { group: "冷凍食品", emoji: "🧊", items: [
    "冷凍餃子", "冷凍枝豆", "冷凍唐揚げ", "冷凍コーン", "冷凍ほうれん草",
    "冷凍うどん", "アイスクリーム",
  ]},
  { group: "飲み物", emoji: "🥤", items: [
    "ミネラルウォーター", "お茶", "コーヒー", "オレンジジュース",
  ]},
];

type Priority = "need" | "soon";

interface ShopEntry {
  name: string;
  priority: Priority;
  expiryDays: number;
}

export default function ShoppingPage() {
  const t = useT();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await fetchItems()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const inventoryNames = new Set(items.map((i) => i.name));

  const urgentList: ShopEntry[] = items
    .filter((i) => i.expiryDays <= 2)
    .map((i) => ({ name: i.name, priority: "need", expiryDays: i.expiryDays }));

  const soonList: ShopEntry[] = items
    .filter((i) => i.expiryDays > 2 && i.expiryDays <= 7)
    .map((i) => ({ name: i.name, priority: "soon", expiryDays: i.expiryDays }));

  // ジャンル別ついで買いリスト
  const extraByGroup = STAPLES_BY_GROUP.map((g) => ({
    ...g,
    missing: g.items.filter((s) => !inventoryNames.has(s)),
  })).filter((g) => g.missing.length > 0);

  const totalExtra = extraByGroup.reduce((sum, g) => sum + g.missing.length, 0);

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function renderUrgentItem(entry: ShopEntry) {
    const done = checked.has(entry.name);
    const cfg = entry.priority === "need"
      ? { ring: "border-red-100", dot: "bg-red-500" }
      : { ring: "border-amber-100", dot: "bg-amber-400" };
    return (
      <button
        key={entry.name}
        onClick={() => toggle(entry.name)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
          done ? "bg-gray-100 border-gray-200 opacity-40" : `bg-white ${cfg.ring} card-shadow`
        }`}
      >
        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
          done ? "bg-gray-400 border-gray-400" : `${cfg.dot} border-transparent`
        }`}>
          {done && <span className="text-white text-[8px] font-bold">✓</span>}
        </span>
        <span className={`font-semibold text-sm flex-1 ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
          {entry.name}
        </span>
        {!done && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            entry.expiryDays <= 1 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
          }`}>
            あと{entry.expiryDays}日
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-32">
      <div className="gradient-header px-5 pt-12 pb-8">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t.shopSubtitle}</p>
        <h1 className="text-white text-3xl font-bold">{t.shopTitle}</h1>
        <p className="text-white/70 text-sm mt-1">{t.shopDesc}</p>
      </div>

      <div className="px-4 -mt-4 space-y-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-2xl animate-pulse card-shadow" />
          ))
        ) : (
          <>
            {/* ── 今すぐ必要 ── */}
            {urgentList.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.shopNeed}</span>
                  <span className="text-xs text-gray-400">{urgentList.length}</span>
                </div>
                <div className="space-y-2">
                  {urgentList.map((e) => renderUrgentItem(e))}
                </div>
              </section>
            )}

            {/* ── そろそろ ── */}
            {soonList.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.shopSoon}</span>
                  <span className="text-xs text-gray-400">{soonList.length}</span>
                </div>
                <div className="space-y-2">
                  {soonList.map((e) => renderUrgentItem(e))}
                </div>
              </section>
            )}

            {/* ── ついで買い（ジャンル別） ── */}
            {extraByGroup.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.shopExtra}</span>
                  <span className="text-xs text-gray-400">{totalExtra}</span>
                </div>

                <div className="space-y-4">
                  {extraByGroup.map((g) => (
                    <div key={g.group}>
                      {/* カテゴリヘッダー */}
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <span className="text-base">{g.emoji}</span>
                        <span className="text-xs font-bold text-gray-600">{g.group}</span>
                        <span className="text-[11px] text-gray-400 ml-auto">{g.missing.length}品</span>
                      </div>

                      {/* アイテム — コンパクト横並びチップ */}
                      <div className="flex flex-wrap gap-1.5">
                        {g.missing.map((name) => {
                          const done = checked.has(name);
                          return (
                            <button
                              key={name}
                              onClick={() => toggle(name)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                done
                                  ? "bg-gray-100 border-gray-200 text-gray-400 line-through opacity-50"
                                  : "bg-white border-gray-200 text-gray-700 card-shadow active:scale-95"
                              }`}
                            >
                              {done && <span className="text-[10px]">✓</span>}
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {urgentList.length === 0 && soonList.length === 0 && extraByGroup.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center card-shadow mt-4">
                <p className="text-5xl mb-3">🛒</p>
                <p className="text-gray-500 text-base font-semibold">{t.shopEmpty}</p>
                <p className="text-gray-400 text-sm mt-1">食材が十分あります</p>
              </div>
            )}
          </>
        )}
      </div>

      {checked.size > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
          <button
            onClick={() => setChecked(new Set())}
            className="w-full py-3.5 bg-gray-800 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
          >
            {t.shopClear}（{checked.size}件）
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
