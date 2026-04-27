import { useState, useEffect, useCallback } from "react";
import type { Ingredient, InventoryLog, Language } from "../types";
import { t } from "../i18n/translations";

interface OrderItem {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  avg_daily_usage: number;
  days_remaining: number | null;
  suggested_order: number;
  status: "critical" | "low" | "ok" | "no_data";
}

interface OrderCategory {
  category: string;
  emoji: string;
  total_items: number;
  critical_count: number;
  alert_count: number;
  ok_count: number;
  health_pct: number;
  items: OrderItem[];
}

interface OrderSuggestions {
  generated_at: string;
  target_days: number;
  total_order_items: number;
  categories: OrderCategory[];
}

interface Props {
  language: Language;
}

const UNITS = ["g", "kg", "ml", "L", "個", "枚", "本", "袋", "缶", "パック"];

const CATEGORIES: { key: string; label: string; emoji: string; color: string }[] = [
  { key: "野菜類",       label: "野菜類",       emoji: "🥦", color: "#27ae60" },
  { key: "肉類",         label: "肉類",         emoji: "🥩", color: "#e94560" },
  { key: "魚介類",       label: "魚介類",       emoji: "🐟", color: "#3498db" },
  { key: "ドリンク類",   label: "ドリンク類",   emoji: "🥤", color: "#9b59b6" },
  { key: "乾燥物",       label: "乾燥物",       emoji: "🌾", color: "#e67e22" },
  { key: "調味料品全般", label: "調味料品全般", emoji: "🧂", color: "#f39c12" },
  { key: "デザート材料類", label: "デザート材料類", emoji: "🍰", color: "#e91e8c" },
  { key: "粉物類",       label: "粉物類",       emoji: "🌀", color: "#7f8c8d" },
  { key: "その他",       label: "その他",       emoji: "📦", color: "#546e7a" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

export default function InventoryManager({ language }: Props) {
  const [tab, setTab] = useState<"stock" | "order">("stock");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Ingredient | null>(null);
  const [logTarget, setLogTarget] = useState<Ingredient | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [todayUsage, setTodayUsage] = useState<{ name: string; unit: string; total_used: number }[]>([]);
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(CATEGORIES.map((c) => c.key)));
  const [filterCat, setFilterCat] = useState<string>("all");
  const [orderData, setOrderData] = useState<OrderSuggestions | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [invFlash, setInvFlash] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [ingRes, usageRes] = await Promise.all([
      fetch("/api/inventory/"),
      fetch("/api/inventory/usage/today"),
    ]);
    if (ingRes.ok) setIngredients(await ingRes.json());
    if (usageRes.ok) {
      const data = await usageRes.json();
      setTodayUsage(data.usage ?? []);
    }
    setLoading(false);
  }, []);

  const fetchOrderSuggestions = useCallback(async () => {
    setOrderLoading(true);
    const res = await fetch("/api/inventory/order-suggestions");
    if (res.ok) setOrderData(await res.json());
    setOrderLoading(false);
  }, []);

  // リアルタイムWS: 在庫変動を受信したら自動リフレッシュ
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      if (msg?.type === "inventory_updated") {
        const d = msg.data;
        setInvFlash(`${d.name} が更新されました（${d.change_amount > 0 ? "+" : ""}${d.change_amount}${d.unit}）`);
        setTimeout(() => setInvFlash(null), 4000);
        fetchAll();
        if (tab === "order") fetchOrderSuggestions();
      }
    };
    window.addEventListener("ws_message", handler);
    return () => window.removeEventListener("ws_message", handler);
  }, [fetchAll, fetchOrderSuggestions, tab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (tab === "order" && !orderData) fetchOrderSuggestions();
  }, [tab, orderData, fetchOrderSuggestions]);

  const openLogs = async (ing: Ingredient) => {
    setLogTarget(ing);
    const res = await fetch(`/api/inventory/${ing.id}/logs`);
    if (res.ok) setLogs(await res.json());
  };

  const deleteIngredient = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    if (res.ok) setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleCat = (key: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const alertCount = ingredients.filter(
    (i) => i.min_stock_alert > 0 && i.current_stock <= i.min_stock_alert
  ).length;

  if (loading) return <div style={s.center}>{t(language, "loading")}</div>;

  if (logTarget) {
    return (
      <div style={s.root}>
        <div style={s.headerRow}>
          <h2 style={s.title}>📋 {t(language, "stockHistory")} — {logTarget.name}</h2>
          <button className="btn-secondary btn-small" onClick={() => { setLogTarget(null); setLogs([]); }}>
            ← {t(language, "back")}
          </button>
        </div>
        <div style={s.logList}>
          {logs.length === 0 ? (
            <div style={s.empty}>履歴なし</div>
          ) : logs.map((log) => (
            <div key={log.id} style={{ ...s.logRow, borderColor: log.change_amount >= 0 ? "#27ae6044" : "#e9456044" }}>
              <span style={{ color: log.change_amount >= 0 ? "#27ae60" : "#e94560", fontWeight: 800, fontSize: "1rem" }}>
                {log.change_amount >= 0 ? "+" : ""}{log.change_amount}{logTarget.unit}
              </span>
              <span style={s.logReason}>{log.reason}</span>
              {log.note && <span style={{ color: "#a0a0b0", fontSize: "0.8rem" }}>{log.note}</span>}
              <span style={{ color: "#555570", fontSize: "0.75rem", marginLeft: "auto" }}>
                {new Date(log.created_at).toLocaleString("ja-JP")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (adjustTarget) {
    return (
      <AdjustForm
        ingredient={adjustTarget}
        language={language}
        onDone={(updated) => {
          setIngredients((prev) => prev.map((i) => i.id === updated.id ? updated : i));
          setAdjustTarget(null);
        }}
        onCancel={() => setAdjustTarget(null)}
      />
    );
  }

  if (showForm) {
    return (
      <IngredientForm
        language={language}
        onSaved={(ing) => {
          setIngredients((prev) => [...prev, ing]);
          setShowForm(false);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  /* カテゴリ別グループ */
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: ingredients.filter((i) => (i.category || "その他") === cat.key),
  })).filter((g) => g.items.length > 0 || filterCat === "all");

  const displayGroups = filterCat === "all"
    ? grouped.filter((g) => g.items.length > 0)
    : grouped.filter((g) => g.key === filterCat);

  return (
    <div style={s.root}>
      {/* ヘッダー */}
      <div style={s.headerRow}>
        <h2 style={s.title}>
          📦 {t(language, "inventory")}
          {alertCount > 0 && <span style={s.alertBadge}>⚠ {alertCount}</span>}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary btn-small" onClick={() => { fetchAll(); if (tab === "order") fetchOrderSuggestions(); }}>↻</button>
          {tab === "stock" && (
            <button className="btn-primary btn-small" onClick={() => setShowForm(true)}>
              + {t(language, "addIngredient")}
            </button>
          )}
        </div>
      </div>

      {/* メインタブ */}
      <div style={s.mainTabRow}>
        <button
          style={{ ...s.mainTab, ...(tab === "stock" ? s.mainTabActive : {}) }}
          onClick={() => setTab("stock")}
        >
          📦 在庫管理
        </button>
        <button
          style={{ ...s.mainTab, ...(tab === "order" ? s.mainTabActive : {}) }}
          onClick={() => setTab("order")}
        >
          📊 発注ダッシュボード
          {orderData && orderData.total_order_items > 0 && (
            <span style={s.orderBadge}>{orderData.total_order_items}</span>
          )}
        </button>
      </div>

      {/* リアルタイム更新フラッシュ */}
      {invFlash && (
        <div style={s.flash}>🔄 {invFlash}</div>
      )}

      {/* ── 発注ダッシュボード ── */}
      {tab === "order" && (
        <OrderDashboard
          data={orderData}
          loading={orderLoading}
          onRefresh={fetchOrderSuggestions}
        />
      )}

      {tab === "stock" && (<>
      {/* カテゴリフィルタータブ */}
      <div style={s.catTabRow}>
        <button
          style={{ ...s.catTab, ...(filterCat === "all" ? s.catTabActive : {}) }}
          onClick={() => setFilterCat("all")}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => {
          const count = ingredients.filter((i) => (i.category || "その他") === cat.key).length;
          if (count === 0) return null;
          const alertInCat = ingredients.filter(
            (i) => (i.category || "その他") === cat.key && i.min_stock_alert > 0 && i.current_stock <= i.min_stock_alert
          ).length;
          return (
            <button
              key={cat.key}
              style={{
                ...s.catTab,
                ...(filterCat === cat.key ? { ...s.catTabActive, borderColor: cat.color, color: cat.color } : {}),
              }}
              onClick={() => setFilterCat(cat.key)}
            >
              {cat.emoji} {cat.label}
              <span style={{ ...s.catCount, ...(alertInCat > 0 ? { background: "#e9456033", color: "#e94560" } : {}) }}>
                {alertInCat > 0 ? `⚠${alertInCat}` : count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 本日の使用量サマリー */}
      {todayUsage.length > 0 && filterCat === "all" && (
        <section style={s.section}>
          <h3 style={s.sectionTitle}>📊 {t(language, "todayUsage")}</h3>
          <div style={s.usageGrid}>
            {todayUsage.map((u) => (
              <div key={u.name} style={s.usageCard}>
                <div style={{ fontWeight: 700, color: "#eaeaea" }}>{u.name}</div>
                <div style={{ color: "#e94560", fontWeight: 800, fontSize: "1.1rem" }}>
                  -{u.total_used}{u.unit}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* カテゴリ別セクション */}
      {ingredients.length === 0 ? (
        <div style={s.empty}>{t(language, "noIngredients")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {displayGroups.map((cat: typeof grouped[number]) => {
            const isOpen = openCats.has(cat.key);
            const catAlerts = cat.items.filter(
              (i) => i.min_stock_alert > 0 && i.current_stock <= i.min_stock_alert
            ).length;
            return (
              <div key={cat.key} style={{ ...s.catSection, borderColor: cat.color + "44" }}>
                {/* セクションヘッダー */}
                <button
                  style={{ ...s.catHeader, borderBottomColor: isOpen ? cat.color + "33" : "transparent" }}
                  onClick={() => toggleCat(cat.key)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.4rem" }}>{cat.emoji}</span>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: cat.color }}>{cat.label}</span>
                    <span style={{ color: "#555570", fontSize: "0.85rem", fontWeight: 600 }}>
                      {cat.items.length}品目
                    </span>
                    {catAlerts > 0 && (
                      <span style={s.alertBadge}>⚠ {catAlerts}</span>
                    )}
                  </span>
                  <span style={{ color: "#555570", fontSize: "0.9rem", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▼
                  </span>
                </button>

                {/* 食材カード一覧 */}
                {isOpen && (
                  <div style={s.catBody}>
                    {cat.items.map((ing) => {
                      const isLow = ing.min_stock_alert > 0 && ing.current_stock <= ing.min_stock_alert;
                      const pct = ing.min_stock_alert > 0
                        ? Math.min(100, (ing.current_stock / (ing.min_stock_alert * 3)) * 100)
                        : null;
                      return (
                        <div
                          key={ing.id}
                          style={{
                            ...s.card,
                            borderColor: isLow ? "#e94560" : cat.color + "55",
                            boxShadow: isLow ? "0 0 12px #e9456033" : "none",
                          }}
                        >
                          <div style={s.cardTop}>
                            <div>
                              <span style={s.ingName}>{ing.name}</span>
                              <span style={{ ...s.unitTag, background: cat.color + "22", color: cat.color }}>{ing.unit}</span>
                              {isLow && <span style={s.lowBadge}>⚠ {t(language, "stockLow")}</span>}
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button style={s.iconBtn} onClick={() => openLogs(ing)} title="履歴">📋</button>
                              <button style={s.iconBtn} onClick={() => setAdjustTarget(ing)} title="在庫調整">+/-</button>
                              <button style={{ ...s.iconBtn, color: "#e94560" }} onClick={() => deleteIngredient(ing.id)}>🗑</button>
                            </div>
                          </div>

                          <div style={s.stockRow}>
                            <span style={{ ...s.stockNum, color: isLow ? "#e94560" : cat.color }}>
                              {ing.current_stock}{ing.unit}
                            </span>
                            {ing.min_stock_alert > 0 && (
                              <span style={{ color: "#a0a0b0", fontSize: "0.8rem" }}>
                                / アラート: {ing.min_stock_alert}{ing.unit}
                              </span>
                            )}
                          </div>

                          {pct !== null && (
                            <div style={s.barTrack}>
                              <div style={{
                                ...s.barFill,
                                width: `${pct}%`,
                                background: isLow ? "#e94560" : pct < 50 ? "#f39c12" : cat.color,
                              }} />
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            {[10, 50, 100, 500].map((amt) => (
                              <button
                                key={amt}
                                style={{ ...s.quickBtn, color: cat.color, borderColor: cat.color + "44", background: cat.color + "11" }}
                                onClick={async () => {
                                  const res = await fetch(`/api/inventory/${ing.id}/adjust`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ amount: amt, reason: "入荷" }),
                                  });
                                  if (res.ok) {
                                    const updated: Ingredient = await res.json();
                                    setIngredients((prev) => prev.map((i) => i.id === updated.id ? updated : i));
                                  }
                                }}
                              >
                                +{amt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>)}
    </div>
  );
}

// ── 発注ダッシュボード ────────────────────────────────────
function OrderDashboard({ data, loading, onRefresh }: {
  data: OrderSuggestions | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const [showOrderOnly, setShowOrderOnly] = useState(false);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#a0a0b0" }}>読み込み中...</div>;
  if (!data) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <button className="btn-primary" onClick={onRefresh}>発注データを取得</button>
    </div>
  );

  const toggleCat = (key: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const STATUS_COLOR: Record<string, string> = {
    critical: "#e94560",
    low: "#f39c12",
    ok: "#27ae60",
    no_data: "#555570",
  };
  const STATUS_LABEL: Record<string, string> = {
    critical: "🔴 危機",
    low: "🟡 要注意",
    ok: "🟢 良好",
    no_data: "⚪ データなし",
  };

  const totalOrderItems = data.categories.reduce((sum, c) => sum + c.items.filter(i => i.suggested_order > 0).length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* サマリーバー */}
      <div style={od.summaryBar}>
        <div style={od.summaryItem}>
          <span style={{ fontSize: "1.4rem" }}>📋</span>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#a0a0b0" }}>発注必要品目</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#7fb3ff" }}>{totalOrderItems}</div>
          </div>
        </div>
        <div style={od.summaryItem}>
          <span style={{ fontSize: "1.4rem" }}>⏱</span>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#a0a0b0" }}>目標在庫日数</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#27ae60" }}>{data.target_days}日分</div>
          </div>
        </div>
        <div style={od.summaryItem}>
          <span style={{ fontSize: "1.4rem" }}>🕐</span>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#a0a0b0" }}>最終更新</div>
            <div style={{ fontSize: "0.85rem", color: "#eaeaea" }}>
              {new Date(data.generated_at).toLocaleTimeString("ja-JP")}
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button
            style={{ ...od.filterBtn, ...(showOrderOnly ? od.filterBtnActive : {}) }}
            onClick={() => setShowOrderOnly(!showOrderOnly)}
          >
            発注品のみ
          </button>
          <button className="btn-secondary btn-small" onClick={onRefresh}>↻ 更新</button>
        </div>
      </div>

      {/* カテゴリ別発注リスト */}
      {data.categories.map((cat) => {
        const displayItems = showOrderOnly
          ? cat.items.filter(i => i.suggested_order > 0)
          : cat.items;
        if (displayItems.length === 0) return null;

        const isOpen = openCats.has(cat.category);
        const needOrderCount = cat.items.filter(i => i.suggested_order > 0).length;
        const healthColor = cat.critical_count > 0 ? "#e94560"
          : cat.alert_count > 0 ? "#f39c12" : "#27ae60";

        return (
          <div key={cat.category} style={{ ...od.catSection, borderColor: healthColor + "44" }}>
            {/* カテゴリヘッダー */}
            <button style={{ ...od.catHeader, borderBottomColor: isOpen ? healthColor + "33" : "transparent" }}
              onClick={() => toggleCat(cat.category)}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{cat.emoji}</span>
                <span style={{ fontWeight: 800, color: healthColor }}>{cat.category}</span>
                {/* ヘルスバー */}
                <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${cat.health_pct}%`, height: "100%", background: healthColor, borderRadius: 99 }} />
                </div>
                <span style={{ color: "#555570", fontSize: "0.82rem" }}>{cat.health_pct}%</span>
                {needOrderCount > 0 && (
                  <span style={{ background: "#e9456033", color: "#e94560", borderRadius: 999, padding: "1px 8px", fontSize: "0.78rem", fontWeight: 700 }}>
                    発注 {needOrderCount}品
                  </span>
                )}
              </span>
              <span style={{ color: "#555570", fontSize: "0.9rem", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
            </button>

            {/* 食材別発注テーブル */}
            {isOpen && (
              <div style={od.tableWrap}>
                <table style={od.table}>
                  <thead>
                    <tr>
                      <th style={od.th}>食材名</th>
                      <th style={od.th}>現在庫</th>
                      <th style={od.th}>日平均消費</th>
                      <th style={od.th}>残り日数</th>
                      <th style={od.th}>推奨発注量</th>
                      <th style={od.th}>状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item) => {
                      const sc = STATUS_COLOR[item.status];
                      return (
                        <tr key={item.id} style={{ background: item.status === "critical" ? "#e9456011" : item.status === "low" ? "#f39c1211" : "transparent" }}>
                          <td style={od.td}><span style={{ fontWeight: 700, color: "#eaeaea" }}>{item.name}</span></td>
                          <td style={od.td}>
                            <span style={{ fontWeight: 700, color: sc }}>{item.current_stock}{item.unit}</span>
                          </td>
                          <td style={{ ...od.td, color: "#a0a0b0" }}>
                            {item.avg_daily_usage > 0 ? `${item.avg_daily_usage}${item.unit}/日` : "—"}
                          </td>
                          <td style={od.td}>
                            <span style={{ fontWeight: 700, color: sc }}>
                              {item.days_remaining !== null ? `${item.days_remaining}日` : "—"}
                            </span>
                          </td>
                          <td style={od.td}>
                            {item.suggested_order > 0 ? (
                              <span style={{ fontWeight: 800, color: "#7fb3ff", background: "#7fb3ff22", padding: "2px 10px", borderRadius: 6 }}>
                                +{item.suggested_order}{item.unit}
                              </span>
                            ) : (
                              <span style={{ color: "#27ae60", fontSize: "0.85rem" }}>不要</span>
                            )}
                          </td>
                          <td style={od.td}>
                            <span style={{ color: sc, fontWeight: 700, fontSize: "0.82rem" }}>
                              {STATUS_LABEL[item.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* 発注リスト（まとめ） */}
      {totalOrderItems > 0 && (
        <div style={od.orderListCard}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#eaeaea", marginBottom: 12 }}>
            📋 今日の発注リスト（{totalOrderItems}品目）
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.categories.flatMap(cat =>
              cat.items
                .filter(i => i.suggested_order > 0)
                .map(item => (
                  <div key={item.id} style={od.orderRow}>
                    <span style={{ fontSize: "1rem" }}>{cat.emoji}</span>
                    <span style={{ fontWeight: 700, color: "#eaeaea", flex: 1 }}>{item.name}</span>
                    <span style={{ color: "#a0a0b0", fontSize: "0.82rem" }}>{cat.category}</span>
                    <span style={{ fontWeight: 800, color: "#7fb3ff", marginLeft: "auto" }}>
                      +{item.suggested_order}{item.unit}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: STATUS_COLOR[item.status], fontWeight: 700 }}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                ))
            )}
          </div>
          <div style={{ marginTop: 12, fontSize: "0.78rem", color: "#555570" }}>
            ※ 過去7日間の平均消費量をもとに {data.target_days}日分の在庫を確保する発注量を算出しています
          </div>
        </div>
      )}
    </div>
  );
}

const od: Record<string, React.CSSProperties> = {
  summaryBar: {
    display: "flex", gap: 16, flexWrap: "wrap" as const, alignItems: "center",
    background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  summaryItem: { display: "flex", gap: 10, alignItems: "center" },
  filterBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#a0a0b0", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
  },
  filterBtnActive: { background: "#7fb3ff22", borderColor: "#7fb3ff", color: "#7fb3ff" },
  catSection: { background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid", overflow: "hidden" },
  catHeader: {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "none", borderBottom: "1px solid",
    padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  tableWrap: { overflowX: "auto" as const, padding: "0 8px 8px" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.88rem" },
  th: { padding: "8px 12px", color: "#555570", fontWeight: 600, textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" as const },
  td: { padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" as const },
  orderListCard: {
    background: "rgba(127,179,255,0.05)", borderRadius: 14, padding: 16,
    border: "1.5px solid rgba(127,179,255,0.2)",
  },
  orderRow: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px",
  },
};

// ── 在庫調整フォーム ────────────────────────────────────
function AdjustForm({ ingredient, language, onDone, onCancel }: {
  ingredient: Ingredient;
  language: Language;
  onDone: (updated: Ingredient) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"restock" | "dispose" | "adjust">("restock");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cat = CAT_MAP[ingredient.category] ?? CAT_MAP["その他"];

  const handleSubmit = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    const change = mode === "dispose" ? -n : n;
    const reason = mode === "restock" ? "入荷" : mode === "dispose" ? "廃棄" : "手動調整";
    setSubmitting(true);
    const res = await fetch(`/api/inventory/${ingredient.id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: change, reason, note: note || null }),
    });
    if (res.ok) onDone(await res.json());
    setSubmitting(false);
  };

  return (
    <div style={s.root}>
      <div style={s.headerRow}>
        <h2 style={s.title}>
          {cat.emoji} {ingredient.name} — 在庫調整
          <span style={{ ...s.unitTag, background: cat.color + "22", color: cat.color, marginLeft: 8 }}>
            {cat.label}
          </span>
        </h2>
        <button className="btn-secondary btn-small" onClick={onCancel}>{t(language, "cancel")}</button>
      </div>

      <div style={s.adjustCard}>
        <div style={{ fontSize: "0.85rem", color: "#a0a0b0", marginBottom: 12 }}>
          {t(language, "currentStock")}: <strong style={{ color: "#eaeaea" }}>{ingredient.current_stock}{ingredient.unit}</strong>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["restock", "dispose", "adjust"] as const).map((m) => (
            <button
              key={m}
              style={{ ...s.modeBtn, ...(mode === m ? s.modeBtnActive : {}) }}
              onClick={() => setMode(m)}
            >
              {m === "restock" ? "📥 入荷" : m === "dispose" ? "🗑 廃棄" : "✏ 手動調整"}
            </button>
          ))}
        </div>

        <div style={s.formRow}>
          <label style={s.label}>{mode === "dispose" ? t(language, "disposeAmount") : t(language, "restockAmount")} ({ingredient.unit})</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例: 500"
            style={s.input}
            autoFocus
          />
        </div>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "note")}（任意）</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 〇〇業者から入荷"
            style={s.input}
          />
        </div>

        <button
          className={mode === "dispose" ? "btn-secondary" : "btn-primary"}
          style={{ width: "100%", marginTop: 8 }}
          disabled={submitting || !amount}
          onClick={handleSubmit}
        >
          {submitting ? "処理中..." : mode === "restock" ? "入荷を記録" : mode === "dispose" ? "廃棄を記録" : "調整を記録"}
        </button>
      </div>
    </div>
  );
}

// ── 食材登録フォーム ────────────────────────────────────
function IngredientForm({ language, onSaved, onCancel }: {
  language: Language;
  onSaved: (ing: Ingredient) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");
  const [stock, setStock] = useState("");
  const [minAlert, setMinAlert] = useState("");
  const [category, setCategory] = useState("その他");
  const [submitting, setSubmitting] = useState(false);

  const selectedCat = CAT_MAP[category] ?? CAT_MAP["その他"];

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/inventory/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        unit,
        current_stock: parseFloat(stock) || 0,
        min_stock_alert: parseFloat(minAlert) || 0,
        category,
      }),
    });
    if (res.ok) onSaved(await res.json());
    setSubmitting(false);
  };

  return (
    <div style={s.root}>
      <div style={s.headerRow}>
        <h2 style={s.title}>+ {t(language, "addIngredient")}</h2>
        <button className="btn-secondary btn-small" onClick={onCancel}>{t(language, "cancel")}</button>
      </div>

      <div style={s.adjustCard}>
        {/* カテゴリ選択 */}
        <div style={s.formRow}>
          <label style={s.label}>カテゴリ</label>
          <div style={s.catSelectGrid}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                style={{
                  ...s.catSelectBtn,
                  borderColor: category === cat.key ? cat.color : "rgba(255,255,255,0.08)",
                  background: category === cat.key ? cat.color + "22" : "transparent",
                  color: category === cat.key ? cat.color : "#a0a0b0",
                }}
                onClick={() => setCategory(cat.key)}
              >
                <span style={{ fontSize: "1.2rem" }}>{cat.emoji}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={s.formRow}>
          <label style={s.label}>{t(language, "ingredientName")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`例: ${selectedCat.emoji} キャベツ`}
            style={s.input}
            autoFocus
          />
        </div>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "unit")}</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={s.input}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={s.formRow}>
            <label style={s.label}>{t(language, "currentStock")}</label>
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" style={s.input} />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>{t(language, "minStockAlert")}</label>
            <input type="number" min={0} value={minAlert} onChange={(e) => setMinAlert(e.target.value)} placeholder="0" style={s.input} />
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          disabled={submitting || !name.trim()}
          onClick={handleSubmit}
        >
          {submitting ? "登録中..." : t(language, "submit")}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 32px" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea", display: "flex", alignItems: "center", gap: 10 },
  alertBadge: {
    background: "#e9456033", color: "#e94560",
    borderRadius: 999, padding: "2px 10px", fontSize: "0.8rem", fontWeight: 700,
  },
  catTabRow: {
    display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 20,
  },
  catTab: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#a0a0b0", borderRadius: 20, padding: "6px 14px",
    cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
    display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
  },
  catTabActive: {
    background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)", color: "#eaeaea",
  },
  catCount: {
    background: "rgba(255,255,255,0.1)", color: "#a0a0b0",
    borderRadius: 999, padding: "1px 7px", fontSize: "0.75rem", fontWeight: 700,
  },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#eaeaea", marginBottom: 10 },
  usageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 },
  usageCard: { background: "#16213e", borderRadius: 10, padding: "12px", border: "1px solid #e9456033" },
  catSection: {
    background: "rgba(255,255,255,0.02)", borderRadius: 14,
    border: "1px solid", overflow: "hidden",
  },
  catHeader: {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "none", borderBottom: "1px solid",
    padding: "14px 16px", cursor: "pointer",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    transition: "background 0.15s",
  },
  catBody: {
    padding: "12px 16px",
    display: "flex", flexDirection: "column" as const, gap: 10,
  },
  card: {
    background: "#1a1a2e", borderRadius: 12, padding: 14,
    border: "1.5px solid", transition: "box-shadow 0.2s",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  ingName: { fontWeight: 700, fontSize: "1rem", color: "#eaeaea" },
  unitTag: {
    marginLeft: 8,
    padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700,
  },
  lowBadge: {
    marginLeft: 8, background: "#e9456033", color: "#e94560",
    padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700,
  },
  stockRow: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 },
  stockNum: { fontSize: "1.7rem", fontWeight: 800, lineHeight: 1 },
  barTrack: { height: 5, background: "#0f0f1a", borderRadius: 99, overflow: "hidden", marginBottom: 4 },
  barFill: { height: "100%", borderRadius: 99, transition: "width 0.5s" },
  quickBtn: {
    border: "1px solid", borderRadius: 8,
    padding: "6px 10px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700,
  },
  iconBtn: {
    background: "#16213e", border: "1px solid #0f3460", color: "#a0a0b0",
    borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: "0.85rem",
  },
  logList: { display: "flex", flexDirection: "column", gap: 8 },
  logRow: {
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const,
    background: "#16213e", borderRadius: 10, padding: "10px 14px",
    border: "1px solid",
  },
  logReason: { color: "#a0a0b0", fontSize: "0.85rem" },
  adjustCard: { background: "#16213e", borderRadius: 14, padding: 24, maxWidth: 520 },
  formRow: { marginBottom: 16 },
  label: { display: "block", fontSize: "0.85rem", color: "#a0a0b0", marginBottom: 6, fontWeight: 600 },
  input: {
    background: "#1a1a2e", border: "2px solid #0f3460", borderRadius: 8,
    color: "#eaeaea", padding: "10px 14px", fontSize: "0.95rem",
    outline: "none", width: "100%",
  },
  modeBtn: {
    flex: 1, background: "#1a1a2e", border: "2px solid #0f3460",
    color: "#a0a0b0", borderRadius: 10, padding: "10px",
    cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
  },
  modeBtnActive: { borderColor: "#7fb3ff", color: "#7fb3ff", background: "#7fb3ff11" },
  catSelectGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
  },
  catSelectBtn: {
    border: "1.5px solid", borderRadius: 10, padding: "10px 6px",
    cursor: "pointer", display: "flex", flexDirection: "column" as const,
    alignItems: "center", gap: 4, transition: "all 0.15s",
  },
  center: { textAlign: "center", padding: 60, color: "#a0a0b0" },
  empty: { textAlign: "center", padding: 40, color: "#555570" },
  mainTabRow: { display: "flex", gap: 8, marginBottom: 16 },
  mainTab: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
    color: "#a0a0b0", borderRadius: 10, padding: "10px 18px",
    cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, transition: "all 0.15s",
  },
  mainTabActive: {
    background: "rgba(127,179,255,0.12)", borderColor: "#7fb3ff", color: "#7fb3ff",
  },
  orderBadge: {
    background: "#e9456033", color: "#e94560",
    borderRadius: 999, padding: "1px 7px", fontSize: "0.75rem", fontWeight: 800,
  },
  flash: {
    background: "rgba(127,179,255,0.1)", border: "1px solid rgba(127,179,255,0.3)",
    color: "#7fb3ff", borderRadius: 8, padding: "8px 14px",
    fontSize: "0.85rem", fontWeight: 600, marginBottom: 12,
  },
};
