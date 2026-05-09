"use client";

import { useState } from "react";

type RemakeIdea = {
  title: string;
  point: string;
  time: string;
};

const IDEA_ICONS = ["🥘", "🍜", "🥗"];

export default function RemakeCard() {
  const [leftover, setLeftover] = useState("");
  const [ideas, setIdeas] = useState<RemakeIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastQuery, setLastQuery] = useState("");

  async function handleGenerate() {
    const query = leftover.trim();
    if (!query) return;
    setLoading(true);
    setError("");
    setIdeas([]);
    setLastQuery(query);
    try {
      const res = await fetch("/api/remake-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leftover: query }),
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

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍱</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-tight">残り物リメークAI</p>
            <p className="text-[10px] text-gray-400">余った料理 → 3つのリメーク案を提案</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700 shrink-0">
            AI
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={leftover}
            onChange={(e) => setLeftover(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="例：肉じゃが、カレー、ポテサラ…"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 min-w-0"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !leftover.trim()}
            className="px-3 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl
                       shadow-md shadow-amber-200 disabled:opacity-40 active:scale-95
                       transition-all shrink-0 whitespace-nowrap"
          >
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white
                               border-t-transparent rounded-full" />
            ) : "生成"}
          </button>
        </div>

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {ideas.length > 0 && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
            「{lastQuery}」のリメーク案
          </p>
          {ideas.map((idea, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-2.5 px-3 bg-orange-50 rounded-xl border border-orange-100"
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
