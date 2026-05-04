import { useState, useCallback, useEffect } from "react";
import type { Language, StationType, WSMessage, OrderReadyData } from "../types";
import { t } from "../i18n/translations";
import LanguageSelector from "./LanguageSelector";
import OrderBoard from "./OrderBoard";
import PrepBoard from "./PrepBoard";
import CompletionLogView from "./CompletionLog";
import NewOrderForm from "./NewOrderForm";
import MenuManager from "./MenuManager";
import OrderReadyToast from "./OrderReadyToast";
import WorkGuide from "./WorkGuide";
import PhotoGallery from "./PhotoGallery";
import Dashboard from "./Dashboard";
import SetupWizard from "./SetupWizard";
import InventoryManager from "./InventoryManager";
import CookingHistoryView from "./CookingHistoryView";
import NowDashboard from "./NowDashboard";
import { useWebSocket } from "../hooks/useWebSocket";
import { useVoice } from "../hooks/useVoice";

interface Props {
  station: StationType;
  language: Language;
  staffName: string;
  onChangeLanguage: (lang: Language) => void;
  onReset: () => void;
}

type Tab = "orders" | "prep" | "log" | "new_order" | "menus" | "guide" | "photo" | "dashboard" | "setup" | "inventory" | "history" | "now" | "qr";

const STATION_COLOR: Record<StationType, string> = {
  cooking: "#f39c12",
  plating: "#9b59b6",
  prep: "#27ae60",
  admin: "#e94560",
  table: "#7fb3ff",
};

const STATION_EMOJI: Record<StationType, string> = {
  cooking: "🍳",
  plating: "🍽️",
  prep: "🥬",
  admin: "📊",
  table: "🪑",
};

export default function StationView({
  station,
  language,
  staffName,
  onChangeLanguage,
  onReset,
}: Props) {
  const [tab, setTab] = useState<Tab>(station === "prep" ? "prep" : "orders");
  const [orderReadyNotif, setOrderReadyNotif] = useState<OrderReadyData | null>(null);
  const [mainCompletedMsg, setMainCompletedMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { notifyNewOrder } = useVoice(language);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // WebSocket: order_ready / main_completed / station_alert / tasks_now_updated を処理
  const handleWSMessage = useCallback(
    (msg: WSMessage) => {
      if (msg.type === "order_ready") {
        setOrderReadyNotif(msg.data);
      } else if (msg.type === "order_created" && (station === "cooking" || station === "admin")) {
        notifyNewOrder();
      } else if (msg.type === "main_completed" && (station === "plating" || station === "admin")) {
        const label = `🍳 ${msg.data.menu_name ?? ""} → ${t(language, "plating")} (${msg.data.table_number ?? ""})`;
        setMainCompletedMsg(label);
        setTimeout(() => setMainCompletedMsg(null), 6000);
      } else if (msg.type === "station_alert" || msg.type === "tasks_now_updated" || msg.type === "timing_updated") {
        // NowDashboard がウィンドウイベントをリッスンしているので転送
        window.dispatchEvent(new CustomEvent("ws_message", { detail: msg }));
      }
    },
    [station, language, notifyNewOrder]
  );

  // 管理・調理・盛付ステーションはadmin WSで全通知を受け取る
  const wsStation = station === "admin" ? "admin" : station;
  useWebSocket(wsStation, handleWSMessage);

  const color = STATION_COLOR[station];
  const emoji = STATION_EMOJI[station];

  const ALL_TABS: { key: Tab; label: string; show: boolean }[] = [
    { key: "orders",    label: t(language, "orders"),              show: station !== "prep" },
    { key: "prep",      label: t(language, "prepWork"),            show: station === "prep" || station === "admin" },
    { key: "log",       label: t(language, "log"),                 show: station === "admin" },
    { key: "menus",     label: t(language, "menus"),               show: station === "admin" },
    { key: "new_order", label: `+ ${t(language, "newOrder")}`,    show: station === "admin" },
    { key: "photo",     label: "📸 フォト",                        show: station === "admin" || station === "plating" },
    { key: "dashboard", label: `📊 ${t(language, "dashboard")}`,  show: station === "admin" },
    { key: "inventory", label: `📦 ${t(language, "inventory")}`,  show: station === "admin" },
    { key: "setup",     label: `⚙ ${t(language, "setup")}`,      show: station === "admin" },
    { key: "now",       label: t(language, "nowDashboardTab"),     show: true },
    { key: "history",   label: t(language, "cookingHistoryTab"),   show: station === "admin" },
    { key: "qr",        label: "🔗 QR生成",                        show: station === "admin" },
    { key: "guide",     label: "📋 作業手順",                      show: true },
  ];
  const TABS = ALL_TABS.filter((tb) => tb.show);

  return (
    <div style={styles.root}>
      {/* 🔔 全品完成通知トースト */}
      <OrderReadyToast
        notification={orderReadyNotif}
        language={language}
        onDismiss={() => setOrderReadyNotif(null)}
      />

      {/* 🍳 調理完了 → 盛付アラート */}
      {mainCompletedMsg && (
        <div style={styles.mainCompletedBanner}>
          {mainCompletedMsg}
        </div>
      )}

      {/* 📡 オフラインバナー */}
      {isOffline && (
        <div style={styles.offlineBanner}>
          📡 {t(language, "offlineMode")} — {t(language, "syncPending")}
        </div>
      )}

      {/* ヘッダー */}
      <header
        style={{
          ...styles.header,
          background: color + "22",
          borderBottom: `2px solid ${color}`,
        }}
      >
        <div style={styles.headerLeft}>
          <span style={styles.stationEmoji}>{emoji}</span>
          <div>
            <div style={{ ...styles.stationName, color }}>
              {t(language, station)}
            </div>
            <div style={styles.staffInfo}>👤 {staffName}</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <LanguageSelector current={language} onChange={onChangeLanguage} />
          <button onClick={onReset} style={styles.resetBtn} title="ステーション変更">
            ⚙
          </button>
        </div>
      </header>

      {/* タブナビゲーション */}
      {TABS.length > 1 && (
        <nav style={styles.nav}>
          {TABS.map((tb) => (
            <button
              key={tb.key}
              style={{
                ...styles.tabBtn,
                ...(tab === tb.key
                  ? { ...styles.tabBtnActive, borderColor: color, color }
                  : {}),
              }}
              onClick={() => setTab(tb.key)}
            >
              {tb.label}
            </button>
          ))}
        </nav>
      )}

      {/* コンテンツ */}
      <main style={styles.main} className="scroll-y">
        {tab === "orders" && (
          <OrderBoard
            station={station}
            language={language}
            staffName={staffName}
            onOrderReady={(data) => setOrderReadyNotif(data)}
          />
        )}
        {tab === "prep" && (
          <PrepBoard language={language} staffName={staffName} />
        )}
        {tab === "log" && <CompletionLogView language={language} />}
        {tab === "menus" && <MenuManager language={language} />}
        {tab === "new_order" && (
          <NewOrderForm language={language} onSuccess={() => setTab("orders")} />
        )}
        {tab === "photo" && (
          <PhotoGallery language={language} />
        )}
        {tab === "dashboard" && (
          <Dashboard language={language} />
        )}
        {tab === "inventory" && (
          <InventoryManager language={language} />
        )}
        {tab === "setup" && (
          <SetupWizard language={language} />
        )}
        {tab === "now" && (
          <NowDashboard lang={language} station={station} />
        )}
        {tab === "history" && (
          <CookingHistoryView lang={language} />
        )}
        {tab === "qr" && <QRGenerator />}
        {tab === "guide" && (
          <WorkGuide station={station} language={language} />
        )}
      </main>
    </div>
  );
}

// ── QRコード生成（管理者専用）────────────────────────────
function QRGenerator() {
  const [tables, setTables] = useState<string[]>(["A1", "A2", "A3", "カウンター1", "カウンター2"]);
  const [input, setInput] = useState("");
  const origin = window.location.origin;

  const add = () => {
    const v = input.trim();
    if (v && !tables.includes(v)) setTables((p) => [...p, v]);
    setInput("");
  };

  const remove = (t: string) => setTables((p) => p.filter((x) => x !== t));

  return (
    <div style={qr.root}>
      <h2 style={qr.title}>🔗 テーブルQRコード生成</h2>
      <p style={qr.desc}>
        各テーブルのQRコードを印刷してテーブルに置いてください。<br />
        お客様がスマホで読み取るとそのテーブルの注文画面が開きます。
      </p>

      {/* テーブル追加 */}
      <div style={qr.addRow}>
        <input
          style={qr.input}
          placeholder="テーブル名を追加（例: B1、テラス1）"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button style={qr.addBtn} onClick={add}>追加</button>
      </div>

      {/* QRカード一覧 */}
      <div style={qr.grid}>
        {tables.map((tbl) => {
          const url = `${origin}/?table=${encodeURIComponent(tbl)}`;
          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
          return (
            <div key={tbl} style={qr.card}>
              <button style={qr.del} onClick={() => remove(tbl)} title="削除">✕</button>
              <div style={qr.tblName}>{tbl}</div>
              <img src={qrSrc} alt={`QR ${tbl}`} style={qr.qrImg} />
              <div style={qr.urlText}>{url}</div>
              <button style={qr.printBtn} onClick={() => window.open(qrSrc, "_blank")}>
                🖨️ 印刷用を開く
              </button>
            </div>
          );
        })}
      </div>

      <p style={qr.hint}>
        ※ QRコードはネット接続時のみ表示されます（api.qrserver.com — 無料）。<br />
        「印刷用を開く」→ブラウザの印刷機能でPDF保存・印刷できます。
      </p>
    </div>
  );
}

const qr: Record<string, React.CSSProperties> = {
  root: { padding: "4px 0 40px" },
  title: { fontSize: "1.3rem", fontWeight: 800, color: "#2d2013", marginBottom: 8 },
  desc: { fontSize: "0.9rem", color: "#8c6f5a", lineHeight: 1.7, marginBottom: 20 },
  addRow: { display: "flex", gap: 10, marginBottom: 24 },
  input: {
    flex: 1,
    border: "1.5px solid rgba(200,140,100,0.3)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.95rem",
    background: "rgba(255,255,255,0.8)",
    color: "#2d2013",
    outline: "none",
  },
  addBtn: {
    background: "linear-gradient(135deg,#ff8c42,#ff6b6b)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 22px",
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid rgba(255,180,120,0.3)",
    borderRadius: 16,
    padding: "16px 14px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    position: "relative",
    boxShadow: "0 4px 16px rgba(200,100,60,0.08)",
  },
  del: {
    position: "absolute",
    top: 8,
    right: 10,
    background: "transparent",
    border: "none",
    color: "#c09080",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  tblName: { fontWeight: 900, fontSize: "1.15rem", color: "#2d2013" },
  qrImg: { width: 160, height: 160, borderRadius: 8, border: "1px solid rgba(200,140,100,0.2)" },
  urlText: {
    fontSize: "0.7rem",
    color: "#b09880",
    wordBreak: "break-all",
    textAlign: "center",
    lineHeight: 1.4,
  },
  printBtn: {
    background: "rgba(255,240,220,0.9)",
    border: "1px solid rgba(255,160,80,0.3)",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#c85a00",
    cursor: "pointer",
    width: "100%",
  },
  hint: {
    marginTop: 24,
    fontSize: "0.78rem",
    color: "#b09880",
    lineHeight: 1.7,
    borderTop: "1px solid rgba(200,140,100,0.15)",
    paddingTop: 16,
  },
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "transparent",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    flexShrink: 0,
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(200,140,100,0.2)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  stationEmoji: { fontSize: "1.8rem" },
  stationName: { fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" },
  staffInfo: { fontSize: "0.8rem", color: "#7070a0", marginTop: 2 },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  resetBtn: {
    background: "rgba(255,255,255,0.06)",
    color: "#8080a0",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  nav: {
    display: "flex",
    gap: 0,
    background: "rgba(255,255,255,0.7)",
    borderBottom: "2px solid rgba(200,140,100,0.15)",
    flexShrink: 0,
    overflowX: "auto" as const,
  },
  tabBtn: {
    background: "transparent",
    color: "#c0a080",
    border: "none",
    borderBottom: "3px solid transparent",
    borderRadius: 0,
    padding: "13px 18px",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    letterSpacing: "0.01em",
    transition: "color 0.15s",
  },
  tabBtnActive: {
    color: "#3d2010",
    borderBottom: "3px solid",
    background: "rgba(255,120,80,0.06)",
  },
  main: {
    flex: 1,
    padding: "20px",
    overflowY: "auto" as const,
  },
  tabBtnActive2: {
    color: "#fff",
    borderBottom: "2px solid",
  },
  offlineBanner: {
    background: "#e94560",
    color: "#fff",
    textAlign: "center" as const,
    padding: "8px 16px",
    fontSize: "0.85rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  mainCompletedBanner: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    textAlign: "center" as const,
    padding: "10px 16px",
    fontSize: "0.9rem",
    fontWeight: 700,
    flexShrink: 0,
    animation: "fadeInDown 0.3s ease",
  },
};
