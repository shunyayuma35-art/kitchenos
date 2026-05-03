export type Category = "fridge" | "freezer" | "vegetable" | "pantry";
export type RecipeType = "節約" | "時短" | "健康";

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  expiryDays: number;
  createdAt: Date;
}

export interface ConsumptionLog {
  id: string;
  foodId: string;
  amount: number;
  waste: boolean;
  usedAt: Date;
}

export interface Recipe {
  title: string;
  type: RecipeType;
  ingredients: string[];
  missingIngredients: string[];
  substitutions: string[];
  steps?: string[];
  cookTime?: string;
  difficulty?: string;
}
