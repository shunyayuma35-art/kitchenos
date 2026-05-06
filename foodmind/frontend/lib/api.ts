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

// ── localStorage ベースの食材ストア ──────────────────────
const ITEMS_KEY = "foodmind_items_v2";

const CATEGORY_SCORE: Record<Category, number> = {
  vegetable: 100, fridge: 67, pantry: 40, freezer: 33,
};

function calcPriority(item: FoodItem): number {
  const expiryScore = Math.max(0, (14 - item.expiryDays) / 14) * 100;
  return expiryScore * 0.6 + CATEGORY_SCORE[item.category] * 0.3 + Math.min(item.quantity * 10, 100) * 0.1;
}

function getStoredItems(): FoodItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ITEMS_KEY) || "[]"); }
  catch { return []; }
}

function saveItems(items: FoodItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

// ── CRUD ─────────────────────────────────────────────────

export function fetchItems(): Promise<FoodItem[]> {
  return Promise.resolve(getStoredItems());
}

export function fetchToday(): Promise<{ priorityItems: FoodItem[] }> {
  const items = getStoredItems();
  const priorityItems = [...items]
    .sort((a, b) => calcPriority(b) - calcPriority(a))
    .slice(0, 5)
    .map((item) => ({ ...item, score: Math.round(calcPriority(item)) }));
  return Promise.resolve({ priorityItems });
}

export function addItem(body: Omit<FoodItem, "id" | "createdAt" | "score">): Promise<FoodItem> {
  const items = getStoredItems();
  const newItem: FoodItem = {
    ...body,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  saveItems([...items, newItem]);
  return Promise.resolve(newItem);
}

export function deleteItem(id: string): Promise<void> {
  saveItems(getStoredItems().filter((i) => i.id !== id));
  return Promise.resolve();
}

export function updateItem(id: string, data: { quantity?: number; expiryDays?: number }): Promise<FoodItem> {
  const items = getStoredItems().map((i) =>
    i.id === id ? { ...i, ...data } : i
  );
  saveItems(items);
  const updated = items.find((i) => i.id === id)!;
  return Promise.resolve(updated);
}

export function clearAllItems(): Promise<void> {
  saveItems([]);
  return Promise.resolve();
}

export function consumeItem(body: { foodId: string; amount: number; waste?: boolean }): Promise<void> {
  const items = getStoredItems();
  const item = items.find((i) => i.id === body.foodId);
  if (!item) return Promise.resolve();
  const newQty = Math.max(0, item.quantity - body.amount);
  if (newQty === 0) {
    saveItems(items.filter((i) => i.id !== body.foodId));
  } else {
    saveItems(items.map((i) => i.id === body.foodId ? { ...i, quantity: newQty } : i));
  }
  return Promise.resolve();
}

// ── Claude API (Next.js API routes) ──────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const generateRecipes = (
  priorityItems: string[],
  allItems?: string[],
  allergenExclusions?: string[],
  lang?: string,
) =>
  apiFetch<{ recipes: Recipe[] }>("/api/recipe", {
    method: "POST",
    body: JSON.stringify({ items: priorityItems, allItems, allergenExclusions, lang }),
  });

export const visionIdentify = (image: string, mediaType = "image/jpeg") =>
  apiFetch<{ items: IdentifiedItem[] }>("/api/vision/identify", {
    method: "POST",
    body: JSON.stringify({ image, mediaType }),
  });

// ── Fridge photo cache (複数写真 → AI) ───────────────────
const FRIDGE_PHOTOS_KEY = "fridge_photos";
interface FridgePhotoEntry { data: string; mediaType: string; items: string[]; }

export function saveFridgePhoto(data: string, mediaType: string, items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const stored: FridgePhotoEntry[] = JSON.parse(localStorage.getItem(FRIDGE_PHOTOS_KEY) || "[]");
    stored.push({ data, mediaType, items });
    localStorage.setItem(FRIDGE_PHOTOS_KEY, JSON.stringify(stored.slice(-3)));
  } catch { /* storage full */ }
}

export function getFridgePhotoItems(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored: FridgePhotoEntry[] = JSON.parse(localStorage.getItem(FRIDGE_PHOTOS_KEY) || "[]");
    return Array.from(new Set(stored.flatMap((p) => p.items)));
  } catch { return []; }
}

export function getFridgePhotoCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return (JSON.parse(localStorage.getItem(FRIDGE_PHOTOS_KEY) || "[]") as FridgePhotoEntry[]).length;
  } catch { return 0; }
}

export function clearFridgePhotos(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FRIDGE_PHOTOS_KEY);
}

export const visionSave = (items: IdentifiedItem[]): Promise<{ saved: FoodItem[] }> => {
  const saved: FoodItem[] = items.map((item) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    expiryDays: item.expiryDays,
    createdAt: new Date().toISOString(),
  }));
  const existing = getStoredItems();
  saveItems([...existing, ...saved]);
  return Promise.resolve({ saved });
};
