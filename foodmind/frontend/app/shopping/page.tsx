"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

interface MemoItem {
  id: string;
  text: string;
  done: boolean;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

function loadMemos(): MemoItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("shop_memos") || "[]"); }
  catch { return []; }
}

export default function ShoppingPage() {
  const t = useT();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const [memos, setMemos] = useState<MemoItem[]>(loadMemos);
  const [memoInput, setMemoInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem("shop_memos", JSON.stringify(memos));
  }, [memos]);

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

  const extraByGroup = STAPLES_BY_GROUP.map((g) => ({
    ...g,
    missing: g.items.filter((s) => !inventoryNames.has(s)),
  })).filter((g) => g.missing.length > 0);

  const totalExtra = extraByGroup.reduce((sum, g) => sum + g.missing.length, 0);
  const filteredGroups = activeGroup ? extraByGroup.filter((g) => g.group === activeGroup) : extraByGroup;

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function addMemo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMemos((prev) => [...prev, { id: Date.now().toString(), text: trimmed, done: false }]);
    setMemoInput("");
  }

  function toggleMemo(id: string) {
    setMemos((prev) => prev.map((m) => m.id === id ? { ...m, done: !m.done } : m));
  }

  function deleteMemo(id: string) {
    setMemos((prev) => prev.filter((m) => m.id !== id));
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("音声入力はこのブラウザでは利用できません（Chrome/Safariをお試しください）");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "ja-JP";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      addMemo(text);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setIsListening(false);
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

  const pendingMemos = memos.filter((m) => !m.done).length;

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

            {/* ── 買い物メモ ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">買い物メモ</span>
                {pendingMemos > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">{pendingMemos}</span>
                )}
              </div>

              {/* 入力エリア */}
              <div className="bg-white rounded-2xl p-3 card-shadow space-y-2">
                <div className="flex gap-2">
                  <input
                    value={memoInput}
                    onChange={(e) => setMemoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addMemo(memoInput); }}
                    placeholder="メモを入力… (例: しょうゆ 濃口)"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-300 focus:bg-white transition-colors"
                  />
                  <button
                    onClick={isListening ? stopVoice : startVoice}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                      isListening
                        ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
                        : "bg-gray-50 border-gray-200 text-gray-500 active:scale-95"
                    }`}
                  >
                    <span className="text-lg leading-none">{isListening ? "⏹" : "🎙️"}</span>
                  </button>
                  <button
                    onClick={() => addMemo(memoInput)}
                    disabled={!memoInput.trim()}
                    className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-95 transition-all text-xl font-bold shadow-sm"
                  >
                    +
                  </button>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-500 font-medium">聞いています… 話しかけてください</span>
                  </div>
                )}

                {/* メモリスト */}
                {memos.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {memos.map((memo) => (
                      <div
                        key={memo.id}
                        className={`flex items-center gap-2 px-2 py-2 rounded-xl transition-all ${
                          memo.done ? "opacity-40" : "bg-gray-50"
                        }`}
                      >
                        <button
                          onClick={() => toggleMemo(memo.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            memo.done ? "bg-gray-400 border-gray-400" : "border-gray-300 active:scale-90"
                          }`}
                        >
                          {memo.done && <span className="text-white text-[9px] font-bold">✓</span>}
                        </button>
                        <span className={`flex-1 text-sm ${memo.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {memo.text}
                        </span>
                        <button
                          onClick={() => deleteMemo(memo.id)}
                          className="text-gray-300 active:text-red-400 text-lg leading-none px-1 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center border-t border-gray-100">
                    <p className="text-gray-400 text-xs">🎙️ マイクボタンで話すか、入力してメモ追加</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── ついで買い（ジャンル別）── */}
            {extraByGroup.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.shopExtra}</span>
                  <span className="text-xs text-gray-400">{totalExtra}</span>
                </div>

                {/* カテゴリフィルターチップ */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      activeGroup === null
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    すべて
                  </button>
                  {extraByGroup.map((g) => (
                    <button
                      key={g.group}
                      onClick={() => setActiveGroup(activeGroup === g.group ? null : g.group)}
                      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        activeGroup === g.group
                          ? "bg-gray-800 text-white border-gray-800"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      <span>{g.emoji}</span>
                      <span>{g.group}</span>
                    </button>
                  ))}
                </div>

                {/* グループカード */}
                <div className="space-y-3">
                  {filteredGroups.map((g) => (
                    <div key={g.group} className="bg-white rounded-2xl p-3 card-shadow">
                      {/* カテゴリヘッダー */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-xl leading-none">{g.emoji}</span>
                        <span className="text-sm font-bold text-gray-700">{g.group}</span>
                        <span className="text-[11px] text-gray-400 ml-auto bg-gray-100 px-2 py-0.5 rounded-full">
                          {g.missing.length}品
                        </span>
                      </div>

                      {/* アイテムチップ */}
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
                                  : "bg-orange-50 border-orange-100 text-gray-700 active:scale-95 active:bg-orange-100"
                              }`}
                            >
                              {done && <span className="text-orange-400 text-[10px]">✓</span>}
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

            {urgentList.length === 0 && soonList.length === 0 && extraByGroup.length === 0 && memos.length === 0 && (
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
