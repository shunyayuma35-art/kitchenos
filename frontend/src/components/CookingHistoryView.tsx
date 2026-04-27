import React, { useEffect, useState, useCallback } from "react";
import type { Language, CookingHistory, DailyReport, MonthlyReport } from "../types";
import { t } from "../i18n/translations";

const API = "";

interface Props {
  lang: Language;
  orderId?: number;
  staffId?: string;
}

type TabType = "history" | "daily" | "monthly";

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TASK_TYPE_EMOJI: Record<string, string> = {
  調理: "🍳",
  盛付: "🍽️",
  仕込み: "🔪",
  cooking: "🍳",
  plating: "🍽️",
  prep: "🔪",
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'Noto Sans JP', sans-serif",
    padding: "0",
  },
  tabBar: {
    display: "flex",
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    padding: "8px 16px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: "rgba(255,255,255,0.6)",
    color: "#8c6f5a",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
  },
  card: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    border: "1px solid rgba(249,115,22,0.12)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 1,
  },
  menuName: {
    fontWeight: 700,
    fontSize: 15,
    color: "#2d2013",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#8c6f5a",
  },
  metaRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap" as const,
  },
  metaItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  metaLabel: {
    fontSize: 10,
    color: "#a0896c",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  metaValue: {
    fontSize: 13,
    color: "#3d2010",
    fontWeight: 600,
  },
  noData: {
    textAlign: "center" as const,
    color: "#a0896c",
    padding: "32px 0",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#8c6f5a",
    marginBottom: 8,
    marginTop: 16,
  },
  reportCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    border: "1px solid rgba(249,115,22,0.12)",
  },
  kpiRow: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap" as const,
  },
  kpiCard: {
    background: "rgba(249,115,22,0.08)",
    borderRadius: 10,
    padding: "10px 16px",
    minWidth: 120,
    flex: 1,
  },
  kpiLabel: {
    fontSize: 11,
    color: "#a0896c",
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 800,
    color: "#ea580c",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 8,
    padding: "6px 10px",
    background: "rgba(249,115,22,0.08)",
    borderRadius: 6,
    marginBottom: 4,
    fontSize: 11,
    color: "#a0896c",
    fontWeight: 700,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 8,
    padding: "6px 10px",
    borderBottom: "1px solid rgba(249,115,22,0.08)",
    fontSize: 13,
    color: "#3d2010",
  },
  datePickerRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  input: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid rgba(249,115,22,0.3)",
    background: "rgba(255,255,255,0.9)",
    fontSize: 13,
    color: "#2d2013",
    outline: "none",
  },
  btn: {
    padding: "6px 16px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

// ── History Tab ───────────────────────────────────────────
function HistoryList({ lang, orderId, staffId }: { lang: Language; orderId?: number; staffId?: string }) {
  const [items, setItems] = useState<CookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let url: string;
      if (orderId) {
        url = `${API}/api/cooking-history/order/${orderId}`;
      } else if (staffId) {
        url = `${API}/api/cooking-history/staff/${staffId}`;
      } else {
        url = `${API}/api/cooking-history/?limit=100`;
      }
      const res = await fetch(url);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [orderId, staffId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={styles.noData}>{t(lang, "loading")}</p>;
  if (items.length === 0) return <p style={styles.noData}>{t(lang, "noHistory")}</p>;

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.emoji}>{TASK_TYPE_EMOJI[item.task_type] ?? "🍳"}</span>
            <span style={styles.menuName}>{item.menu_name ?? item.task_type}</span>
            <span style={styles.time}>{formatDate(item.completed_at)}</span>
          </div>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>{t(lang, "staffLabel")}</span>
              <span style={styles.metaValue}>👤 {item.staff_id}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>{t(lang, "stationLabel")}</span>
              <span style={styles.metaValue}>{item.station}</span>
            </div>
            {item.table_number && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>{t(lang, "tableLabel")}</span>
                <span style={styles.metaValue}>🪑 {item.table_number}</span>
              </div>
            )}
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>{t(lang, "stepLabel")}</span>
              <span style={styles.metaValue}>{item.step ?? "-"}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>{t(lang, "durationLabel")}</span>
              <span style={styles.metaValue}>⏱ {formatDuration(item.duration_seconds)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Daily Report Tab ──────────────────────────────────────
function DailyReportTab({ lang }: { lang: Language }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cooking-history/reports/daily?target_date=${date}`);
      if (res.ok) setReport(await res.json());
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={styles.datePickerRow}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
        />
        <button style={styles.btn} onClick={load}>{t(lang, "submit")}</button>
      </div>
      {loading && <p style={styles.noData}>{t(lang, "loading")}</p>}
      {report && !loading && (
        <>
          <div style={styles.kpiRow}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{t(lang, "totalTasks")}</div>
              <div style={styles.kpiValue}>{report.total_tasks}</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{t(lang, "avgDuration")}</div>
              <div style={styles.kpiValue}>{formatDuration(report.avg_duration_seconds)}</div>
            </div>
          </div>

          <div style={styles.sectionTitle}>{t(lang, "staffReport")}</div>
          <div style={styles.reportCard}>
            <div style={styles.tableHeader}>
              <span>{t(lang, "staffLabel")}</span>
              <span>{t(lang, "totalTasks")}</span>
              <span>{t(lang, "avgDuration")}</span>
            </div>
            {report.staff_reports.map((s) => (
              <div key={s.staff_id} style={styles.tableRow}>
                <span>👤 {s.staff_id}</span>
                <span>{s.task_count}</span>
                <span>{formatDuration(s.avg_duration_seconds)}</span>
              </div>
            ))}
            {report.staff_reports.length === 0 && (
              <p style={{ ...styles.noData, padding: "12px 0" }}>{t(lang, "noHistory")}</p>
            )}
          </div>

          <div style={styles.sectionTitle}>{t(lang, "stationReport")}</div>
          <div style={styles.reportCard}>
            <div style={styles.tableHeader}>
              <span>{t(lang, "stationLabel")}</span>
              <span>{t(lang, "totalTasks")}</span>
              <span>{t(lang, "avgDuration")}</span>
            </div>
            {report.station_reports.map((s) => (
              <div key={s.station} style={styles.tableRow}>
                <span>{s.station}</span>
                <span>{s.task_count}</span>
                <span>{formatDuration(s.avg_duration_seconds)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Monthly Report Tab ────────────────────────────────────
function MonthlyReportTab({ lang }: { lang: Language }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cooking-history/reports/monthly?year=${year}&month=${month}`);
      if (res.ok) setReport(await res.json());
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={styles.datePickerRow}>
        <input
          type="number"
          value={year}
          min={2020}
          max={2099}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ ...styles.input, width: 80 }}
        />
        <input
          type="number"
          value={month}
          min={1}
          max={12}
          onChange={(e) => setMonth(Number(e.target.value))}
          style={{ ...styles.input, width: 60 }}
        />
        <button style={styles.btn} onClick={load}>{t(lang, "submit")}</button>
      </div>
      {loading && <p style={styles.noData}>{t(lang, "loading")}</p>}
      {report && !loading && (
        <>
          <div style={styles.kpiRow}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{t(lang, "totalTasks")}</div>
              <div style={styles.kpiValue}>{report.total_tasks}</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{t(lang, "avgDuration")}</div>
              <div style={styles.kpiValue}>{formatDuration(report.avg_duration_seconds)}</div>
            </div>
          </div>

          {report.daily_summary.length > 0 && (
            <>
              <div style={styles.sectionTitle}>{t(lang, "date")}</div>
              <div style={styles.reportCard}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {report.daily_summary.map((d) => (
                    <div
                      key={d.date}
                      style={{
                        background: "rgba(249,115,22,0.1)",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 12,
                        color: "#3d2010",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{d.date.slice(5)}</div>
                      <div style={{ color: "#ea580c", fontWeight: 800 }}>{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={styles.sectionTitle}>{t(lang, "staffReport")}</div>
          <div style={styles.reportCard}>
            <div style={styles.tableHeader}>
              <span>{t(lang, "staffLabel")}</span>
              <span>{t(lang, "totalTasks")}</span>
              <span>{t(lang, "avgDuration")}</span>
            </div>
            {report.staff_reports.map((s) => (
              <div key={s.staff_id} style={styles.tableRow}>
                <span>👤 {s.staff_id}</span>
                <span>{s.task_count}</span>
                <span>{formatDuration(s.avg_duration_seconds)}</span>
              </div>
            ))}
            {report.staff_reports.length === 0 && (
              <p style={{ ...styles.noData, padding: "12px 0" }}>{t(lang, "noHistory")}</p>
            )}
          </div>

          <div style={styles.sectionTitle}>{t(lang, "stationReport")}</div>
          <div style={styles.reportCard}>
            <div style={styles.tableHeader}>
              <span>{t(lang, "stationLabel")}</span>
              <span>{t(lang, "totalTasks")}</span>
              <span>{t(lang, "avgDuration")}</span>
            </div>
            {report.station_reports.map((s) => (
              <div key={s.station} style={styles.tableRow}>
                <span>{s.station}</span>
                <span>{s.task_count}</span>
                <span>{formatDuration(s.avg_duration_seconds)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function CookingHistoryView({ lang, orderId, staffId }: Props) {
  const [tab, setTab] = useState<TabType>("history");

  const showReports = !orderId && !staffId;

  return (
    <div style={styles.root}>
      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, ...(tab === "history" ? styles.tabActive : {}) }}
          onClick={() => setTab("history")}
        >
          {t(lang, "cookingHistoryTab")}
        </button>
        {showReports && (
          <>
            <button
              style={{ ...styles.tab, ...(tab === "daily" ? styles.tabActive : {}) }}
              onClick={() => setTab("daily")}
            >
              {t(lang, "dailyReport")}
            </button>
            <button
              style={{ ...styles.tab, ...(tab === "monthly" ? styles.tabActive : {}) }}
              onClick={() => setTab("monthly")}
            >
              {t(lang, "monthlyReport")}
            </button>
          </>
        )}
      </div>

      {tab === "history" && <HistoryList lang={lang} orderId={orderId} staffId={staffId} />}
      {tab === "daily" && showReports && <DailyReportTab lang={lang} />}
      {tab === "monthly" && showReports && <MonthlyReportTab lang={lang} />}
    </div>
  );
}
