// ポイント・ストリーク・レベルシステム — localStorageのみ・DBなし

const KEY = "foodmind_points_v1";

export interface PointsState {
  total: number;
  streakDays: number;
  lastVisitDate: string;   // "YYYY-MM-DD"
  cookedToday: string[];   // recipeTitle[] — 当日の重複防止
}

// Lv1〜5の累計ポイント閾値
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000] as const;

export function getLevel(total: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getNextLevelPts(total: number): number | null {
  const lv = getLevel(total);
  return LEVEL_THRESHOLDS[lv] ?? null; // null = Lv5 MAX
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): PointsState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : empty();
  } catch {
    return empty();
  }
}

function empty(): PointsState {
  return { total: 0, streakDays: 0, lastVisitDate: "", cookedToday: [] };
}

function save(s: PointsState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

// ── 読み取り ─────────────────────────────────────────────
export function getPoints(): PointsState {
  return load();
}

// ── 加算（汎用） ─────────────────────────────────────────
export function addPoints(amount: number): PointsState {
  const s = load();
  s.total = Math.max(0, s.total + amount);
  save(s);
  return s;
}

// ── 消費 ─────────────────────────────────────────────────
export function spendPoints(amount: number): { ok: boolean; state: PointsState } {
  const s = load();
  if (s.total < amount) return { ok: false, state: s };
  s.total -= amount;
  save(s);
  return { ok: true, state: s };
}

// ── 毎日チェックイン（初回のみ加算）────────────────────────
export function checkInToday(): { earned: number; streak: number; state: PointsState } {
  const s = load();
  const today = todayStr();

  if (s.lastVisitDate === today) {
    return { earned: 0, streak: s.streakDays, state: s };
  }

  // ストリーク計算
  const prev = new Date(today);
  prev.setDate(prev.getDate() - 1);
  const yesterday = prev.toISOString().slice(0, 10);
  s.streakDays = s.lastVisitDate === yesterday ? s.streakDays + 1 : 1;

  // ストリーク連続ボーナス
  let earned = 5;
  if (s.streakDays === 3)  earned = 15;
  if (s.streakDays === 7)  earned = 50;
  if (s.streakDays > 7 && s.streakDays % 7 === 0) earned = 30;

  s.total += earned;
  s.lastVisitDate = today;
  s.cookedToday = []; // 日付が変わったのでリセット
  save(s);
  return { earned, streak: s.streakDays, state: s };
}

// ── 料理完了（1レシピ1日1回のみ +30P）──────────────────────
export function markCooked(recipeTitle: string): { earned: number; state: PointsState } {
  const s = load();
  const today = todayStr();

  // 日付が変わっていたらcookedTodayをリセット
  if (s.lastVisitDate !== today) {
    s.cookedToday = [];
    s.lastVisitDate = today;
  }

  if (s.cookedToday.includes(recipeTitle)) {
    return { earned: 0, state: s }; // 今日すでに料理済み
  }

  s.cookedToday = [...s.cookedToday, recipeTitle];
  s.total += 30;
  save(s);
  return { earned: 30, state: s };
}

// ── 食材追加ボーナス（呼び出し元で重複制御） ────────────────
export const POINTS = {
  ADD_ITEM:        5,
  PHOTO_SCAN:     20,
  GENERATE_RECIPE: 10,
  COOKED:         30,
  EXPIRE_SAVE:    15,  // 期限2日以内の食材を消費したとき
  SCORE_90:       25,  // 冷蔵庫スコア90点以上達成
} as const;
