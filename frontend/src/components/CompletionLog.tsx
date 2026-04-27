import { useState, useEffect } from "react";
import type { CompletionLog, Language } from "../types";
import { t } from "../i18n/translations";

interface Props {
  language: Language;
}

const TYPE_COLOR: Record<string, string> = {
  調理: "#f39c12",
  盛付: "#9b59b6",
  仕込み: "#27ae60",
};

export default function CompletionLogView({ language }: Props) {
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/orders/logs/?limit=100")
      .then((r) => r.json())
      .then((data) => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDuration = (sec: number | null): string => {
    if (!sec) return "-";
    if (sec < 60) return `${sec}${t(language, "sec")}`;
    return `${Math.floor(sec / 60)}${t(language, "min")}${sec % 60}${t(language, "sec")}`;
  };

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const filtered = filter === "all" ? logs : logs.filter((l) => l.task_type === filter);

  if (loading) return <div style={styles.center}>読み込み中...</div>;

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>{t(language, "log")}</h2>
        <span style={styles.count}>{filtered.length} 件</span>
      </div>

      {/* フィルター */}
      <div style={styles.filters}>
        {["all", "調理", "盛付", "仕込み"].map((f) => (
          <button
            key={f}
            style={{
              ...styles.filterBtn,
              ...(filter === f
                ? {
                    background: f === "all" ? "#e94560" : TYPE_COLOR[f] ?? "#e94560",
                    color: "#fff",
                  }
                : {}),
            }}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "すべて" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>{t(language, "noLogs")}</div>
      ) : (
        <div style={styles.list}>
          {filtered.map((log) => (
            <div key={log.id} style={styles.logRow}>
              <div
                style={{
                  ...styles.typeDot,
                  background: TYPE_COLOR[log.task_type] ?? "#555",
                }}
              />
              <div style={styles.content}>
                <div style={styles.desc}>{log.description}</div>
                <div style={styles.meta}>
                  <span style={styles.staff}>👤 {log.staff_name}</span>
                  <span style={styles.time}>
                    {t(language, "endTime")}: {formatTime(log.end_time)}
                  </span>
                  {log.start_time && (
                    <span style={styles.time}>
                      {t(language, "startTime")}: {formatTime(log.start_time)}
                    </span>
                  )}
                  {log.duration_seconds != null && (
                    <span style={styles.duration}>
                      ⏱ {formatDuration(log.duration_seconds)}
                    </span>
                  )}
                </div>
                {log.note && <div style={styles.note}>📝 {log.note}</div>}
                {log.photo_url && (
                  <div style={styles.photoWrap}>
                    <img
                      src={log.photo_url}
                      alt="盛付写真"
                      style={styles.photo}
                      onClick={() => window.open(log.photo_url!, "_blank")}
                    />
                    <span style={styles.photoLabel}>📸 盛付写真</span>
                  </div>
                )}
              </div>
              <span
                style={{
                  ...styles.typeTag,
                  background: (TYPE_COLOR[log.task_type] ?? "#555") + "33",
                  color: TYPE_COLOR[log.task_type] ?? "#555",
                }}
              >
                {log.task_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 24px" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea" },
  count: {
    background: "#16213e",
    color: "#7fb3ff",
    padding: "4px 14px",
    borderRadius: 8,
    fontSize: "0.9rem",
  },
  filters: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const },
  filterBtn: {
    background: "#16213e",
    color: "#a0a0b0",
    border: "1px solid #0f3460",
    borderRadius: 8,
    padding: "6px 16px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  center: { textAlign: "center", padding: 40, color: "#a0a0b0" },
  empty: { textAlign: "center", padding: 60, color: "#555570", fontSize: "1.1rem" },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  logRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    background: "#1a1a2e",
    borderRadius: 10,
    padding: "12px 16px",
  },
  typeDot: { width: 10, height: 10, borderRadius: "50%", marginTop: 6, flexShrink: 0 },
  content: { flex: 1 },
  desc: { fontWeight: 600, fontSize: "0.95rem", color: "#eaeaea", marginBottom: 4 },
  meta: { display: "flex", gap: 12, flexWrap: "wrap" as const },
  staff: { fontSize: "0.85rem", color: "#7fb3ff" },
  time: { fontSize: "0.85rem", color: "#a0a0b0" },
  duration: { fontSize: "0.85rem", color: "#f39c12" },
  photoTag: { fontSize: "0.85rem", color: "#9b59b6" },
  note: { fontSize: "0.8rem", color: "#a0a0b0", marginTop: 4 },
  photoWrap: {
    marginTop: 10,
    position: "relative" as const,
    display: "inline-block",
    borderRadius: 10,
    overflow: "hidden",
    border: "2px solid #9b59b6",
    cursor: "pointer",
  },
  photo: {
    display: "block",
    maxWidth: 260,
    maxHeight: 180,
    objectFit: "cover" as const,
    borderRadius: 8,
  },
  photoLabel: {
    position: "absolute" as const,
    bottom: 6,
    left: 6,
    background: "#9b59b6cc",
    color: "#fff",
    fontSize: "0.75rem",
    padding: "3px 8px",
    borderRadius: 6,
    fontWeight: 600,
  },
  typeTag: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontWeight: 700,
    flexShrink: 0,
  },
};
