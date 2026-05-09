"use client";

import { useState } from "react";

type RemakeIdea = {
  title: string;
  point: string;
  time: string;
};

const FLAVORS = [
  { key: "味噌",      label: "味噌",      bg: "bg-amber-700" },
  { key: "とんこつ",  label: "とんこつ",  bg: "bg-orange-300" },
  { key: "塩",        label: "塩",        bg: "bg-sky-400"   },
  { key: "醤油",      label: "醤油",      bg: "bg-amber-900" },
  { key: "焼きそば",  label: "焼きそば",  bg: "bg-yellow-500"},
] as const;

type FlavorKey = typeof FLAVORS[number]["key"];

const IDEA_ICONS = ["🍜", "🍱", "🥢"];

export default function RamenRemakeCard() {
  const [flavor, setFlavor] = useState<FlavorKey>("味噌");
  const [ideas, setIdeas] = useState<RemakeIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFlavor, setLastFlavor] = useState<FlavorKey | "">("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setIdeas([]);
    setLastFlavor(flavor);
    try {
      const res = await fetch("/api/ramen-remake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flavor }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIdeas(data.ideas ?? []);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  const activeMeta = FLAVORS.find((f) => f.key === flavor)!;

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍜</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-tight">即席ラーメンアレンジAI</p>
            <p className="text-[10px] text-gray-400">味を選んで → 3つのアレンジ案を提案</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 shrink-0">
            AI
          </span>
        </div>

        {/* 味セレクター */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {FLAVORS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFlavor(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95
                          ${flavor === f.key
                            ? `${f.bg} text-white border-transparent shadow-sm`
                            : "bg-white text-gray-600 border-gray-200"
                          }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-2.5 text-white text-sm font-bold rounded-xl
                      shadow-md disabled:opacity-40 active:scale-98 transition-all
                      flex items-center justify-center gap-2
                      ${activeMeta.bg}`}
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white
                               border-t-transparent rounded-full" />
              生成中…
            </>
          ) : `${flavor}ラーメンのアレンジを生成`}
        </button>

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {ideas.length > 0 && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
            「{lastFlavor}ラーメン」のアレンジ案
          </p>
          {ideas.map((idea, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-2.5 px-3 bg-red-50 rounded-xl border border-red-100"
            >
              <span className="text-xl shrink-0">{IDEA_ICONS[i] ?? "🍽️"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-snug">{idea.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{idea.point}</p>
              </div>
              {idea.time && (
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
                  ⏱ {idea.time}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
