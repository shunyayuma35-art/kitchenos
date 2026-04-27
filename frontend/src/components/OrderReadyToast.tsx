import { useEffect, useState } from "react";
import type { Language, OrderReadyData } from "../types";
import { t } from "../i18n/translations";
import { useVoice } from "../hooks/useVoice";

interface Props {
  notification: OrderReadyData | null;
  language: Language;
  onDismiss: () => void;
}

export default function OrderReadyToast({ notification, language, onDismiss }: Props) {
  const [countdown, setCountdown] = useState(30);
  const { speak } = useVoice(language);

  useEffect(() => {
    if (!notification) return;

    // 音声通知
    const messages: Record<Language, string> = {
      ja: `テーブル${notification.table_number}の料理が全品揃いました。提供してください。`,
      en: `Table ${notification.table_number} is ready. Please serve.`,
      vi: `Bàn ${notification.table_number} đã sẵn sàng. Vui lòng phục vụ.`,
      ne: `टेबल ${notification.table_number} को खाना तयार छ। परिवेशन गर्नुहोस्।`,
      id: `Meja ${notification.table_number} sudah siap. Silakan sajikan.`,
      my: `စားပွဲ ${notification.table_number} အဆင်သင့်ဖြစ်ပြီ။ ဆောင်ရွက်ပါ။`,
      ur: `میز ${notification.table_number} تیار ہے۔ پیش کریں۔`,
      th: `โต๊ะ ${notification.table_number} พร้อมเสิร์ฟแล้ว`,
      zh: `${notification.table_number}号桌的菜已全部完成，请上菜。`,
    };
    speak(messages[language]);

    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); onDismiss(); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [notification?.order_id]);

  if (!notification) return null;

  return (
    <div style={styles.overlay} onClick={onDismiss}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* アニメーション文字 */}
        <div style={styles.bell}>🔔</div>

        <div style={styles.readyText}>{t(language, "orderReady")}</div>
        <div style={styles.tableNum}>
          {t(language, "tableLabel")} {notification.table_number}
        </div>

        {/* メニュー一覧 */}
        <div style={styles.menuList}>
          {notification.menu_items.map((item, i) => (
            <div key={i} style={styles.menuItem}>
              ✓ {item}
            </div>
          ))}
        </div>

        <div style={styles.subText}>{t(language, "allDishesReady")}</div>

        <button style={styles.dismissBtn} onClick={onDismiss}>
          {t(language, "dismiss")} ({countdown})
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    animation: "fadeIn 0.2s ease",
  },
  card: {
    background: "#0f3460",
    border: "3px solid #27ae60",
    borderRadius: 20,
    padding: "40px 48px",
    textAlign: "center",
    maxWidth: 420,
    width: "90%",
    boxShadow: "0 0 60px rgba(39,174,96,0.4)",
  },
  bell: {
    fontSize: "4rem",
    marginBottom: 8,
    display: "block",
    animation: "pulse 0.6s ease infinite alternate",
  },
  readyText: {
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "#27ae60",
    marginBottom: 8,
    letterSpacing: "0.02em",
  },
  tableNum: {
    fontSize: "2.4rem",
    fontWeight: 900,
    color: "#fff",
    marginBottom: 20,
  },
  menuList: {
    background: "#16213e",
    borderRadius: 10,
    padding: "12px 20px",
    marginBottom: 16,
    textAlign: "left",
  },
  menuItem: {
    color: "#7fb3ff",
    fontSize: "1rem",
    padding: "4px 0",
    fontWeight: 600,
  },
  subText: {
    color: "#a0a0b0",
    fontSize: "0.9rem",
    marginBottom: 24,
  },
  dismissBtn: {
    background: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 32px",
    fontSize: "1.1rem",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
};
