import { useState } from "react";
import type { Language, StationType } from "../types";
import { LANGUAGE_NAMES, t } from "../i18n/translations";
import { ChefIcon, TableIcon, CookingIcon, PlatingIcon, PrepIcon, AdminIcon } from "./StationIcons";

interface Props {
  onStart: (station: StationType, language: Language, staffName: string, tableNum?: string) => void;
}

const KITCHEN_STATIONS: { value: StationType; icon: React.ReactNode; label: string; color: string; glow: string }[] = [
  { value: "cooking", icon: <CookingIcon size={52} />, label: "調理",   color: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
  { value: "plating", icon: <PlatingIcon size={52} />, label: "盛付",   color: "#a855f7", glow: "rgba(168,85,247,0.35)" },
  { value: "prep",    icon: <PrepIcon    size={52} />, label: "仕込み", color: "#10b981", glow: "rgba(16,185,129,0.35)" },
  { value: "admin",   icon: <AdminIcon   size={52} />, label: "管理",   color: "#e94560", glow: "rgba(233,69,96,0.35)"  },
];

const LANGS: Language[] = ["ja", "zh", "th", "en", "vi", "ne", "id", "my"];

export default function SetupScreen({ onStart }: Props) {
  const [mode, setMode] = useState<"kitchen" | "table" | null>(null);
  const [station, setStation] = useState<StationType | null>(null);
  const [language, setLanguage] = useState<Language>("ja");
  const [staffName, setStaffName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  const canStartKitchen = station && staffName.trim().length > 0;
  const canStartTable   = tableNumber.trim().length > 0;

  /* ── モード未選択：ホーム画面 ── */
  if (!mode) {
    return (
      <div style={s.root}>
        <div style={s.home} className="fade-up">
          {/* ロゴ */}
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>🍳</div>
            <h1 style={s.appName}>ハピハピ<span style={s.appNameAccent}>キッチン</span></h1>
            <p style={s.tagline}>みんなの厨房を、もっと楽しく。</p>
          </div>

          {/* モード選択 */}
          <div style={s.modeGrid}>
            <button style={s.modeCard} onClick={() => setMode("kitchen")}>
              <div style={{ ...s.modeIconBg, background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.25)" }}>
                <ChefIcon size={56} />
              </div>
              <div style={s.modeName}>厨房スタッフ</div>
              <div style={s.modeSub}>調理 · 盛付 · 仕込み · 管理</div>
              <div style={s.modeArrow}>→</div>
            </button>

            <button style={s.modeCard} onClick={() => setMode("table")}>
              <div style={{ ...s.modeIconBg, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <TableIcon size={56} />
              </div>
              <div style={s.modeName}>テーブル端末</div>
              <div style={s.modeSub}>お客様向け注文状況</div>
              <div style={s.modeArrow}>→</div>
            </button>
          </div>

          {/* ステータスチップ */}
          <div style={s.statusRow}>
            <span style={s.statusChip}>🟢 システム稼働中</span>
            <span style={s.statusChip}>🔒 ローカル専用</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── テーブル設定 ── */
  if (mode === "table") {
    return (
      <div style={s.root}>
        <div style={s.card} className="fade-up">
          <button style={s.backBtn} onClick={() => setMode(null)}>← 戻る</button>
          <div style={s.cardIcon}><TableIcon size={52} /></div>
          <h2 style={s.cardTitle}>テーブル設定</h2>

          <LangSelector language={language} onChange={setLanguage} />

          <div style={s.field}>
            <label style={s.label}>{t(language, "tableNumber")}</label>
            <input
              type="text"
              placeholder="例: A1, 3, カウンター1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={!canStartTable}
            onClick={() => canStartTable && onStart("table", language, "", tableNumber.trim())}
          >
            表示開始
          </button>
        </div>
      </div>
    );
  }

  /* ── 厨房スタッフ設定 ── */
  return (
    <div style={s.root}>
      <div style={s.card} className="fade-up">
        <button style={s.backBtn} onClick={() => setMode(null)}>← 戻る</button>
        <div style={s.cardIcon}><ChefIcon size={52} /></div>
        <h2 style={s.cardTitle}>ステーション設定</h2>

        <LangSelector language={language} onChange={setLanguage} />

        <div style={s.field}>
          <label style={s.label}>{t(language, "staffName")}</label>
          <input
            type="text"
            placeholder="名前を入力..."
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>{t(language, "selectStation")}</label>
          <div style={s.stationGrid}>
            {KITCHEN_STATIONS.map((st) => {
              const active = station === st.value;
              return (
                <button
                  key={st.value}
                  style={{
                    ...s.stationBtn,
                    borderColor: active ? st.color : "rgba(200,140,100,0.2)",
                    background: active ? st.color + "1a" : "rgba(255,255,255,0.5)",
                    boxShadow: active ? `0 0 20px ${st.glow}` : "none",
                  }}
                  onClick={() => setStation(st.value)}
                >
                  <div style={{ opacity: active ? 1 : 0.7, transition: "opacity 0.2s" }}>
                    {st.icon}
                  </div>
                  <span style={{ ...s.stationLabel, color: active ? st.color : "#a09080" }}>
                    {t(language, st.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 4 }}
          disabled={!canStartKitchen}
          onClick={() => canStartKitchen && onStart(station!, language, staffName.trim())}
        >
          {t(language, "beginWork")}
        </button>
      </div>
    </div>
  );
}

function LangSelector({ language, onChange }: { language: Language; onChange: (l: Language) => void }) {
  return (
    <div style={s.field}>
      <label style={s.label}>言語 / Language</label>
      <div style={s.langRow}>
        {LANGS.map((l) => (
          <button
            key={l}
            style={{
              ...s.langBtn,
              ...(language === l
                ? { background: "rgba(233,69,96,0.2)", borderColor: "#e94560", color: "#fff" }
                : {}),
            }}
            onClick={() => onChange(l)}
          >
            {LANGUAGE_NAMES[l]}
          </button>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  /* ホーム */
  home: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  logoWrap: {
    textAlign: "center" as const,
  },
  logoIcon: {
    fontSize: "5rem",
    lineHeight: 1,
    marginBottom: 12,
    filter: "drop-shadow(0 4px 16px rgba(255,120,80,0.35))",
    animation: "logoBounce 2.4s ease-in-out infinite",
  },
  appName: {
    fontSize: "2.6rem",
    fontWeight: 900,
    letterSpacing: "0.01em",
    color: "#3d2010",
    marginBottom: 8,
  },
  appNameAccent: {
    color: "#ff6b6b",
    marginLeft: 4,
  },
  tagline: {
    fontSize: "0.88rem",
    color: "#c09070",
    letterSpacing: "0.06em",
  },

  modeGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  modeCard: {
    background: "rgba(255,255,255,0.75)",
    border: "1.5px solid rgba(255,180,120,0.35)",
    borderRadius: 18,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "all 0.2s",
    backdropFilter: "blur(12px)",
    boxShadow: "0 4px 24px rgba(200,100,60,0.1)",
  },
  modeIconBg: {
    width: 72,
    height: 72,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  modeName: {
    flex: 1,
    fontWeight: 700,
    fontSize: "1.05rem",
    color: "#2d2013",
  },
  modeSub: {
    display: "none",
  },
  modeArrow: {
    color: "#505070",
    fontSize: "1.2rem",
    fontWeight: 700,
  },

  statusRow: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },
  statusChip: {
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(200,140,100,0.25)",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: "0.78rem",
    color: "#a08060",
  },

  /* 設定カード */
  card: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1.5px solid rgba(255,180,120,0.3)",
    borderRadius: 24,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 12px 48px rgba(200,100,60,0.15)",
    position: "relative" as const,
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#c09070",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: "0 0 20px 0",
    display: "block",
    fontWeight: 500,
  },
  cardIcon: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: 800,
    textAlign: "center" as const,
    marginBottom: 28,
    color: "#2d2013",
    letterSpacing: "-0.02em",
  },

  field: { marginBottom: 22 },
  label: {
    display: "block",
    fontSize: "0.82rem",
    color: "#a08060",
    marginBottom: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },

  langRow: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
  langBtn: {
    background: "rgba(255,255,255,0.7)",
    color: "#a08060",
    border: "1.5px solid rgba(200,140,100,0.25)",
    padding: "7px 14px",
    borderRadius: 10,
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },

  stationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  stationBtn: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "18px 12px",
    borderRadius: 14,
    border: "1.5px solid rgba(200,140,100,0.2)",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(255,255,255,0.5)",
  },
  stationLabel: {
    fontSize: "0.95rem",
    fontWeight: 700,
  },
};
