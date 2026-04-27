import { useState, useEffect } from "react";
import type { CompletionLog, Language } from "../types";

interface Props {
  language: Language;
}

export default function PhotoGallery({ language }: Props) {
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompletionLog | null>(null);

  useEffect(() => {
    fetch("/api/orders/logs/?limit=200")
      .then((r) => r.json())
      .then((data: CompletionLog[]) => {
        setLogs(data.filter((l) => l.photo_url));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div style={styles.center}>読み込み中...</div>;

  if (logs.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>📸</div>
        <div>まだ写真がありません</div>
        <div style={{ fontSize: "0.85rem", color: "#555570", marginTop: 8 }}>
          盛付完了時に写真を撮ると、ここに表示されます
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>📸 盛付フォト</h2>
        <span style={styles.count}>{logs.length} 枚</span>
      </div>

      {/* グリッド */}
      <div style={styles.grid}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={styles.card}
            onClick={() => setSelected(log)}
          >
            <div style={styles.imgWrap}>
              <img
                src={log.photo_url!}
                alt={log.description}
                style={styles.img}
              />
            </div>
            <div style={styles.cardBody}>
              <div style={styles.cardMenu}>{log.description.split(" - ")[0]}</div>
              <div style={styles.cardMeta}>
                <span>👤 {log.staff_name}</span>
                <span>{formatTime(log.end_time)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 拡大モーダル */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <img
              src={selected.photo_url!}
              alt={selected.description}
              style={styles.modalImg}
            />
            <div style={styles.modalInfo}>
              <div style={styles.modalMenu}>{selected.description.split(" - ")[0]}</div>
              <div style={styles.modalMeta}>
                <span>👤 {selected.staff_name}</span>
                <span>🕐 {formatTime(selected.end_time)}</span>
                {selected.duration_seconds != null && (
                  <span>⏱ {Math.floor(selected.duration_seconds / 60)}分{selected.duration_seconds % 60}秒</span>
                )}
              </div>
              {selected.note && (
                <div style={styles.modalNote}>📝 {selected.note}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { paddingBottom: 32 },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea" },
  count: {
    background: "#16213e",
    color: "#9b59b6",
    padding: "4px 14px",
    borderRadius: 8,
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  center: { textAlign: "center", padding: 40, color: "#a0a0b0" },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#a0a0b0",
    fontSize: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  card: {
    background: "#16213e",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid #0f3460",
    transition: "transform 0.15s, border-color 0.15s",
  },
  imgWrap: {
    width: "100%",
    aspectRatio: "4/3",
    overflow: "hidden",
    background: "#0f0f1a",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  cardBody: { padding: "10px 12px" },
  cardMenu: {
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#eaeaea",
    marginBottom: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  cardMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#a0a0b0",
  },
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#1a1a2e",
    borderRadius: 16,
    overflow: "hidden",
    maxWidth: 480,
    width: "100%",
    position: "relative" as const,
    boxShadow: "0 8px 48px rgba(0,0,0,0.8)",
  },
  closeBtn: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    background: "#0008",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    cursor: "pointer",
    fontSize: "1rem",
    zIndex: 1,
  },
  modalImg: {
    width: "100%",
    maxHeight: 340,
    objectFit: "cover" as const,
    display: "block",
  },
  modalInfo: { padding: "14px 16px" },
  modalMenu: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#eaeaea",
    marginBottom: 8,
  },
  modalMeta: {
    display: "flex",
    gap: 14,
    fontSize: "0.85rem",
    color: "#a0a0b0",
    flexWrap: "wrap" as const,
  },
  modalNote: {
    marginTop: 8,
    fontSize: "0.85rem",
    color: "#f39c12",
  },
};
