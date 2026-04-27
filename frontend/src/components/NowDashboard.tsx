/**
 * NowDashboard — 「今やるべきこと」AI生成ダッシュボード
 *
 * - /api/tasks/now からAIスコアリング済みタスクを取得
 * - WebSocket tasks_now_updated / station_alert / timing_updated で自動更新
 * - ステーション別フィルタ
 * - 遅延・温度危険・サイドアラートを視覚的に表示
 * - タイムラインバー（完成予測）
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import type {
  Language,
  StationType,
  TaskNowItem,
  TasksNowResponse,
  StationAlertData,
} from "../types";
import { t } from "../i18n/translations";

const STATIONS: StationType[] = ["cooking", "plating", "prep", "admin"];

const STATION_EMOJI: Record<string, string> = {
  cooking: "🍳",
  plating: "🍽️",
  prep: "🥬",
  admin: "📊",
};

const TASK_TYPE_EMOJI: Record<string, string> = {
  調理: "🍳", 盛付: "🍽️", 仕込み: "🔪",
  cooking: "🍳", plating: "🍽️", prep: "🔪",
};

function fmtSec(s: number): string {
  if (s <= 0) return "0s";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r > 0 ? `${m}m${r}s` : `${m}m`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Priority bar ──────────────────────────────────────────
function PriorityBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 120) * 100);
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f97316" : "#22c55e";
  return (
    <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s" }} />
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────
function TaskCard({ task, lang }: { task: TaskNowItem; lang: Language }) {
  const isUrgent = task.priority_score >= 70;
  const isWarning = task.priority_score >= 40 && task.priority_score < 70;

  const borderColor = isUrgent ? "#ef4444" : isWarning ? "#f97316" : "#22c55e";
  const bgColor = isUrgent
    ? "rgba(239,68,68,0.06)"
    : isWarning
    ? "rgba(249,115,22,0.06)"
    : "rgba(255,255,255,0.88)";

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 10,
        border: `1.5px solid ${borderColor}`,
        boxShadow: isUrgent
          ? "0 0 12px rgba(239,68,68,0.18)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      {/* Urgent pulse ring */}
      {isUrgent && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ef4444",
            animation: "pulseDot 1.2s ease-in-out infinite",
          }}
        />
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 20 }}>{TASK_TYPE_EMOJI[task.task_type] ?? "🍳"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#2d2013", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {task.menu_name}
          </div>
          <div style={{ fontSize: 11, color: "#8c6f5a" }}>
            🪑 {task.table_number} · Step {task.step} · {task.task_type}
          </div>
        </div>
        <div style={{
          padding: "3px 8px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          background: borderColor,
          color: "#fff",
          whiteSpace: "nowrap",
        }}>
          {task.action}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        {task.is_delayed && (
          <span style={badge("#ef4444")}>{t(lang, "delayedBadge")} +{fmtSec(task.delay_seconds)}</span>
        )}
        {task.temperature_danger && (
          <span style={badge("#e07b00")}>{t(lang, "tempDangerBadge")}</span>
        )}
        {task.side_dish_alert && (
          <span style={badge("#7c3aed")}>{t(lang, "sideDishAlert")}</span>
        )}
        <span style={badge("#6b7280")}>
          {t(lang, "elapsedTime")}: {fmtSec(task.elapsed_seconds)}
        </span>
        <span style={badge(task.estimated_remaining_seconds > 0 ? "#059669" : "#6b7280")}>
          {t(lang, "remainingTime")}: {fmtSec(task.estimated_remaining_seconds)}
        </span>
      </div>

      {/* Staff */}
      {(task.assigned_staff || task.recommended_staff) && (
        <div style={{ fontSize: 12, color: "#8c6f5a" }}>
          👤 {task.assigned_staff ?? "—"}
          {task.recommended_staff && task.recommended_staff !== task.assigned_staff && (
            <span style={{ marginLeft: 6, color: "#7c3aed" }}>
              ✦ {t(lang, "recommendedStaff")}: {task.recommended_staff}
            </span>
          )}
        </div>
      )}

      <PriorityBar score={task.priority_score} />
    </div>
  );
}

function badge(color: string): React.CSSProperties {
  return {
    background: color + "18",
    color: color,
    border: `1px solid ${color}44`,
    borderRadius: 20,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}

// ── KPI Strip ─────────────────────────────────────────────
function KpiStrip({ data, lang }: { data: TasksNowResponse; lang: Language }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      {[
        { label: t(lang, "urgentTasks"), value: data.total_urgent, color: "#ef4444" },
        { label: t(lang, "warningTasks"), value: data.total_warning, color: "#f97316" },
        { label: t(lang, "normalTasks"), value: data.total_normal, color: "#22c55e" },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          flex: 1, minWidth: 90,
          background: color + "12",
          border: `1px solid ${color}30`,
          borderRadius: 10,
          padding: "8px 12px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
          <div style={{ fontSize: 11, color: "#8c6f5a" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Station Alert Banner ───────────────────────────────────
function AlertBanner({ alert, onClose }: { alert: StationAlertData; onClose: () => void }) {
  const colors: Record<string, string> = { normal: "#f97316", warning: "#dc2626", critical: "#7c3aed" };
  const bg = colors[alert.urgency] ?? "#f97316";
  return (
    <div style={{
      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
      color: "#fff",
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 10,
      animation: "fadeInDown 0.3s ease",
      boxShadow: `0 4px 16px ${bg}44`,
    }}>
      <span style={{ fontSize: 22 }}>🚨</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{alert.message}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
          🪑 {alert.table} · {alert.targets.join(" / ")}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
      >
        ✕
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
interface Props {
  lang: Language;
  station: StationType;
}

export default function NowDashboard({ lang, station }: Props) {
  const [data, setData] = useState<TasksNowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStation, setFilterStation] = useState<string>(
    station === "admin" ? "all" : station
  );
  const [stationAlerts, setStationAlerts] = useState<StationAlertData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const url =
        filterStation === "all"
          ? "/api/tasks/now"
          : `/api/tasks/now?station=${filterStation}`;
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [filterStation]);

  // Initial load + poll every 30s
  useEffect(() => {
    setLoading(true);
    load();
    timerRef.current = setInterval(load, 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  // WebSocket listener exposed via window event (dispatched from StationView)
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, data: wsData } = (e as CustomEvent).detail;
      if (type === "tasks_now_updated") {
        setData(wsData as TasksNowResponse);
        setLastUpdated(new Date());
      } else if (type === "station_alert") {
        setStationAlerts((prev) => [...prev.slice(-2), wsData as StationAlertData]);
        setTimeout(() => setStationAlerts((prev) => prev.slice(1)), 8000);
      }
    };
    window.addEventListener("ws_message", handler);
    return () => window.removeEventListener("ws_message", handler);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetch("/api/tasks/now/refresh", { method: "POST" });
    await load();
  };

  const tasks =
    data?.all_tasks.filter(
      (t) => filterStation === "all" || t.station === filterStation
    ) ?? [];

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* Station alerts */}
      {stationAlerts.map((a, i) => (
        <AlertBanner
          key={i}
          alert={a}
          onClose={() => setStationAlerts((prev) => prev.filter((_, j) => j !== i))}
        />
      ))}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#2d2013" }}>
            🤖 {t(lang, "nowDashboard")}
          </h2>
          <div style={{ fontSize: 11, color: "#a0896c", marginTop: 2 }}>
            {t(lang, "timingUpdated")}: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ↻ {t(lang, "refreshNow")}
        </button>
      </div>

      {/* Global alerts */}
      {data?.alerts.map((msg, i) => (
        <div key={i} style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          color: "#dc2626",
          fontWeight: 600,
          marginBottom: 8,
        }}>
          {msg}
        </div>
      ))}

      {/* KPI strip */}
      {data && <KpiStrip data={data} lang={lang} />}

      {/* Station filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto" }}>
        <StationTab label={`${t(lang, "allStations")}`} active={filterStation === "all"} onClick={() => setFilterStation("all")} />
        {STATIONS.filter((s) => s !== "admin" || station === "admin").map((s) => (
          <StationTab
            key={s}
            label={`${STATION_EMOJI[s]} ${t(lang, s as keyof ReturnType<typeof t> extends never ? "cooking" : typeof s)}`}
            active={filterStation === s}
            onClick={() => setFilterStation(s)}
            urgentCount={data?.all_tasks.filter((tk) => tk.station === s && tk.priority_score >= 70).length ?? 0}
          />
        ))}
      </div>

      {/* Task list */}
      {loading && (
        <div style={{ textAlign: "center", color: "#a0896c", padding: 32 }}>
          {t(lang, "loading")}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: 40,
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 12,
          color: "#059669",
          fontSize: 16,
          fontWeight: 700,
        }}>
          {t(lang, "noUrgentTasks")}
        </div>
      )}

      {!loading && tasks.map((task) => (
        <TaskCard key={task.task_id} task={task} lang={lang} />
      ))}
    </div>
  );
}

// ── Station Tab Button ─────────────────────────────────────
function StationTab({
  label,
  active,
  onClick,
  urgentCount = 0,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  urgentCount?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        padding: "7px 14px",
        borderRadius: 20,
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
        background: active
          ? "linear-gradient(135deg, #f97316, #ea580c)"
          : "rgba(255,255,255,0.7)",
        color: active ? "#fff" : "#8c6f5a",
        boxShadow: active ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
        transition: "all 0.15s",
      }}
    >
      {label}
      {urgentCount > 0 && (
        <span style={{
          position: "absolute",
          top: -4,
          right: -4,
          background: "#ef4444",
          color: "#fff",
          borderRadius: "50%",
          width: 16,
          height: 16,
          fontSize: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
        }}>
          {urgentCount}
        </span>
      )}
    </button>
  );
}
