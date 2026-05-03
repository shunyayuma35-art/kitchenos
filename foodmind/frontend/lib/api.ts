const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Category = "fridge" | "freezer" | "vegetable" | "pantry";
export type RecipeType = "節約" | "時短" | "健康";

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  expiryDays: number;
  score?: number;
  createdAt: string;
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

export interface IdentifiedItem {
  name: string;
  category: Category;
  quantity: number;
  expiryDays: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const fetchItems = () => request<FoodItem[]>("/api/items");

export const fetchToday = () =>
  request<{ priorityItems: FoodItem[] }>("/api/today");

export const addItem = (body: Omit<FoodItem, "id" | "createdAt" | "score">) =>
  request<FoodItem>("/api/items", { method: "POST", body: JSON.stringify(body) });

export const deleteItem = (id: string) =>
  request<void>(`/api/items/${id}`, { method: "DELETE" });

export const updateItem = (id: string, data: { quantity?: number; expiryDays?: number }) =>
  request<FoodItem>(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const clearAllItems = async (): Promise<void> => {
  const res = await fetch(`${API}/api/items`, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
};

export const consumeItem = (body: { foodId: string; amount: number; waste?: boolean }) =>
  request<unknown>("/api/consume", { method: "POST", body: JSON.stringify(body) });

export const generateRecipes = (priorityItems: string[], allItems?: string[], allergenExclusions?: string[]) =>
  request<{ recipes: Recipe[] }>("/api/recipe", {
    method: "POST",
    body: JSON.stringify({ items: priorityItems, allItems, allergenExclusions }),
  });

export const visionIdentify = (image: string, mediaType = "image/jpeg") =>
  request<{ items: IdentifiedItem[] }>("/api/vision/identify", {
    method: "POST",
    body: JSON.stringify({ image, mediaType }),
  });

export const visionSave = (items: IdentifiedItem[]) =>
  request<{ saved: FoodItem[] }>("/api/vision/save", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
