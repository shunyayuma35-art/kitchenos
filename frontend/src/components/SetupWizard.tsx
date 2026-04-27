import { useState, useEffect } from "react";
import type { Language } from "../types";
import { t } from "../i18n/translations";

interface Props {
  language: Language;
}

interface Template {
  key: string;
  label: string;
  emoji: string;
  menu_count: number;
}

export default function SetupWizard({ language }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; menus_created: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/setup/templates")
      .then((r) => r.json())
      .then((data) => { setTemplates(data.templates ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/setup/template/${selected}?clear_existing=${clearExisting}`,
        { method: "POST" }
      );
      if (res.ok) {
        setResult(await res.json());
      } else {
        const data = await res.json();
        setError(data.detail ?? "エラーが発生しました");
      }
    } catch {
      setError("通信エラー");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div style={s.center}>{t(language, "loading")}</div>;
  }

  if (result) {
    return (
      <div style={s.root}>
        <div style={s.successBox}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#27ae60", marginBottom: 8 }}>
            {t(language, "templateApplied")}
          </div>
          <div style={{ color: "#a0a0b0" }}>
            {result.menus_created} メニューを登録しました
          </div>
          <button
            style={s.resetBtn}
            onClick={() => { setResult(null); setSelected(null); }}
          >
            {t(language, "back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <h2 style={s.title}>⚙ {t(language, "setupWizard")}</h2>
      <p style={s.desc}>{t(language, "selectTemplate")}</p>

      <div style={s.templateGrid}>
        {templates.map((tmpl) => (
          <button
            key={tmpl.key}
            style={{
              ...s.templateCard,
              ...(selected === tmpl.key ? s.templateCardSelected : {}),
            }}
            onClick={() => setSelected(tmpl.key)}
          >
            <div style={{ fontSize: "2.5rem" }}>{tmpl.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#eaeaea", marginTop: 8 }}>
              {tmpl.label}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#a0a0b0", marginTop: 4 }}>
              {tmpl.menu_count} メニュー
            </div>
            {selected === tmpl.key && (
              <div style={s.selectedMark}>✓</div>
            )}
          </button>
        ))}
      </div>

      {/* オプション: 既存データ削除 */}
      <label style={s.checkRow}>
        <input
          type="checkbox"
          checked={clearExisting}
          onChange={(e) => setClearExisting(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer" }}
        />
        <span style={{ color: "#e94560", fontSize: "0.9rem" }}>
          既存のメニューをすべて削除してから登録
        </span>
      </label>

      {error && <div style={s.errorBox}>{error}</div>}

      <button
        className="btn-primary"
        style={{ width: "100%", marginTop: 16, opacity: selected ? 1 : 0.4 }}
        disabled={!selected || applying}
        onClick={handleApply}
      >
        {applying ? "登録中..." : `${t(language, "applyTemplate")} →`}
      </button>

      {/* 外部API情報 */}
      <section style={s.apiSection}>
        <h3 style={s.apiTitle}>🔗 外部注文システム連携 API</h3>
        <p style={s.apiDesc}>
          外部POSやデリバリーアプリから注文を受け付けるAPIです。
        </p>
        <div style={s.codeBlock}>
          <div style={s.codeLine}>POST /api/external/orders</div>
          <div style={s.codeLine}>Header: X-Api-Key: kitchen-external-2024</div>
          <div style={{ ...s.codeLine, color: "#a0a0b0", marginTop: 8 }}>{"{"}</div>
          <div style={{ ...s.codeLine, paddingLeft: 16, color: "#a0a0b0" }}>
            "table_number": "5",
          </div>
          <div style={{ ...s.codeLine, paddingLeft: 16, color: "#a0a0b0" }}>
            "source": "uber_eats",
          </div>
          <div style={{ ...s.codeLine, paddingLeft: 16, color: "#a0a0b0" }}>
            "items": [{"{"}"menu_name": "醤油ラーメン", "quantity": 2{"}"}]
          </div>
          <div style={{ ...s.codeLine, color: "#a0a0b0" }}>{"}"}</div>
        </div>
      </section>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 32px", maxWidth: 700 },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea", marginBottom: 8 },
  desc: { color: "#a0a0b0", marginBottom: 20 },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 12, marginBottom: 20,
  },
  templateCard: {
    background: "#16213e", border: "2px solid #0f3460",
    borderRadius: 14, padding: "20px 12px",
    cursor: "pointer", position: "relative" as const,
    display: "flex", flexDirection: "column", alignItems: "center",
    transition: "border-color 0.15s, background 0.15s",
  },
  templateCardSelected: {
    borderColor: "#7fb3ff", background: "#7fb3ff11",
  },
  selectedMark: {
    position: "absolute" as const, top: 8, right: 8,
    background: "#7fb3ff", color: "#fff",
    borderRadius: "50%", width: 22, height: 22,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.8rem", fontWeight: 800,
  },
  checkRow: {
    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    marginBottom: 12,
  },
  errorBox: {
    background: "#e9456033", color: "#e94560",
    borderRadius: 8, padding: "10px 14px", fontSize: "0.9rem",
    marginBottom: 8,
  },
  successBox: {
    background: "#16213e", borderRadius: 16, padding: "40px 24px",
    textAlign: "center" as const, border: "2px solid #27ae6044",
  },
  resetBtn: {
    marginTop: 20, background: "#16213e",
    color: "#7fb3ff", border: "2px solid #0f3460",
    borderRadius: 10, padding: "10px 24px",
    fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
  },
  apiSection: {
    marginTop: 32, background: "#0f0f1a", borderRadius: 14, padding: 20,
    border: "1px solid #1a1a2e",
  },
  apiTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#eaeaea", marginBottom: 8 },
  apiDesc: { color: "#a0a0b0", fontSize: "0.85rem", marginBottom: 12 },
  codeBlock: {
    background: "#050510", borderRadius: 10, padding: "12px 14px",
    fontFamily: "monospace",
  },
  codeLine: { fontSize: "0.82rem", color: "#7fb3ff", lineHeight: 1.8 },
  center: { textAlign: "center", padding: 60, color: "#a0a0b0" },
};
