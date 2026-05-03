"use client";

import type { FoodItem } from "@/lib/api";
import { useT } from "@/lib/LangContext";
import { getAllergensForFood } from "@/lib/allergens";

const CATEGORY_COLOR = {
  vegetable: "bg-lime-100 text-lime-700",
  fridge:    "bg-sky-100 text-sky-700",
  freezer:   "bg-cyan-100 text-cyan-700",
  pantry:    "bg-orange-100 text-orange-700",
} as const;

interface FoodCardProps {
  item: FoodItem;
  onConsume?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FoodCard({ item, onConsume, onEdit, onDelete }: FoodCardProps) {
  const t = useT();

  const CATEGORY_LABEL = {
    vegetable: t.catVegetable,
    fridge:    t.catFridge,
    freezer:   t.catFreezer,
    pantry:    t.catPantry,
  };

  function expiryConfig(days: number) {
    if (days <= 1) return { bar: "bg-red-500",    badge: "bg-red-100 text-red-600",       label: t.invToday };
    if (days <= 2) return { bar: "bg-orange-400", badge: "bg-orange-100 text-orange-600", label: t.invDaysLeft(days) };
    if (days <= 5) return { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-600",   label: t.invDaysLeft(days) };
    return           { bar: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-600", label: t.invDaysLeft(days) };
  }

  const cfg = expiryConfig(item.expiryDays);
  const pct = Math.max(5, Math.min(100, (1 - item.expiryDays / 14) * 100));
  const allergens = getAllergensForFood(item.name);
  const mandatoryAllergens = allergens.filter((a) => a.mandatory);
  const recommendedAllergens = allergens.filter((a) => !a.mandatory);

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow animate-slide-up overflow-hidden relative">
      <div className="absolute top-0 left-0 h-1.5 w-full bg-gray-100">
        <div className={`h-full ${cfg.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-800 text-base">{item.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[item.category]}`}>
            {CATEGORY_LABEL[item.category]}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-gray-500">×{item.quantity}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {(mandatoryAllergens.length > 0 || recommendedAllergens.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {mandatoryAllergens.map((a) => (
            <span key={a.key} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">
              {a.emoji} {a.name}
            </span>
          ))}
          {recommendedAllergens.map((a) => (
            <span key={a.key} className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full">
              {a.emoji} {a.name}
            </span>
          ))}
        </div>
      )}

      {(onConsume || onEdit || onDelete) && (
        <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
          {onConsume && (
            <button
              onClick={onConsume}
              className="flex-1 text-sm py-2 bg-emerald-50 text-emerald-700 rounded-xl
                         border border-emerald-200 font-semibold active:bg-emerald-100"
            >
              {t.invConsume}
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 text-sm py-2 bg-blue-50 text-blue-600 rounded-xl
                         border border-blue-200 font-semibold active:bg-blue-100"
            >
              {t.invEdit}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 text-sm py-2 bg-red-50 text-red-500 rounded-xl
                         border border-red-200 font-semibold active:bg-red-100"
            >
              {t.invDelete}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
