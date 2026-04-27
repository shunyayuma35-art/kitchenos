import { useState, useEffect, useCallback } from "react";
import type { Language, DashboardStats, StationLoad } from "../types";
import { t } from "../i18n/translations";

interface InventoryAlert {
  ingredient_id: number;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  min_stock_alert: number;
  is_low: boolean;
  change_amount: number;
  reason: string;
}

interface CatSummary {
  category: string;
  emoji: string;
  total_items: number;
  critical_count: number;
  alert_count: number;
  ok_count: number;
  health_pct: number;
}

interface Props {
  language: Language;
}

const STATION_COLOR: Record<string, string> = {
  cooking: "#f39c12",
  plating: "#9b59b6",
  prep: "#27ae60",
};

const LOAD_COLOR: Record<string, string> = {
  idle:   "#8c6f5a",
  low:    "#27ae60",
  medium: "#f39c12",
  high:   "#e94560",
};

const LOAD_BG: Record<string, string> = {
  idle:   "rgba(140,111,90,0.10)",
  low:    "rgba(39,174,96,0.10)",
  medium: "rgba(245,158,11,0.10)",
  high:   "rgba(233,69,96,0.10)",
};

function fmtTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m${s}s` : `${m}m`;
}

export default function Dashboard({ language }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loads, setLoads] = useState<StationLoad[]>([]);
  const [ingredients, setIngredients] = useState<{ menu: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [catSummaries, setCatSummaries] = useState<CatSummary[]>([]);
  const [invAlerts, setInvAlerts] = useState<InventoryAlert[]>([]);
  const [invFlash, setInvFlash] = useState<InventoryAlert | null>(null);

  const fetchInventorySummary = useCallback(async () => {
    const res = await fetch("/api/inventory/order-suggestions");
    if (res.ok) {
      const data = await res.json();
      setCatSummaries(data.categories ?? []);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, loadsRes, ingRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/station-loads"),
        fetch("/api/dashboard/ingredient-usage"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (loadsRes.ok) {
        const data = await loadsRes.json();
        setLoads(data.stations ?? []);
      }
      if (ingRes.ok) {
        const data = await ingRes.json();
        setIngredients(data.menu_counts ?? []);
      }
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // リアルタイム: 在庫変動WSイベントを受信
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      if (msg?.type === "inventory_updated") {
        const d = msg.data as InventoryAlert;
        setInvFlash(d);
        setTimeout(() => setInvFlash(null), 5000);
        if (d.is_low) {
          setInvAlerts((prev) => {
            const filtered = prev.filter((a) => a.ingredient_id !== d.ingredient_id);
            return [d, ...filtered].slice(0, 10);
          });
        } else {
          setInvAlerts((prev) => prev.filter((a) => a.ingredient_id !== d.ingredient_id));
        }
        fetchInventorySummary();
      }
    };
    window.addEventListener("ws_message", handler);
    return () => window.removeEventListener("ws_message", handler);
  }, [fetchInventorySummary]);

  useEffect(() => {
    fetchAll();
    fetchInventorySummary();
    const id = setInterval(() => {
      fetchAll();
      fetchInventorySummary();
    }, 30000);
    return () => clearInterval(id);
  }, [fetchAll, fetchInventorySummary]);

  if (loading) {
    return <div style={s.center}>{t(language, "loading")}</div>;
  }

  const vsYesterday = stats
    ? stats.today_completed_tasks - stats.yesterday_completed_tasks
    : 0;

  return (
    <div style={s.root}>
      <div style={s.headerRow}>
        <h2 style={s.title}>📊 {t(language, "dashboard")}</h2>
        <div style={s.refreshRow}>
          {lastUpdated && (
            <span style={s.timestamp}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button style={s.refreshBtn} onClick={fetchAll}>↻</button>
        </div>
      </div>

      {/* ── KPI カード群 ── */}
      <div style={s.kpiGrid}>
        <KpiCard
          label={t(language, "activeOrders")}
          value={stats?.active_order_count ?? 0}
          color="#7fb3ff"
          icon="🍳"
        />
        <KpiCard
          label={t(language, "todayOrders")}
          value={stats?.today_order_count ?? 0}
          color="#27ae60"
          icon="📋"
          sub={vsYesterday >= 0 ? `+${vsYesterday} ${t(language, "vsYesterday")}` : `${vsYesterday} ${t(language, "vsYesterday")}`}
          subColor={vsYesterday >= 0 ? "#27ae60" : "#e94560"}
        />
        <KpiCard
          label={t(language, "avgTime")}
          value={stats ? fmtTime(stats.avg_duration_seconds) : "—"}
          color="#f39c12"
          icon="⏱"
        />
        <KpiCard
          label={t(language, "delayAlert")}
          value={stats?.delayed_task_count ?? 0}
          color={stats && stats.delayed_task_count > 0 ? "#e94560" : "#27ae60"}
          icon="⚠"
          sub={stats?.delayed_task_count === 0 ? t(language, "noDelay") : undefined}
          highlight={stats ? stats.delayed_task_count > 0 : false}
        />
      </div>

      {/* ── ステーション負荷 ── */}
      <section style={s.section}>
        <h3 style={s.sectionTitle}>🔥 {t(language, "stationLoad")}</h3>
        <div style={s.stationGrid}>
          {loads.map((load) => (
            <StationLoadCard key={load.station} load={load} language={language} />
          ))}
        </div>
      </section>

      {/* ── 遅延タスク一覧 ── */}
      {stats && stats.delayed_tasks.length > 0 && (
        <section style={s.section}>
          <h3 style={{ ...s.sectionTitle, color: "#e94560" }}>⚠ {t(language, "delayAlert")}</h3>
          <div style={s.delayList}>
            {stats.delayed_tasks.map((dt) => (
              <div key={dt.task_id} style={s.delayCard}>
                <span style={{ color: "#e94560", fontWeight: 700 }}>
                  {dt.task_type}
                </span>
                <span style={{ color: "#2d2013" }}>{dt.menu_name}</span>
                <span style={{ color: "#8c6f5a", fontSize: "0.85rem" }}>
                  🪑 {dt.table_number}
                </span>
                <span style={{ color: "#e94560", fontSize: "0.85rem", marginLeft: "auto" }}>
                  +{fmtTime(dt.elapsed_seconds)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 本日の注文メニュー ── */}
      {ingredients.length > 0 && (
        <section style={s.section}>
          <h3 style={s.sectionTitle}>📦 {t(language, "ingredientUsage")}</h3>
          <div style={s.menuList}>
            {ingredients.map((item) => (
              <div key={item.menu} style={s.menuRow}>
                <span style={{ color: "#2d2013", flex: 1 }}>{item.menu}</span>
                <span style={s.countBadge}>×{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── リアルタイム在庫フラッシュ通知 ── */}
      {invFlash && (
        <div style={{
          ...s.invFlash,
          borderColor: invFlash.is_low ? "#e94560" : "#27ae60",
          background: invFlash.is_low ? "rgba(233,69,96,0.08)" : "rgba(39,174,96,0.08)",
        }}>
          <span style={{ fontSize: "1.1rem" }}>{invFlash.is_low ? "⚠" : "✓"}</span>
          <span style={{ fontWeight: 700, color: invFlash.is_low ? "#e94560" : "#27ae60" }}>
            {invFlash.name}
          </span>
          <span style={{ color: "#8c6f5a", fontSize: "0.85rem" }}>
            {invFlash.change_amount > 0 ? `+${invFlash.change_amount}` : invFlash.change_amount}{invFlash.unit}
            　{invFlash.reason}
          </span>
          {invFlash.is_low && (
            <span style={{ marginLeft: "auto", color: "#e94560", fontSize: "0.82rem", fontWeight: 700 }}>
              残{invFlash.current_stock}{invFlash.unit} ⚠在庫不足
            </span>
          )}
        </div>
      )}

      {/* ── 在庫カテゴリ別ヘルスサマリー ── */}
      {catSummaries.length > 0 && (
        <section style={s.section}>
          <h3 style={s.sectionTitle}>🧮 在庫状況サマリー</h3>
          <div style={s.catGrid}>
            {catSummaries.map((cat) => {
              const color = cat.critical_count > 0 ? "#e94560"
                : cat.alert_count > 0 ? "#f39c12"
                : "#27ae60";
              return (
                <div key={cat.category} style={{ ...s.catCard, borderColor: color + "55" }}>
                  <div style={{ fontSize: "1.5rem" }}>{cat.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", color: "#8c6f5a", fontWeight: 600 }}>{cat.category}</div>
                    <div style={s.catBarTrack}>
                      <div style={{
                        ...s.catBarFill,
                        width: `${cat.health_pct}%`,
                        background: color,
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginTop: 3 }}>
                      <span style={{ color }}>{cat.health_pct}% 良好</span>
                      {cat.critical_count > 0 && (
                        <span style={{ color: "#e94560", fontWeight: 700 }}>🔴 {cat.critical_count}品 危機</span>
                      )}
                      {cat.alert_count > 0 && cat.critical_count === 0 && (
                        <span style={{ color: "#f39c12", fontWeight: 700 }}>⚠ {cat.alert_count}品 要注意</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 在庫不足アラート一覧（リアルタイム更新） ── */}
      {invAlerts.length > 0 && (
        <section style={s.section}>
          <h3 style={{ ...s.sectionTitle, color: "#e94560" }}>🚨 在庫不足アラート（リアルタイム）</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {invAlerts.map((a) => (
              <div key={a.ingredient_id} style={s.invAlertRow}>
                <span style={{ fontWeight: 700, color: "#e94560" }}>{a.name}</span>
                <span style={{ fontSize: "0.82rem", color: "#8c6f5a" }}>{a.category}</span>
                <span style={{ marginLeft: "auto", fontWeight: 800, color: "#e94560" }}>
                  残 {a.current_stock}{a.unit}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KpiCard({ label, value, color, icon, sub, subColor, highlight }: {
  label: string;
  value: string | number;
  color: string;
  icon: string;
  sub?: string;
  subColor?: string;
  highlight?: boolean;
}) {
  return (
    <div style={{
      ...s.kpiCard,
      borderColor: highlight ? color : "transparent",
      boxShadow: highlight ? `0 0 16px ${color}44` : "none",
    }}>
      <div style={{ fontSize: "1.5rem" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.78rem", color: "#8c6f5a", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: "1.6rem", fontWeight: 800, color }}>{value}</div>
        {sub && <div style={{ fontSize: "0.75rem", color: subColor ?? "#8c6f5a", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function StationLoadCard({ load, language }: { load: StationLoad; language: Language }) {
  const stColor = STATION_COLOR[load.station] ?? "#7fb3ff";
  const lvColor = LOAD_COLOR[load.load_level];
  const lvBg = LOAD_BG[load.load_level];
  const lvLabel = t(language, load.load_level as "idle" | "low" | "medium" | "high");

  return (
    <div style={{ ...s.stationCard, borderColor: stColor }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: stColor, fontWeight: 800, fontSize: "0.95rem" }}>
          {load.task_type}
        </span>
        <span style={{ ...s.levelBadge, background: lvBg, color: lvColor }}>
          {lvLabel}
        </span>
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2d2013", lineHeight: 1 }}>
        {load.pending_count}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#8c6f5a", marginTop: 4 }}>
        {load.pending_count === 1 ? "task" : "tasks"}
        {load.total_estimated_seconds > 0 && ` · ~${fmtTime(load.total_estimated_seconds)}`}
      </div>
      {load.delayed_count > 0 && (
        <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#e94560", fontWeight: 700 }}>
          ⚠ {load.delayed_count} 遅延
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 32px" },
  headerRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
  },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#2d2013" },
  refreshRow: { display: "flex", alignItems: "center", gap: 8 },
  timestamp: { fontSize: "0.78rem", color: "#8c6f5a" },
  refreshBtn: {
    background: "rgba(255,255,255,0.85)", border: "1px solid rgba(220,190,160,0.35)", color: "#8c6f5a",
    borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "1rem",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12, marginBottom: 24,
  },
  kpiCard: {
    background: "rgba(255,255,255,0.88)", borderRadius: 14, padding: "16px",
    display: "flex", gap: 12, alignItems: "flex-start",
    border: "2px solid transparent",
    boxShadow: "0 4px 16px rgba(180,100,60,0.08)",
    transition: "box-shadow 0.3s",
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "#2d2013", marginBottom: 12 },
  stationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  stationCard: {
    background: "rgba(255,255,255,0.88)", borderRadius: 14, padding: 16,
    border: "2px solid",
    boxShadow: "0 4px 16px rgba(180,100,60,0.08)",
  },
  levelBadge: {
    padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700,
  },
  delayList: { display: "flex", flexDirection: "column", gap: 8 },
  delayCard: {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(233,69,96,0.07)", border: "1px solid rgba(233,69,96,0.2)",
    borderRadius: 10, padding: "10px 14px",
  },
  menuList: { display: "flex", flexDirection: "column", gap: 6 },
  menuRow: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,248,240,0.8)", borderRadius: 8, padding: "8px 12px",
    border: "1px solid rgba(220,190,160,0.18)",
  },
  countBadge: {
    background: "rgba(124,157,207,0.14)", color: "#5a7daf",
    padding: "2px 10px", borderRadius: 6, fontWeight: 700, fontSize: "0.85rem",
  },
  center: { textAlign: "center", padding: 60, color: "#8c6f5a" },
  invFlash: {
    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const,
    padding: "10px 14px", borderRadius: 10, border: "1.5px solid",
    marginBottom: 16, transition: "all 0.3s",
  },
  catGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10,
  },
  catCard: {
    background: "rgba(255,255,255,0.88)", borderRadius: 12, padding: "12px",
    display: "flex", gap: 10, alignItems: "flex-start",
    border: "1.5px solid", boxShadow: "0 2px 10px rgba(180,100,60,0.06)",
  },
  catBarTrack: { height: 5, background: "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden", marginTop: 5 },
  catBarFill: { height: "100%", borderRadius: 99, transition: "width 0.5s" },
  invAlertRow: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(233,69,96,0.06)", border: "1px solid rgba(233,69,96,0.2)",
    borderRadius: 8, padding: "8px 12px",
  },
};
