"use client";

import { useState, useRef, useCallback, ChangeEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addItem, visionIdentify, visionSave } from "@/lib/api";
import type { Category, IdentifiedItem } from "@/lib/api";
import { FOOD_MASTER, GROUPS, searchMaster } from "@/lib/foodMaster";
import type { MasterItem } from "@/lib/foodMaster";
import BottomNav from "@/components/BottomNav";
import { useT } from "@/lib/LangContext";

type Mode = "list" | "manual" | "camera";

// ── 確認モーダル ────────────────────────────────────────
function ConfirmModal({
  items, title, onConfirm, onClose,
}: {
  items: IdentifiedItem[];
  title: string;
  onConfirm: (items: IdentifiedItem[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [list, setList] = useState(items.map((i) => ({ ...i, checked: true })));

  function toggle(idx: number) {
    setList((l) => l.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item)));
  }
  function updateField<K extends keyof IdentifiedItem>(idx: number, key: K, val: IdentifiedItem[K]) {
    setList((l) => l.map((item, i) => (i === idx ? { ...item, [key]: val } : item)));
  }

  const CATEGORY_OPTIONS: { value: Category; label: string; icon: string }[] = [
    { value: "fridge",    label: t.catFridge,    icon: "❄️" },
    { value: "freezer",   label: t.catFreezer,   icon: "🧊" },
    { value: "vegetable", label: t.catVegetable, icon: "🥬" },
    { value: "pantry",    label: t.catPantry,    icon: "📦" },
  ];

  const checked = list.filter((i) => i.checked);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="bg-white w-full max-w-sm mx-auto rounded-t-3xl p-5 max-h-[88vh] overflow-y-auto animate-slide-up">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h2 className="font-bold text-gray-800 mb-0.5">{title}</h2>
        <p className="text-xs text-gray-400 mb-4">{t.addModalSubtitle}</p>

        <div className="space-y-2 mb-5">
          {list.map((item, idx) => (
            <div key={idx} className={`rounded-2xl p-3 border transition-colors ${item.checked ? "border-amber-300 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={item.checked} onChange={() => toggle(idx)} className="w-4 h-4 accent-amber-500" />
                <span className="font-semibold text-gray-800 flex-1 text-sm">{item.name}</span>
              </div>
              {item.checked && (
                <div className="flex gap-2 ml-6">
                  <select
                    value={item.category}
                    onChange={(e) => updateField(idx, "category", e.target.value as Category)}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 bg-white">
                    <input type="number" min={1} value={item.expiryDays}
                      onChange={(e) => updateField(idx, "expiryDays", Number(e.target.value))}
                      className="w-12 text-xs text-center focus:outline-none" />
                    <span className="text-xs text-gray-400">{t.addDayUnit}</span>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 bg-white">
                    <input type="number" min={1} value={item.quantity}
                      onChange={(e) => updateField(idx, "quantity", Number(e.target.value))}
                      className="w-10 text-xs text-center focus:outline-none" />
                    <span className="text-xs text-gray-400">{t.addPieceUnit}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium">
            {t.addModalCancel}
          </button>
          <button
            onClick={() => onConfirm(checked)}
            disabled={checked.length === 0}
            className="flex-1 py-3 rounded-2xl bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-200 disabled:opacity-40"
          >
            {t.addModalSave(checked.length)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── メイン ──────────────────────────────────────────────
export default function AddPage() {
  const t = useT();
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("list");

  // 音声検索
  const [isListening, setIsListening]   = useState(false);
  const [voiceError, setVoiceError]     = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startVoice = useCallback(() => {
    setVoiceError(null);
    const host = location.hostname;
    const isSecure = location.protocol === "https:" || host === "localhost" || host === "127.0.0.1";
    if (!isSecure) {
      setVoiceError("音声入力はHTTPS環境（本番URL）でのみ動作します。");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("このブラウザは音声入力非対応です（Chrome/Safariをお試しください）");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "ja-JP";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript as string;
      }
      setQuery(text);
      if (e.results[e.resultIndex]?.isFinal) {
        setIsListening(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      const msgs: Record<string, string> = {
        "not-allowed": "マイクを許可してください。",
        "no-speech":   "声が検出されませんでした。",
        "network":     "音声入力はHTTPS本番環境でのみ動作します。",
        "aborted":     "",
      };
      const msg = msgs[e.error as string] ?? `音声エラー: ${e.error}`;
      if (msg) setVoiceError(msg);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try { rec.start(); setIsListening(true); }
    catch { setVoiceError("音声入力を開始できませんでした。"); }
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const CATEGORY_OPTIONS: { value: Category; label: string; icon: string }[] = [
    { value: "fridge",    label: t.catFridge,    icon: "❄️" },
    { value: "freezer",   label: t.catFreezer,   icon: "🧊" },
    { value: "vegetable", label: t.catVegetable, icon: "🥬" },
    { value: "pantry",    label: t.catPantry,    icon: "📦" },
  ];

  // マスターリスト
  const [query, setQuery]       = useState("");
  const [activeGroup, setGroup] = useState("すべて");
  const [selected, setSelected] = useState<MasterItem[]>([]);

  const filtered = useMemo(() => searchMaster(query, activeGroup), [query, activeGroup]);

  function toggleItem(item: MasterItem) {
    setSelected((s) =>
      s.find((i) => i.name === item.name)
        ? s.filter((i) => i.name !== item.name)
        : [...s, item]
    );
  }

  // 手動フォーム
  const [form, setForm]         = useState({ name: "", category: "fridge" as Category, quantity: 1, expiryDays: 7 });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");

  // モーダル
  const [modalItems, setModalItems] = useState<IdentifiedItem[] | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [saving, setSaving]         = useState(false);

  // カメラ識別
  const [analyzing, setAnalyzing]     = useState(false);
  const [cameraError, setCameraError] = useState("");

  function setField<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openMasterConfirm() {
    setModalItems(selected.map((i) => ({ name: i.name, category: i.category, quantity: 1, expiryDays: i.defaultExpiryDays })));
    setModalTitle(t.addModalListTitle(selected.length));
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError(t.addErrName); return; }
    setSubmitting(true); setFormError("");
    try { await addItem(form); router.push("/inventory"); }
    catch { setFormError(t.addErrFailed); }
    finally { setSubmitting(false); }
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true); setCameraError("");
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload  = () => res((r.result as string).split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const { items } = await visionIdentify(base64, file.type as "image/jpeg" | "image/png" | "image/webp");
      setModalTitle(t.addModalVisionTitle);
      setModalItems(items);
    } catch { setCameraError(t.addCamErrId); }
    finally { setAnalyzing(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function handleConfirm(items: IdentifiedItem[]) {
    setSaving(true);
    try { await visionSave(items); router.push("/inventory"); }
    catch { setCameraError(t.addCamErrSave); setSaving(false); }
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      <div className="gradient-header px-5 pt-12 pb-8">
        <h1 className="text-white text-2xl font-bold">食材を入れる</h1>
        <p className="text-white/50 text-xs mt-0.5">冷蔵庫に登録</p>
      </div>

      <div className="px-4 -mt-4">
        {/* モード切替 */}
        <div className="bg-white rounded-2xl p-1 card-shadow flex gap-1 mb-5">
          {(["list", "manual", "camera"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${mode === m ? "bg-amber-600 text-white shadow-sm" : "text-gray-400"}`}>
              {m === "list" ? t.addModeList : m === "manual" ? t.addModeManual : t.addModeCamera}
            </button>
          ))}
        </div>

        {/* ── リストから選ぶ ── */}
        {mode === "list" && (
          <div className="animate-fade-in space-y-2.5">
            {/* 検索バー + 音声ボタン */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder={isListening ? "話しかけてください…" : t.addSearch}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full border rounded-2xl pl-9 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 card-shadow transition-colors ${
                  isListening
                    ? "border-red-300 bg-red-50 focus:ring-red-200 text-red-700"
                    : "border-gray-200 bg-white focus:ring-amber-300"
                }`}
              />
              <button
                onClick={isListening ? stopVoice : startVoice}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-200"
                    : "text-gray-400 active:text-amber-600"
                }`}
              >
                <span className="text-base leading-none">{isListening ? "⏹" : "🎙️"}</span>
              </button>
            </div>

            {/* 音声エラー表示 */}
            {voiceError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-sm shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 flex-1">{voiceError}</p>
                <button onClick={() => setVoiceError(null)} className="text-amber-400 text-sm shrink-0">×</button>
              </div>
            )}

            {/* カテゴリフィルター — 折り返し表示 */}
            <div className="flex flex-wrap gap-1.5">
              {GROUPS.map((g, idx) => {
                const anims = ["animate-fuwa-fuwa", "animate-yura-yura", "animate-puru-puru"];
                const animClass = anims[idx % 3];
                return (
                  <button key={g.name} onClick={() => setGroup(g.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border active:scale-95 ${
                      activeGroup === g.name
                        ? "bg-amber-600 text-white shadow-sm border-amber-600"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}>
                    <span
                      className={`inline-block ${animClass}`}
                      style={{ animationDelay: `${idx * 0.2}s` }}
                    >{g.emoji}</span>
                    {t.grpLabels[g.name] ?? g.name}
                  </button>
                );
              })}
            </div>

            {/* 食材チップ — 買い物リスト風 */}
            {(activeGroup !== "すべて" || query.trim() !== "") && (
              <>
                {filtered.length > 0 && (
                  <div className="bg-white rounded-2xl p-3 card-shadow">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-base">{GROUPS.find(g => g.name === activeGroup)?.emoji ?? "🔍"}</span>
                      <span className="text-sm font-bold text-gray-700">
                        {activeGroup === "すべて" ? `「${query}」の検索結果` : (t.grpLabels[activeGroup] ?? activeGroup)}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-auto bg-gray-100 px-2 py-0.5 rounded-full">
                        {filtered.length}品
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filtered.map((item) => {
                        const isSelected = !!selected.find((s) => s.name === item.name);
                        return (
                          <button key={item.name} onClick={() => toggleItem(item)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border active:scale-95 ${
                              isSelected
                                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                : "bg-orange-50 border-orange-100 text-gray-700"
                            }`}>
                            {isSelected && <span className="text-[10px] font-black">✓</span>}
                            <span className="text-base leading-none">{item.groupEmoji}</span>
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {filtered.length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">{t.addNotFound(query)}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── 手動入力 ── */}
        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-4 animate-fade-in">
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <div className="bg-white rounded-2xl p-4 card-shadow space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t.addNameLabel}</label>
                <input type="text" placeholder={t.addNamePlaceholder} value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t.addStorageLabel}</label>
                <div className="flex gap-2">
                  {CATEGORY_OPTIONS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setField("category", c.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm border font-medium transition-all ${form.category === c.value ? "bg-amber-600 text-white border-emerald-700" : "bg-white text-gray-500 border-gray-200"}`}>
                      <span className="block text-base">{c.icon}</span>{c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t.addQtyLabel}</label>
                  <input type="number" min={1} value={form.quantity}
                    onChange={(e) => setField("quantity", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">{t.addExpiryLabel}</label>
                  <input type="number" min={1} value={form.expiryDays}
                    onChange={(e) => setField("expiryDays", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-200 disabled:opacity-40">
              {submitting ? t.addSubmitting : t.addSave}
            </button>
          </form>
        )}

        {/* ── カメラ撮影 ── */}
        {mode === "camera" && (
          <div className="animate-fade-in space-y-4">
            {cameraError && <p className="text-red-500 text-sm">{cameraError}</p>}
            <div className="bg-white rounded-2xl p-6 card-shadow text-center">
              <p className="text-5xl mb-3">📸</p>
              <p className="font-semibold text-gray-700 mb-1">{t.addCamTitle}</p>
              <p className="text-xs text-gray-400 mb-5">{t.addCamDesc1}<br />{t.addCamDesc2}</p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                onChange={handleImageChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={analyzing}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-200 disabled:opacity-50">
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                    {t.addCamAnalyzing}
                  </span>
                ) : t.addCamOpen}
              </button>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 mb-1">{t.addTipsTitle}</p>
              <ul className="text-xs text-emerald-600 space-y-0.5">
                <li>・ {t.addTip1}</li>
                <li>・ {t.addTip2}</li>
                <li>・ {t.addTip3}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 一括追加バー */}
      {mode === "list" && selected.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
          <div className="bg-amber-600 text-white rounded-2xl px-5 py-3 flex items-center justify-between card-shadow-md">
            <span className="text-sm font-semibold">{t.addBarSelected(selected.length)}</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected([])} className="text-xs text-emerald-200 px-2 py-1">{t.addBarClear}</button>
              <button onClick={openMasterConfirm} className="text-xs bg-white text-amber-700 font-bold px-4 py-1.5 rounded-xl">
                {t.addBarAdd}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 確認モーダル */}
      {modalItems && (
        <ConfirmModal
          items={modalItems}
          title={modalTitle}
          onConfirm={saving ? () => {} : handleConfirm}
          onClose={() => { setModalItems(null); setSelected([]); }}
        />
      )}

      <BottomNav />
    </div>
  );
}
