"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchItems } from "@/lib/api";
import type { FoodItem } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useT } from "@/lib/LangContext";

const STAPLES = [
  // 🥬 野菜・果物
  "キャベツ", "にんじん", "たまねぎ", "ほうれん草", "小松菜", "ブロッコリー",
  "トマト", "きゅうり", "なす", "ピーマン", "アスパラガス", "レタス",
  "もやし", "長ねぎ", "にんにく", "しょうが", "じゃがいも",
  "りんご", "バナナ", "みかん",
  // 🍄 きのこ
  "しめじ", "えのき", "エリンギ", "しいたけ", "まいたけ",
  // 🥔 芋類
  "さつまいも", "里芋", "長芋",
  // 🐟 お魚
  "サーモン", "まぐろ", "さば", "鮭", "あじ", "いわし",
  "えび", "いか", "あさり", "しじみ", "ツナ缶",
  // 🥩 お肉
  "鶏もも肉", "鶏むね肉", "手羽先", "手羽元", "鶏ささみ", "鶏ひき肉",
  "豚バラ肉", "豚ロース", "豚肩ロース", "豚こま切れ", "豚ひき肉", "豚もも肉",
  "牛バラ肉", "牛ロース", "牛もも肉", "牛こま切れ", "牛ひき肉",
  "合挽き肉", "牛豚合挽き",
  // 🥚 乳製品・卵
  "卵", "牛乳", "豆腐", "納豆", "バター", "チーズ", "ヨーグルト",
  "豆乳", "生クリーム",
  // 🧂 調味料
  "醤油", "みりん", "料理酒", "塩", "砂糖", "味噌",
  "マヨネーズ", "ケチャップ", "ソース", "ポン酢", "めんつゆ",
  // 🌶️ スパイス
  "こしょう", "一味唐辛子", "七味唐辛子", "カレー粉", "ガーリックパウダー",
  "ナツメグ", "シナモン", "パプリカパウダー",
  // 🫙 食用油
  "サラダ油", "ごま油", "オリーブオイル", "バター",
  // 🥫 缶詰・瓶詰め
  "コーン缶", "大豆水煮", "トマト缶", "さば缶", "いわし缶",
  "ジャム", "はちみつ",
  // 🍱 レトルト
  "パックご飯", "レトルトカレー", "インスタントラーメン", "パスタソース",
  // 🧊 冷凍食品
  "冷凍餃子", "冷凍枝豆", "冷凍唐揚げ", "冷凍コーン", "冷凍ほうれん草",
  "冷凍うどん", "アイスクリーム",
  // 🥤 飲み物
  "ミネラルウォーター", "お茶", "コーヒー", "オレンジジュース", "牛乳",
  // 主食
  "白米", "食パン", "うどん", "そば", "パスタ",
];

type Priority = "need" | "soon" | "extra";

interface ShopEntry {
  name: string;
  priority: Priority;
  expiryDays?: number;
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

  const shopList: ShopEntry[] = [
    ...items
      .filter((i) => i.expiryDays <= 2)
      .map((i) => ({ name: i.name, priority: "need" as Priority, expiryDays: i.expiryDays })),
    ...items
      .filter((i) => i.expiryDays > 2 && i.expiryDays <= 7)
      .map((i) => ({ name: i.name, priority: "soon" as Priority, expiryDays: i.expiryDays })),
    ...STAPLES
      .filter((s) => !inventoryNames.has(s))
      .map((s) => ({ name: s, priority: "extra" as Priority })),
  ].filter((e, idx, arr) => arr.findIndex((x) => x.name === e.name) === idx);

  const need  = shopList.filter((e) => e.priority === "need");
  const soon  = shopList.filter((e) => e.priority === "soon");
  const extra = shopList.filter((e) => e.priority === "extra");

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const SECTION_CONFIG = {
    need:  { label: t.shopNeed,  dot: "bg-red-500",   ring: "border-red-100"   },
    soon:  { label: t.shopSoon,  dot: "bg-amber-400", ring: "border-amber-100" },
    extra: { label: t.shopExtra, dot: "bg-gray-300",  ring: "border-gray-100"  },
  };

  function renderSection(entries: ShopEntry[], priority: Priority) {
    if (entries.length === 0) return null;
    const cfg = SECTION_CONFIG[priority];
    return (
      <section key={priority}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cfg.label}</span>
          <span className="text-xs text-gray-400">{entries.length}</span>
        </div>
        <div className="space-y-2">
          {entries.map((entry) => {
            const done = checked.has(entry.name);
            return (
              <button
                key={entry.name}
                onClick={() => toggle(entry.name)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                  done
                    ? "bg-gray-100 border-gray-200 opacity-40"
                    : `bg-white ${cfg.ring} card-shadow`
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  done ? "bg-gray-400 border-gray-400" : "border-gray-300"
                }`}>
                  {done && <span className="text-white text-[9px] font-bold">✓</span>}
                </span>
                <span className={`font-semibold text-base flex-1 ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {entry.name}
                </span>
                {entry.expiryDays !== undefined && !done && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    entry.expiryDays <= 1 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                  }`}>
                    あと{entry.expiryDays}日
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
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
        ) : shopList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center card-shadow mt-4">
            <p className="text-5xl mb-3">🛒</p>
            <p className="text-gray-500 text-base font-semibold">{t.shopEmpty}</p>
            <p className="text-gray-400 text-sm mt-1">食材が十分あります</p>
          </div>
        ) : (
          <>
            {renderSection(need,  "need")}
            {renderSection(soon,  "soon")}
            {renderSection(extra, "extra")}
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
