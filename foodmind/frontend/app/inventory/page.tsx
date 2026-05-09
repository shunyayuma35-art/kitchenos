"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchItems, consumeItem, deleteItem } from "@/lib/api";
import type { FoodItem, Category } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import DailyCharacter from "@/components/DailyCharacter";
import { useT } from "@/lib/LangContext";

type Tab = Category | "all";

function expiryBadge(days: number) {
  if (days <= 1) return "bg-red-100 text-red-600 font-bold";
  if (days <= 2) return "bg-orange-100 text-orange-600 font-semibold";
  if (days <= 5) return "bg-amber-100 text-amber-600";
  return "bg-gray-100 text-gray-500";
}

const CATEGORY_BADGE: Record<Category, string> = {
  fridge:    "bg-sky-100 text-sky-700",
  freezer:   "bg-cyan-100 text-cyan-700",
  vegetable: "bg-lime-100 text-lime-700",
  pantry:    "bg-orange-100 text-orange-700",
};

export default function InventoryPage() {
  const t = useT();
  const [items, setItems]     = useState<FoodItem[]>([]);
  const [tab, setTab]         = useState<Tab>("all");
  const [loading, setLoading] = useState(true);

  const TABS: { label: string; value: Tab; icon: string }[] = [
    { label: t.invTabAll,    value: "all",       icon: "🗂" },
    { label: t.catFridge,    value: "fridge",    icon: "❄️" },
    { label: t.catFreezer,   value: "freezer",   icon: "🧊" },
    { label: t.catVegetable, value: "vegetable", icon: "🥬" },
    { label: t.catPantry,    value: "pantry",    icon: "📦" },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await fetchItems()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === "all" ? items : items.filter((i) => i.category === tab);

  async function handleConsume(item: FoodItem) {
    await consumeItem({ foodId: item.id, amount: 1 });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t.invDeleteConfirm)) return;
    await deleteItem(id);
    load();
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      <div className="gradient-header px-5 pt-12 pb-8">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t.invSubtitle}</p>
        <h1 className="text-white text-3xl font-bold">{t.invTitle}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-white/70 text-sm">{t.invNItems(items.length)}</span>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* フィルタータブ（横スクロール対応） */}
        <div className="bg-white rounded-2xl p-1.5 card-shadow flex gap-1 mb-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tb) => (
            <button
              key={tb.value}
              onClick={() => setTab(tb.value)}
              className={`shrink-0 flex-1 min-w-[56px] py-2.5 rounded-xl text-xs font-semibold transition-all ${
                tab === tb.value ? "bg-emerald-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="block text-base">{tb.icon}</span>
              {tb.label}
              {tb.value !== "all" && (
                <span className="ml-0.5 opacity-70">{items.filter((i) => i.category === tb.value).length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse card-shadow" />
            ))
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center card-shadow">
              <DailyCharacter />
              <p className="text-gray-400 text-base">{t.invEmpty}</p>
            </div>
          ) : (
            filtered
              .sort((a, b) => a.expiryDays - b.expiryDays)
              .map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 card-shadow animate-slide-up flex items-center gap-3"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className={`w-1.5 self-stretch rounded-full ${
                    item.expiryDays <= 2 ? "bg-red-400" :
                    item.expiryDays <= 5 ? "bg-amber-400" : "bg-emerald-400"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-gray-800 text-base">{item.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_BADGE[item.category]}`}>
                        {TABS.find((tb) => tb.value === item.category)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400">×{item.quantity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${expiryBadge(item.expiryDays)}`}>
                        {item.expiryDays <= 1 ? t.invToday : t.invDaysLeft(item.expiryDays)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleConsume(item)}
                      className="text-sm px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl
                                 border border-emerald-200 font-semibold active:bg-emerald-100 min-w-[52px]"
                    >
                      {t.invConsume}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm px-4 py-2 bg-red-50 text-red-500 rounded-xl
                                 border border-red-200 font-semibold active:bg-red-100 min-w-[52px]"
                    >
                      {t.invDelete}
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
