export type Language = "ja" | "en" | "vi" | "ne" | "id" | "my" | "ur" | "th" | "zh";
export type StationType = "cooking" | "plating" | "prep" | "admin" | "table";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

// ─── Menu ─────────────────────────────────────────────
export interface MenuStep {
  id: number;
  menu_id: number;
  step: number;
  task_type: "調理" | "盛付" | "仕込み";
  description: string;
  image_url: string | null;
  estimated_time_seconds: number | null;
  auto_next: boolean;
  required_checklist: string | null;  // JSON array string
}

export interface Menu {
  id: number;
  name: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  steps: MenuStep[];
}

// ─── Task ─────────────────────────────────────────────
export interface Task {
  id: number;
  order_item_id: number;
  step: number;
  task_type: "調理" | "盛付" | "仕込み";
  description: string | null;
  status: TaskStatus;
  assigned_station: string | null;
  assigned_staff: string | null;
  started_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  estimated_time_seconds: number | null;
  auto_next: boolean;
  required_checklist: string | null;  // JSON array string
}

// ─── Inventory ────────────────────────────────────────
export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface MenuIngredient {
  id: number;
  menu_id: number;
  ingredient_id: number;
  quantity_per_serving: number;
  ingredient: Ingredient;
}

export interface InventoryLog {
  id: number;
  ingredient_id: number;
  change_amount: number;
  reason: string;
  order_id: number | null;
  note: string | null;
  created_at: string;
}

// ─── Dashboard ────────────────────────────────────────
export interface StationLoad {
  station: string;
  task_type: string;
  pending_count: number;
  total_estimated_seconds: number;
  load_level: "idle" | "low" | "medium" | "high";
  delayed_count: number;
}

export interface DashboardStats {
  today_completed_tasks: number;
  yesterday_completed_tasks: number;
  avg_duration_seconds: number;
  delayed_task_count: number;
  active_order_count: number;
  today_order_count: number;
  delayed_tasks: { task_id: number; task_type: string; menu_name: string; table_number: string; elapsed_seconds: number }[];
}

// ─── Order ────────────────────────────────────────────
export interface OrderItem {
  id: number;
  order_id: number;
  menu_name: string;
  quantity: number;
  note: string | null;
  tasks: Task[];
}

export interface Order {
  id: number;
  table_number: string;
  status: OrderStatus;
  priority: number;
  created_at: string;
  items: OrderItem[];
}

// ─── Prep ─────────────────────────────────────────────
export interface PrepTask {
  id: number;
  prep_work_id: number;
  step: number;
  description: string;
  status: TaskStatus;
  assigned_staff: string | null;
  completed_at: string | null;
  completed_by: string | null;
}

export interface PrepWork {
  id: number;
  name: string;
  date: string;
  status: TaskStatus;
  priority: number;
  created_at: string;
  tasks: PrepTask[];
}

// ─── CompletionLog ────────────────────────────────────
export interface CompletionLog {
  id: number;
  staff_name: string;
  task_type: string;
  description: string;
  start_time: string | null;
  end_time: string;
  duration_seconds: number | null;
  photo_url: string | null;
  note: string | null;
}

// ─── order_ready payload ──────────────────────────────
export interface OrderReadyData {
  order_id: number;
  table_number: string;
  menu_items: string[];
}

// ─── CookingHistory ───────────────────────────────────
export interface CookingHistory {
  id: number;
  order_id: number | null;
  order_item_id: number | null;
  step: number | null;
  task_type: string;
  station: string;
  staff_id: string;
  menu_name: string | null;
  table_number: string | null;
  completed_at: string;
  duration_seconds: number | null;
  status: string;
  note: string | null;
  created_at: string;
}

export interface StaffReportItem {
  staff_id: string;
  task_count: number;
  avg_duration_seconds: number | null;
  total_duration_seconds: number;
  station_breakdown: Record<string, number>;
  task_type_breakdown: Record<string, number>;
}

export interface StationReportItem {
  station: string;
  task_count: number;
  avg_duration_seconds: number | null;
}

export interface DailyReport {
  date: string;
  total_tasks: number;
  staff_reports: StaffReportItem[];
  station_reports: StationReportItem[];
  avg_duration_seconds: number | null;
}

export interface MonthlyReport {
  year: number;
  month: number;
  total_tasks: number;
  staff_reports: StaffReportItem[];
  station_reports: StationReportItem[];
  avg_duration_seconds: number | null;
  daily_summary: { date: string; count: number }[];
}

// ─── main_completed payload ───────────────────────────
export interface MainCompletedData {
  order_id: number;
  table_number: string;
  menu_name: string;
  staff_id: string;
  completed_at: string;
}

// ─── AI Timing Prediction ─────────────────────────────
export interface SideDishTiming {
  item_type: string;
  start_in_seconds: number;
  reason: string;
}

export interface TaskTimingInfo {
  task_id: number;
  order_item_id: number;
  menu_name: string;
  step: number;
  task_type: string;
  station: string;
  status: string;
  predicted_finish_at: string | null;
  estimated_remaining_seconds: number;
  delay_risk: boolean;
  temperature_risk: boolean;
  assigned_staff: string | null;
  recommended_staff: string | null;
}

export interface TimingPrediction {
  order_id: number;
  table_number: string;
  predicted_completion_at: string;
  estimated_total_seconds: number;
  delay_risk: boolean;
  station_load: Record<string, string>;
  tasks: TaskTimingInfo[];
  side_dish_timings: SideDishTiming[];
  generated_at: string;
}

// ─── Tasks Now (今やるべきこと) ────────────────────────
export interface TaskNowItem {
  task_id: number;
  order_id: number;
  order_item_id: number;
  table_number: string;
  menu_name: string;
  step: number;
  task_type: string;
  station: string;
  status: string;
  priority_score: number;
  priority_label: string;
  estimated_remaining_seconds: number;
  elapsed_seconds: number;
  is_delayed: boolean;
  delay_seconds: number;
  temperature_danger: boolean;
  assigned_staff: string | null;
  recommended_staff: string | null;
  action: string;
  side_dish_alert: boolean;
}

export interface TasksNowResponse {
  generated_at: string;
  total_urgent: number;
  total_warning: number;
  total_normal: number;
  by_station: Record<string, TaskNowItem[]>;
  all_tasks: TaskNowItem[];
  alerts: string[];
}

// ─── Station Alert ────────────────────────────────────
export interface StationAlertData {
  type: string;
  order_id: number;
  table: string;
  message: string;
  targets: string[];
  urgency: "normal" | "warning" | "critical";
}

// ─── WebSocket messages ───────────────────────────────
export type WSMessage =
  | { type: "order_created"; data: Order }
  | { type: "task_updated"; data: Task }
  | { type: "task_completed"; data: CompletionLog }
  | { type: "prep_updated"; data: PrepWork }
  | { type: "order_ready"; data: OrderReadyData }
  | { type: "step_completed"; data: CookingHistory }
  | { type: "main_completed"; data: MainCompletedData }
  | { type: "timing_updated"; data: TimingPrediction }
  | { type: "station_alert"; data: StationAlertData }
  | { type: "tasks_now_updated"; data: TasksNowResponse };
