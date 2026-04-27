import { useState, useCallback, useEffect } from "react";
import type { Language, WSMessage, Order, OrderReadyData } from "../types";
import { t } from "../i18n/translations";
import { useWebSocket } from "../hooks/useWebSocket";
import { useVoice } from "../hooks/useVoice";
import { LANGUAGE_NAMES } from "../i18n/translations";

type TableStatus = "waiting" | "preparing" | "ready";

interface Props {
  tableNumber: string;
  language: Language;
  onReset: () => void;
  onChangeLanguage: (lang: Language) => void;
}

const LANGS: Language[] = ["ja", "zh", "th", "vi", "ne", "id", "my"];

// 浮遊する食べ物デコレーション
const FOOD_DECO = ["🍜", "🍱", "🍣", "🥗", "🍤", "🍛", "🥩", "🍙", "🧆", "🥘"];

export default function TableView({
  tableNumber,
  language,
  onReset,
  onChangeLanguage,
}: Props) {
  const [status, setStatus] = useState<TableStatus>("waiting");
  const [readyData, setReadyData] = useState<OrderReadyData | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { speak } = useVoice(language);

  const handleWSMessage = useCallback(
    (msg: WSMessage) => {
      if (msg.type === "order_created") {
        if (msg.data.table_number === tableNumber) {
          setCurrentOrder(msg.data);
          setStatus("preparing");
        }
      } else if (msg.type === "order_ready") {
        if (msg.data.table_number === tableNumber) {
          setReadyData(msg.data);
          setStatus("ready");
          const messages: Record<Language, string> = {
            ja: `お料理ができました。お待たせしました。`,
            en: `Your food is ready. Thank you for waiting.`,
            vi: `Món ăn của bạn đã sẵn sàng. Cảm ơn đã chờ đợi.`,
            ne: `तपाईंको खाना तयार भयो। पर्खनुभएकोमा धन्यवाद।`,
            id: `Makanan Anda sudah siap. Terima kasih sudah menunggu.`,
            my: `သင့်အစားအသောက်အဆင်သင့်ဖြစ်ပြီ။ ကျေးဇူးတင်ပါသည်။`,
            ur: `آپ کا کھانا تیار ہے۔ انتظار کا شکریہ۔`,
            th: `อาหารของคุณพร้อมแล้ว ขอบคุณที่รอ`,
            zh: `您的菜品已准备好，感谢您的等待。`,
          };
          speak(messages[language]);
        }
      }
    },
    [tableNumber, language, speak]
  );

  const { connected } = useWebSocket("table", handleWSMessage);

  useEffect(() => {
    fetch(`/api/orders/?status=pending`)
      .then((r) => r.json())
      .then((orders: Order[]) => {
        const mine = orders.find((o) => o.table_number === tableNumber);
        if (mine) {
          setCurrentOrder(mine);
          setStatus("preparing");
        }
      })
      .catch(() => {});
  }, [tableNumber]);

  const reset = () => {
    setStatus("waiting");
    setReadyData(null);
    setCurrentOrder(null);
  };

  return (
    <div style={styles.root}>
      {/* アニメーション定義 */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) rotate(0deg); opacity: 0.18; }
          50%  { opacity: 0.28; }
          100% { transform: translateY(-100vh) rotate(20deg); opacity: 0; }
        }
        @keyframes bounceBig {
          0%, 100% { transform: translateY(0) scale(1); }
          40%       { transform: translateY(-18px) scale(1.08); }
          70%       { transform: translateY(-8px) scale(1.03); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1);   opacity: 0.5; }
          50%       { transform: scale(1.4); opacity: 1; }
        }
        @keyframes celebBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
          50%       { transform: translateY(-22px) rotate(5deg) scale(1.12); }
        }
        @keyframes ringPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,107,107,0.45); }
          100% { box-shadow: 0 0 0 28px rgba(255,107,107,0); }
        }
      `}</style>

      {/* 浮遊する食べ物デコ */}
      {FOOD_DECO.map((emoji, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: `${(i * 11 + 4) % 95}%`,
            bottom: "-10%",
            fontSize: `${1.6 + (i % 3) * 0.5}rem`,
            animation: `floatUp ${14 + i * 2.3}s linear ${i * 1.8}s infinite`,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* ヘッダー */}
      <div style={styles.header}>
        <div style={styles.tableLabel}>
          <span style={styles.tableLabelIcon}>🪑</span>
          {t(language, "tableLabel")} {tableNumber}
        </div>
        <div style={styles.headerRight}>
          <div style={styles.langRow}>
            {LANGS.map((l) => (
              <button
                key={l}
                style={{
                  ...styles.langBtn,
                  ...(language === l ? styles.langBtnActive : {}),
                }}
                onClick={() => onChangeLanguage(l)}
              >
                {LANGUAGE_NAMES[l]}
              </button>
            ))}
          </div>
          <span
            style={{
              ...styles.connDot,
              background: connected ? "#22c55e" : "#e94560",
              boxShadow: connected ? "0 0 6px #22c55e" : "0 0 6px #e94560",
            }}
          />
          <button style={styles.resetBtn} onClick={onReset} title="設定">
            ⚙
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={styles.main}>
        {status === "waiting"   && <WaitingScreen language={language} />}
        {status === "preparing" && <PreparingScreen language={language} order={currentOrder} />}
        {status === "ready"     && <ReadyScreen language={language} readyData={readyData} onReset={reset} />}
      </div>
    </div>
  );
}

// ── 待機画面 ──────────────────────────────────────────────
function WaitingScreen({ language }: { language: Language }) {
  return (
    <div style={sc.center}>
      <div style={sc.waitingCard}>
        <div style={{ fontSize: "7rem", animation: "bounceBig 3s ease-in-out infinite", lineHeight: 1 }}>
          🍽️
        </div>
        <div style={sc.waitingTitle}>
          {t(language, "waitingOrder")}
        </div>
        <div style={sc.waitingSub}>
          {language === "zh" ? "请随时点餐 ✨"
            : language === "th" ? "สั่งอาหารได้เลยค่ะ ✨"
            : language === "id" ? "Silakan pesan kapan saja ✨"
            : language === "my" ? "မှာယူရန်ကြိုဆိုပါသည် ✨"
            : "ご注文をお気軽にどうぞ ✨"}
        </div>
        <div style={sc.decoRow}>
          {["🍜","🍣","🥗","🍤","🍛"].map((e, i) => (
            <span key={i} style={{ fontSize: "1.8rem", opacity: 0.75 }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 調理中画面 ────────────────────────────────────────────
function PreparingScreen({ language, order }: { language: Language; order: Order | null }) {
  return (
    <div style={sc.center}>
      <div style={sc.preparingCard}>
        <div style={{ fontSize: "6rem", animation: "bounceBig 1.6s ease-in-out infinite", lineHeight: 1 }}>
          🍳
        </div>
        <div style={sc.preparingTitle}>
          {t(language, "preparingOrder")}
        </div>

        {order && (
          <div style={sc.menuBox}>
            {order.items.map((item) => (
              <div key={item.id} style={sc.menuItem}>
                <span style={sc.menuDot}>🍴</span>
                <span style={sc.menuItemName}>{item.menu_name}</span>
                {item.quantity > 1 && (
                  <span style={sc.qty}>×{item.quantity}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={sc.dotsRow}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 14, height: 14, borderRadius: "50%",
                background: "#ff8c42",
                animation: `pulseDot 1.2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
        <div style={sc.preparingSub}>
          {language === "zh" ? "请稍候…"
            : language === "th" ? "กรุณารอสักครู่…"
            : language === "id" ? "Mohon tunggu sebentar…"
            : language === "my" ? "ခဏစောင့်ပါ…"
            : "しばらくお待ちください…"}
        </div>
      </div>
    </div>
  );
}

// ── 完成画面 ──────────────────────────────────────────────
function ReadyScreen({
  language, readyData, onReset,
}: { language: Language; readyData: OrderReadyData | null; onReset: () => void }) {
  return (
    <div style={{ ...sc.center, gap: 20 }}>
      <div style={sc.readyCard}>
        <div style={{ fontSize: "6rem", animation: "celebBounce 1.8s ease-in-out infinite", lineHeight: 1 }}>
          🎉
        </div>
        <div style={sc.readyTitle}>
          {t(language, "yourDishesReady")}
        </div>
        <div style={sc.readySub}>
          {t(language, "thankYouWaiting")}
        </div>

        {readyData && (
          <div style={sc.readyMenuBox}>
            {readyData.menu_items.map((item, i) => (
              <div key={i} style={sc.readyMenuItem}>
                <span style={sc.checkIcon}>✅</span>
                <span style={sc.readyMenuName}>{item}</span>
              </div>
            ))}
          </div>
        )}

        <button style={sc.okBtn} onClick={onReset}>
          {language === "zh" ? "谢谢您的光临 🙏"
            : language === "th" ? "ขอบคุณมากค่ะ 🙏"
            : language === "id" ? "Terima kasih 🙏"
            : language === "my" ? "ကျေးဇူးတင်ပါသည် 🙏"
            : "ありがとうございました 🙏"}
        </button>
      </div>
    </div>
  );
}

// ── スタイル: 外枠・ヘッダー ──────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: `
      radial-gradient(ellipse 70% 60% at 10% 20%, rgba(255,200,140,0.50) 0%, transparent 55%),
      radial-gradient(ellipse 55% 50% at 90% 10%, rgba(255,160,180,0.38) 0%, transparent 55%),
      radial-gradient(ellipse 65% 55% at 55% 90%, rgba(255,220,120,0.40) 0%, transparent 55%),
      radial-gradient(ellipse 50% 45% at 80% 70%, rgba(200,240,220,0.30) 0%, transparent 55%),
      #fff8f0
    `,
    display: "flex",
    flexDirection: "column",
    position: "relative" as const,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 22px",
    background: "rgba(255,255,255,0.80)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "2px solid rgba(255,140,66,0.20)",
    zIndex: 10,
    flexShrink: 0,
  },
  tableLabel: {
    fontSize: "1.4rem",
    fontWeight: 900,
    color: "#2d2013",
    display: "flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: "-0.01em",
  },
  tableLabelIcon: { fontSize: "1.3rem" },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  langRow: {
    display: "flex",
    gap: 5,
    flexWrap: "wrap" as const,
  },
  langBtn: {
    background: "rgba(255,255,255,0.7)",
    color: "#8c6f5a",
    border: "1px solid rgba(220,190,160,0.35)",
    padding: "5px 11px",
    borderRadius: 8,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  langBtnActive: {
    background: "linear-gradient(135deg, #ff6b6b, #ff8c42)",
    borderColor: "transparent",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(255,107,107,0.35)",
  },
  connDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  resetBtn: {
    background: "rgba(255,255,255,0.7)",
    color: "#8c6f5a",
    border: "1px solid rgba(220,190,160,0.35)",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    padding: 20,
  },
};

// ── スタイル: 各画面 ──────────────────────────────────────
const sc: Record<string, React.CSSProperties> = {
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    maxWidth: 520,
  },

  // ─ 待機 ─
  waitingCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 28,
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    boxShadow: "0 12px 48px rgba(255,120,60,0.15), 0 2px 12px rgba(0,0,0,0.06)",
    border: "2px solid rgba(255,180,120,0.25)",
    width: "100%",
    animation: "popIn 0.5s cubic-bezier(0.4,0,0.2,1) both",
  },
  waitingTitle: {
    fontSize: "2rem",
    fontWeight: 900,
    color: "#2d2013",
    textAlign: "center" as const,
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
  },
  waitingSub: {
    fontSize: "1.05rem",
    color: "#8c6f5a",
    fontWeight: 600,
  },
  decoRow: {
    display: "flex",
    gap: 12,
    marginTop: 4,
  },

  // ─ 調理中 ─
  preparingCard: {
    background: "rgba(255,255,255,0.90)",
    borderRadius: 28,
    padding: "44px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    boxShadow: "0 12px 48px rgba(255,140,60,0.18), 0 2px 12px rgba(0,0,0,0.06)",
    border: "2px solid rgba(255,160,80,0.30)",
    width: "100%",
    animation: "popIn 0.5s cubic-bezier(0.4,0,0.2,1) both",
  },
  preparingTitle: {
    fontSize: "1.9rem",
    fontWeight: 900,
    color: "#c85a00",
    textAlign: "center" as const,
    letterSpacing: "-0.02em",
  },
  preparingSub: {
    fontSize: "0.95rem",
    color: "#8c6f5a",
    fontWeight: 600,
  },
  menuBox: {
    background: "rgba(255,248,235,0.85)",
    borderRadius: 16,
    padding: "14px 22px",
    width: "100%",
    border: "1px solid rgba(255,180,100,0.25)",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid rgba(220,180,140,0.20)",
  },
  menuDot: { fontSize: "1rem" },
  menuItemName: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#2d2013",
    flex: 1,
  },
  qty: {
    background: "rgba(255,140,60,0.12)",
    color: "#c85a00",
    padding: "2px 10px",
    borderRadius: 8,
    fontSize: "0.9rem",
    fontWeight: 800,
  },
  dotsRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 4,
  },

  // ─ 完成 ─
  readyCard: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    boxShadow: "0 12px 48px rgba(34,197,94,0.18), 0 2px 16px rgba(0,0,0,0.06)",
    border: "2px solid rgba(34,197,94,0.30)",
    width: "100%",
    animation: "popIn 0.4s cubic-bezier(0.4,0,0.2,1) both",
  },
  readyTitle: {
    fontSize: "2.2rem",
    fontWeight: 900,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center" as const,
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
  },
  readySub: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#8c6f5a",
    textAlign: "center" as const,
  },
  readyMenuBox: {
    background: "rgba(240,255,245,0.85)",
    borderRadius: 16,
    padding: "14px 22px",
    width: "100%",
    border: "1px solid rgba(34,197,94,0.20)",
  },
  readyMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid rgba(34,197,94,0.12)",
  },
  checkIcon: { fontSize: "1.1rem" },
  readyMenuName: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#166534",
    flex: 1,
  },
  okBtn: {
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "18px 40px",
    fontSize: "1.2rem",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 6px 28px rgba(34,197,94,0.38)",
    marginTop: 8,
    animation: "ringPulse 1.5s ease-out infinite",
    letterSpacing: "0.01em",
  },
};
