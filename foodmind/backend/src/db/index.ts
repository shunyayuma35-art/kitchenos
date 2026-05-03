import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { FoodItem, ConsumptionLog } from "../types";

// Supabase 未設定時のインメモリフォールバック
const memory = {
  items: [] as FoodItem[],
  logs: [] as ConsumptionLog[],
};

let supabase: SupabaseClient | null = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log("Supabase connected");
} else {
  console.log("Supabase not configured — using in-memory store");
}

function rowToItem(row: Record<string, unknown>): FoodItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as FoodItem["category"],
    quantity: row.quantity as number,
    expiryDays: row.expiry_days as number,
    createdAt: new Date(row.created_at as string),
  };
}

function rowToLog(row: Record<string, unknown>): ConsumptionLog {
  return {
    id: row.id as string,
    foodId: row.food_id as string,
    amount: row.amount as number,
    waste: row.waste as boolean,
    usedAt: new Date(row.used_at as string),
  };
}

export const db = {
  async getItems(): Promise<FoodItem[]> {
    if (!supabase) return memory.items;
    const { data, error } = await supabase.from("items").select("*").order("created_at");
    if (error) throw error;
    return (data ?? []).map(rowToItem);
  },

  async addItem(item: FoodItem): Promise<FoodItem> {
    if (!supabase) {
      memory.items.push(item);
      return item;
    }
    const { data, error } = await supabase
      .from("items")
      .insert({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiry_days: item.expiryDays,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToItem(data);
  },

  async updateQuantity(id: string, quantity: number): Promise<void> {
    if (!supabase) {
      const item = memory.items.find((i) => i.id === id);
      if (item) item.quantity = quantity;
      return;
    }
    const { error } = await supabase.from("items").update({ quantity }).eq("id", id);
    if (error) throw error;
  },

  async updateItem(id: string, data: Partial<Pick<FoodItem, "quantity" | "expiryDays">>): Promise<FoodItem | null> {
    if (!supabase) {
      const item = memory.items.find((i) => i.id === id);
      if (!item) return null;
      if (data.quantity !== undefined) item.quantity = data.quantity;
      if (data.expiryDays !== undefined) item.expiryDays = data.expiryDays;
      return item;
    }
    const updates: Record<string, unknown> = {};
    if (data.quantity !== undefined) updates.quantity = data.quantity;
    if (data.expiryDays !== undefined) updates.expiry_days = data.expiryDays;
    const { data: row, error } = await supabase.from("items").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return rowToItem(row);
  },

  async deleteItem(id: string): Promise<void> {
    if (!supabase) {
      memory.items = memory.items.filter((i) => i.id !== id);
      return;
    }
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
  },

  async clearItems(): Promise<void> {
    if (!supabase) {
      memory.items = [];
      return;
    }
    const { error } = await supabase.from("items").delete().neq("id", "");
    if (error) throw error;
  },

  async getLogs(): Promise<ConsumptionLog[]> {
    if (!supabase) return memory.logs;
    const { data, error } = await supabase
      .from("consumption_logs")
      .select("*")
      .order("used_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToLog);
  },

  async addLog(log: ConsumptionLog): Promise<ConsumptionLog> {
    if (!supabase) {
      memory.logs.push(log);
      return log;
    }
    const { data, error } = await supabase
      .from("consumption_logs")
      .insert({
        id: log.id,
        food_id: log.foodId,
        amount: log.amount,
        waste: log.waste,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToLog(data);
  },
};
