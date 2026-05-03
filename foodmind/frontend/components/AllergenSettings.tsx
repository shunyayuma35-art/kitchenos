"use client";

import { useState, useEffect } from "react";
import {
  MANDATORY_ALLERGENS, RECOMMENDED_ALLERGENS,
  loadExcludedAllergens, saveExcludedAllergens,
  type AllergenKey,
} from "@/lib/allergens";

export default function AllergenSettings() {
  const [open, setOpen] = useState(false);
  const [excluded, setExcluded] = useState<AllergenKey[]>([]);

  useEffect(() => {
    setExcluded(loadExcludedAllergens());
  }, []);

  function toggle(key: AllergenKey) {
    const next = excluded.includes(key)
      ? excluded.filter((k) => k !== key)
      : [...excluded, key];
    setExcluded(next);
    saveExcludedAllergens(next);
  }

  const count = excluded.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[76px] left-4 z-40 flex items-center gap-1.5
                   bg-white border border-amber-200 shadow-md rounded-2xl
                   px-3 py-2 text-xs font-bold text-amber-700"
      >
        ⚠️ アレルゲン
        {count > 0 && (
          <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
             onClick={() => setOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-3xl max-h-[80vh] flex flex-col"
               onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <h2 className="font-bold text-lg text-gray-800">アレルゲン設定</h2>
              <p className="text-xs text-gray-400 mt-1">除外したいアレルゲンを選択してください</p>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                  義務表示（10品目）
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MANDATORY_ALLERGENS.map((a) => {
                    const on = excluded.includes(a.key);
                    return (
                      <button
                        key={a.key}
                        onClick={() => toggle(a.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                          on
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        <span>{a.emoji}</span>
                        <span>{a.name}</span>
                        {on && <span className="ml-auto text-red-400 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
                  推奨表示（18品目）
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {RECOMMENDED_ALLERGENS.map((a) => {
                    const on = excluded.includes(a.key);
                    return (
                      <button
                        key={a.key}
                        onClick={() => toggle(a.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                          on
                            ? "bg-orange-50 border-orange-300 text-orange-700"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        <span>{a.emoji}</span>
                        <span className="truncate">{a.name}</span>
                        {on && <span className="ml-auto text-orange-400 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold"
              >
                設定を保存 {count > 0 ? `（${count}件除外中）` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
