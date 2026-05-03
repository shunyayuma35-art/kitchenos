"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/api";
import { useT } from "@/lib/LangContext";

const TYPE_CONFIG = {
  節約: { color: "bg-blue-100 text-blue-700",     icon: "💰" },
  時短: { color: "bg-orange-100 text-orange-700", icon: "⚡" },
  健康: { color: "bg-emerald-100 text-emerald-700", icon: "🥗" },
} as const;

const DIFFICULTY_COLOR: Record<string, string> = {
  簡単: "text-emerald-600",
  普通: "text-amber-600",
  本格: "text-red-600",
};

export default function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const t = useT();
  const cfg = TYPE_CONFIG[recipe.type];

  return (
    <div
      className="bg-white rounded-2xl card-shadow animate-slide-up overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.color}`}>
                {recipe.type}
              </span>
              {recipe.cookTime && (
                <span className="text-[10px] text-gray-400">⏱ {recipe.cookTime}</span>
              )}
              {recipe.difficulty && (
                <span className={`text-[10px] font-semibold ${DIFFICULTY_COLOR[recipe.difficulty] ?? "text-gray-500"}`}>
                  {recipe.difficulty}
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-snug">{recipe.title}</p>
            <p className="text-xs text-gray-400 mt-1">{recipe.ingredients.join(" · ")}</p>
            {recipe.missingIngredients.length > 0 && (
              <p className="text-xs text-amber-500 mt-1">
                {t.recipeMissing} {recipe.missingIngredients.join("、")}
                {recipe.substitutions.length > 0 && ` → ${recipe.substitutions[0]}`}
              </p>
            )}
          </div>
        </div>

        {recipe.steps && recipe.steps.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1
                       py-1.5 rounded-xl bg-emerald-50 active:bg-emerald-100"
          >
            {expanded ? t.recipeClose : t.recipeOpen}
          </button>
        )}
      </div>

      {expanded && recipe.steps && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex gap-2.5 text-xs text-gray-700 leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold
                               flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
              <span>{step.replace(/^\d+\.\s*/, "")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
