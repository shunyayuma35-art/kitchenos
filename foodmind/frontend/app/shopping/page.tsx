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

interface CartItem {
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

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("shop_cart") || "[]"); }
  catch { return []; }
}

export default function ShoppingPage() {
  const t = useT();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // 統合カート：チップ選択もテキスト入力も全部ここに入る
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [memoInput, setMemoInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem("shop_cart", JSON.stringify(cart));
  }, [cart]);

  const load = useCallback(async () => {
    try { setItems(await fetchItems()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const inventoryNames = new Set(items.map((i) => i.name));

  const extraByGroup = STAPLES_BY_GROUP.map((g) => ({
    ...g,
    missing: g.items.filter((s) => !inventoryNames.has(s)),
  })).filter((g) => g.missing.length > 0);

  const totalExtra = extraByGroup.reduce((sum, g) => sum + g.missing.length, 0);
  const filteredGroups = activeGroup ? extraByGroup.filter((g) => g.group === activeGroup) : extraByGroup;

  // カートにあるか確認
  const inCart = (text: string) => cart.some((c) => c.text === text);

  // チップタップ → カートに追加/削除（トグル）
  function toggleStaple(name: string) {
    const existing = cart.find((c) => c.text === name);
    if (existing) {
      setCart((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      setCart((prev) => [...prev, { id: `${Date.now()}-${name}`, text: name, done: false }]);
    }
  }

  // テキスト/音声入力 → カートに追加
  function addToCart(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (inCart(trimmed)) return; // 重複防止
    setCart((prev) => [...prev, { id: `${Date.now()}-memo`, text: trimmed, done: false }]);
    setMemoInput("");
  }

  function toggleDone(id: string) {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, done: !c.done } : c));
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function clearDone() {
    setCart((prev) => prev.filter((c) => !c.done));
  }

  function startVoice() {
    setVoiceError(null);
    setInterimText("");

    // HTTPSチェック（localhost / 127.0.0.1 は除外）
    const host = location.hostname;
    const isSecure = location.protocol === "https:" || host === "localhost" || host === "127.0.0.1";
    if (!isSecure) {
      setVoiceError("音声入力はHTTPS環境が必要です。Vercelの本番URLでお試しください。");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("このブラウザは音声入力非対応です（Chrome / Safari をお試しください）");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "ja-JP";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript as string;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim);
      if (final) {
        addToCart(final);
        setInterimText("");
        setIsListening(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      const msgs: Record<string, string> = {
        "not-allowed": "マイクが許可されていません。ブラウザのアドレスバー横の🔒からマイクを許可してください。",
        "no-speech": "声が検出されませんでした。もう少し大きな声でお試しください。",
        "network": "音声入力はVercelなどのHTTPS本番環境でのみ動作します。\nテキスト入力をご利用ください。",
        "audio-capture": "マイクが見つかりません。端末のマイクを確認してください。",
        "aborted": "",
      };
      const msg = msgs[e.error as string] ?? `音声エラー: ${e.error}`;
      if (msg) setVoiceError(msg);
      setInterimText("");
      setIsListening(false);
    };

    rec.onend = () => {
      setInterimText("");
      setIsListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setVoiceError("音声入力を開始できませんでした。");
    }
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setInterimText("");
    setIsListening(false);
  }

  const pendingCount = cart.filter((c) => !c.done).length;
  const doneCount = cart.filter((c) => c.done).length;

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
            {/* ── ついで買い（ジャンル別）── */}
            {extraByGroup.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.shopExtra}</span>
                  <span className="text-xs text-gray-400">{totalExtra}</span>
                </div>

                {/* カテゴリチップ — flex-wrap 全件表示 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
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
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
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

                {/* アイテムカード — カテゴリ選択時のみ表示 */}
                {activeGroup && (
                  <div className="space-y-3">
                    {filteredGroups.map((g) => (
                      <div key={g.group} className="bg-white rounded-2xl p-3 card-shadow">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xl leading-none">{g.emoji}</span>
                          <span className="text-sm font-bold text-gray-700">{g.group}</span>
                          <span className="text-[11px] text-gray-400 ml-auto bg-gray-100 px-2 py-0.5 rounded-full">
                            {g.missing.length}品
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {g.missing.map((name) => {
                            const selected = inCart(name);
                            return (
                              <button
                                key={name}
                                onClick={() => toggleStaple(name)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border active:scale-95 ${
                                  selected
                                    ? "bg-orange-500 border-orange-500 text-white"
                                    : "bg-orange-50 border-orange-100 text-gray-700"
                                }`}
                              >
                                {selected && <span className="text-[10px]">✓</span>}
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── 買い物メモ ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">買い物メモ</span>
                {pendingCount > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </div>

              {/* 入力エリア */}
              <div className="bg-white rounded-2xl p-3 card-shadow">
                <div className="flex gap-2">
                  <input
                    value={interimText || memoInput}
                    onChange={(e) => { if (!isListening) setMemoInput(e.target.value); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !isListening) addToCart(memoInput); }}
                    placeholder={isListening ? "話しかけてください…" : "メモを入力… (例: しょうゆ 濃口)"}
                    readOnly={isListening}
                    className={`flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
                      isListening
                        ? "bg-red-50 border-red-200 text-red-700 italic"
                        : "bg-gray-50 border-gray-200 text-gray-800 focus:border-orange-300 focus:bg-white"
                    }`}
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
                    onClick={() => addToCart(memoInput)}
                    disabled={!memoInput.trim() || isListening}
                    className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-95 transition-all text-xl font-bold shadow-sm"
                  >
                    +
                  </button>
                </div>

                {/* 録音中インジケーター */}
                {isListening && (
                  <div className="flex items-center gap-2 px-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-500 font-medium">
                      {interimText ? `「${interimText}」` : "聞いています… 話しかけてください"}
                    </span>
                  </div>
                )}

                {/* エラー表示 */}
                {voiceError && (
                  <div className="flex items-start gap-2 mt-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="text-base shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs text-amber-800 font-semibold mb-0.5">音声入力が使えません</p>
                      <p className="text-xs text-amber-700 leading-relaxed whitespace-pre-line">{voiceError}</p>
                    </div>
                    <button onClick={() => setVoiceError(null)} className="text-amber-400 text-base ml-1 shrink-0 leading-none">×</button>
                  </div>
                )}

                {cart.length === 0 && !isListening && !voiceError && (
                  <p className="text-center text-gray-400 text-xs mt-2">
                    🎙️ マイクまたは入力、上のカテゴリ選択でリスト追加
                  </p>
                )}
              </div>

              {/* 統合カートリスト — チップ選択 + テキスト入力 両方を表示 */}
              {cart.length > 0 && (
                <div className="mt-2 space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border card-shadow transition-all ${
                        item.done ? "border-gray-100 opacity-50" : "border-gray-100"
                      }`}
                    >
                      {/* チェックボタン */}
                      <button
                        onClick={() => toggleDone(item.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                          item.done ? "bg-blue-400 border-blue-400" : "border-gray-300"
                        }`}
                      >
                        {item.done && <span className="text-white text-[9px] font-bold">✓</span>}
                      </button>

                      {/* テキスト */}
                      <span className={`flex-1 text-sm font-medium ${item.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {item.text}
                      </span>

                      {/* 削除ボタン — 常時表示 */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-400 active:bg-red-100 active:text-red-500 transition-all text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {extraByGroup.length === 0 && cart.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center card-shadow mt-4">
                <p className="text-5xl mb-3">🛒</p>
                <p className="text-gray-500 text-base font-semibold">{t.shopEmpty}</p>
                <p className="text-gray-400 text-sm mt-1">食材が十分あります</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 完了した項目をまとめて削除 */}
      {doneCount > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
          <button
            onClick={clearDone}
            className="w-full py-3.5 bg-gray-800 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
          >
            {t.shopClear}（{doneCount}件）
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
