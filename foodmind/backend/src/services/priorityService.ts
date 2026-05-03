import { FoodItem, Category } from "../types";

const CATEGORY_SCORE: Record<Category, number> = {
  vegetable: 100,
  fridge: 67,
  pantry: 40,
  freezer: 33,
};

const MAX_EXPIRY_DAYS = 14;

// score = expiryScore * 0.6 + categoryScore * 0.3 + quantityScore * 0.1
export function calcPriority(item: FoodItem): number {
  const expiryScore =
    Math.max(0, (MAX_EXPIRY_DAYS - item.expiryDays) / MAX_EXPIRY_DAYS) * 100;

  const categoryScore = CATEGORY_SCORE[item.category];

  // quantity が多いほど使いやすい（上限 100）
  const quantityScore = Math.min(item.quantity * 10, 100);

  return expiryScore * 0.6 + categoryScore * 0.3 + quantityScore * 0.1;
}

export function getTopItems(items: FoodItem[], limit = 5): FoodItem[] {
  return [...items]
    .sort((a, b) => calcPriority(b) - calcPriority(a))
    .slice(0, limit);
}
