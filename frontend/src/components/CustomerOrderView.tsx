import { useState, useEffect } from "react";
import type { Language, Menu } from "../types";
import { LANGUAGE_NAMES } from "../i18n/translations";

const LANGS: Language[] = ["ja", "zh", "th", "vi", "ne", "id", "my"];

const DEFAULT_TASKS = [
  { step: 1, task_type: "仕込み" },
  { step: 2, task_type: "調理" },
  { step: 3, task_type: "盛付" },
];

const CAT_EMOJI: Record<string, string> = {
  ラーメン: "🍜", うどん: "🍜", そば: "🍜",
  ごはん: "🍚", 丼: "🥣", 定食: "🍱",
  カレー: "🍛", パスタ: "🍝", ピザ: "🍕",
  サラダ: "🥗", 揚げ物: "🍤", 焼き物: "🥩",
  スープ: "🍲", デザート: "🍮", ドリンク: "🥤",
  お酒: "🍺", 餃子: "🥟", 寿司: "🍣",
  その他: "🍽️",
};

function menuEmoji(menu: Menu): string {
  const cat = menu.category ?? "その他";
  return CAT_EMOJI[cat] ?? "🍽️";
}

interface CartItem { menu: Menu; qty: number }

interface Props {
  tableNumber: string;
  language: Language;
  onChangeLanguage: (l: Language) => void;
  onOrderSubmitted: (orderId: number) => void;
}

export default function CustomerOrderView({
  tableNumber, language, onChangeLanguage, onOrderSubmitted,
}: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/menus/?active_only=true")
      .then((r) => r.json())
      .then((data: Menu[]) => { setMenus(data.filter((m) => m.is_active)); setLoading(false); })
      .catch(() => { setError("メニューを読み込めませんでした"); setLoading(false); });
  }, []);

  const add = (menu: Menu) =>
    setCart((prev) => {
      const found = prev.find((c) => c.menu.id === menu.id);
      return found
        ? prev.map((c) => c.menu.id === menu.id ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { menu, qty: 1 }];
    });

  const sub = (menuId: number) =>
    setCart((prev) => {
      const found = prev.find((c) => c.menu.id === menuId);
      if (!found) return prev;
      return found.qty === 1
        ? prev.filter((c) => c.menu.id !== menuId)
        : prev.map((c) => c.menu.id === menuId ? { ...c, qty: c.qty - 1 } : c);
    });

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const submit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        table_number: tableNumber,
        items: cart.map((c) => ({
          menu_name: c.menu.name,
          quantity: c.qty,
          note: null,
          tasks: c.menu.steps.length > 0
            ? c.menu.steps.map((s) => ({ step: s.step, task_type: s.task_type }))
            : DEFAULT_TASKS,
        })),
      };
      const res = await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      onOrderSubmitted(order.id);
    } catch {
      setError(ERR[language] ?? ERR.ja ?? "エラーが発生しました");
      setSubmitting(false);
    }
  };

  const categories = [...new Set(menus.map((m) => m.category ?? "その他"))];

  return (
    <div style={s.root}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* ヘッダー */}
      <div style={s.header}>
        <div style={s.tableChip}>🪑 {tableNumber}</div>
        <div style={s.langRow}>
          {LANGS.map((l) => (
            <button
              key={l}
              style={{ ...s.langBtn, ...(language === l ? s.langBtnOn : {}) }}
              onClick={() => onChangeLanguage(l)}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      </div>

      {/* タイトル */}
      <div style={s.titleWrap}>
        <div style={s.titleIcon}>🍽️</div>
        <div style={s.titleText}>{TITLE[language] ?? TITLE.ja ?? "ご注文はこちら"}</div>
        <div style={s.titleSub}>{SUB[language] ?? SUB.ja ?? "メニューを選んでください"}</div>
      </div>

      {/* メニュー一覧 */}
      <div style={s.scroll}>
        {loading ? (
          <div style={s.center}>🍳 読み込み中...</div>
        ) : error && menus.length === 0 ? (
          <div style={s.center}>{error}</div>
        ) : menus.length === 0 ? (
          <div style={s.center}>メニューが登録されていません</div>
        ) : (
          categories.map((cat) => (
            <div key={cat} style={s.section}>
              <div style={s.catLabel}>
                {CAT_EMOJI[cat] ?? "🍽️"} {cat}
              </div>
              <div style={s.grid}>
                {menus.filter((m) => (m.category ?? "その他") === cat).map((menu) => {
                  const item = cart.find((c) => c.menu.id === menu.id);
                  return (
                    <div
                      key={menu.id}
                      style={{ ...s.card, ...(item ? s.cardOn : {}) }}
                    >
                      <div style={s.cardEmoji}>{menuEmoji(menu)}</div>
                      <div style={s.cardName}>{menu.name}</div>
                      {item ? (
                        <div style={s.qtyRow}>
                          <button style={s.qtyBtn} onClick={() => sub(menu.id)}>－</button>
                          <span style={s.qtyNum}>{item.qty}</span>
                          <button style={s.qtyBtn} onClick={() => add(menu)}>＋</button>
                        </div>
                      ) : (
                        <button style={s.addBtn} onClick={() => add(menu)}>
                          {ADD[language] ?? ADD.ja ?? "追加"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div style={{ height: totalItems > 0 ? 120 : 32 }} />
      </div>

      {/* カートバー */}
      {totalItems > 0 && (
        <div style={s.cartBar}>
          <div style={s.cartItems}>
            {cart.map((c) => (
              <span key={c.menu.id} style={s.cartChip}>
                {menuEmoji(c.menu)} {c.menu.name}
                {c.qty > 1 && <span style={s.cartQty}>×{c.qty}</span>}
              </span>
            ))}
          </div>
          {error && <div style={s.cartErr}>{error}</div>}
          <button style={s.orderBtn} onClick={submit} disabled={submitting}>
            {submitting
              ? (SENDING[language] ?? SENDING.ja ?? "送信中…")
              : `${ORDER[language] ?? ORDER.ja ?? "注文する"}（${totalItems}点）`}
          </button>
        </div>
      )}
    </div>
  );
}

// ── 多言語テキスト ─────────────────────────────────────────
const TITLE: Partial<Record<Language, string>> = {
  ja: "ご注文はこちら", zh: "请在此点餐", th: "สั่งอาหารที่นี่",
  vi: "Đặt món tại đây", ne: "यहाँ अर्डर गर्नुहोस्",
  id: "Pesan di sini", my: "ဤနေရာတွင် မှာယူပါ",
};
const SUB: Partial<Record<Language, string>> = {
  ja: "食べたいメニューを選んでください ✨", zh: "请选择您想要的菜品 ✨",
  th: "เลือกเมนูที่คุณต้องการ ✨", vi: "Chọn món bạn muốn ✨",
  ne: "तपाईंले चाहेको मेनु छान्नुहोस् ✨",
  id: "Pilih menu yang Anda inginkan ✨", my: "သင်လိုချင်သောမီနူးကို ရွေးချယ်ပါ ✨",
};
const ADD: Partial<Record<Language, string>> = {
  ja: "追加", zh: "添加", th: "เพิ่ม", vi: "Thêm",
  ne: "थप्नुहोस्", id: "Tambah", my: "ထည့်ရန်",
};
const ORDER: Partial<Record<Language, string>> = {
  ja: "注文する", zh: "下单", th: "สั่งอาหาร", vi: "Đặt hàng",
  ne: "अर्डर गर्नुहोस्", id: "Pesan", my: "မှာယူရန်",
};
const SENDING: Partial<Record<Language, string>> = {
  ja: "送信中…", zh: "发送中…", th: "กำลังส่ง…", vi: "Đang gửi…",
  ne: "पठाउँदै…", id: "Mengirim…", my: "ပို့နေသည်…",
};
const ERR: Partial<Record<Language, string>> = {
  ja: "注文に失敗しました。もう一度お試しください。",
  zh: "下单失败，请再试一次。", th: "สั่งไม่สำเร็จ กรุณาลองอีกครั้ง",
  vi: "Đặt hàng thất bại. Vui lòng thử lại.",
  ne: "अर्डर असफल भयो। फेरि प्रयास गर्नुहोस्।",
  id: "Pemesanan gagal. Coba lagi.", my: "မှာယူမှု မအောင်မြင်ပါ။ ထပ်စမ်းကြည့်ပါ။",
};

// ── スタイル ──────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "2px solid rgba(255,140,66,0.18)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  tableChip: {
    background: "linear-gradient(135deg,#ff8c42,#ff6b6b)",
    color: "#fff",
    borderRadius: 999,
    padding: "6px 16px",
    fontWeight: 800,
    fontSize: "1rem",
    letterSpacing: "-0.01em",
    flexShrink: 0,
  },
  langRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  langBtn: {
    background: "rgba(255,255,255,0.7)",
    color: "#a08060",
    border: "1.5px solid rgba(200,140,100,0.25)",
    borderRadius: 8,
    padding: "5px 11px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  langBtnOn: {
    background: "linear-gradient(135deg,#ff6b6b,#ff8c42)",
    borderColor: "transparent",
    color: "#fff",
  },

  titleWrap: {
    textAlign: "center",
    padding: "28px 16px 12px",
    animation: "fadeUp 0.4s ease both",
  },
  titleIcon: { fontSize: "3.2rem", lineHeight: 1, marginBottom: 8 },
  titleText: {
    fontSize: "1.6rem",
    fontWeight: 900,
    color: "#2d2013",
    letterSpacing: "-0.02em",
    marginBottom: 6,
  },
  titleSub: { fontSize: "0.92rem", color: "#a08060", fontWeight: 600 },

  scroll: { flex: 1, padding: "0 12px", overflowY: "auto" },

  section: { marginBottom: 24 },
  catLabel: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "#6d4c2a",
    padding: "10px 4px 8px",
    borderBottom: "2px solid rgba(255,140,66,0.18)",
    marginBottom: 12,
    letterSpacing: "0.02em",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 12,
  },

  card: {
    background: "rgba(255,255,255,0.88)",
    border: "2px solid rgba(255,180,120,0.22)",
    borderRadius: 18,
    padding: "18px 10px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 3px 14px rgba(200,100,60,0.08)",
    transition: "all 0.18s",
    cursor: "default",
    animation: "fadeUp 0.35s ease both",
  },
  cardOn: {
    border: "2px solid #ff8c42",
    background: "rgba(255,240,220,0.95)",
    boxShadow: "0 4px 20px rgba(255,120,60,0.22)",
  },
  cardEmoji: { fontSize: "2.6rem", lineHeight: 1 },
  cardName: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#2d2013",
    textAlign: "center",
    lineHeight: 1.3,
  },

  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid rgba(255,140,60,0.4)",
    background: "rgba(255,255,255,0.8)",
    color: "#c85a00",
    fontSize: "1.1rem",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  qtyNum: {
    fontWeight: 900,
    fontSize: "1.15rem",
    color: "#c85a00",
    minWidth: 20,
    textAlign: "center",
  },
  addBtn: {
    background: "linear-gradient(135deg,#ff8c42,#ff6b6b)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "7px 18px",
    fontWeight: 800,
    fontSize: "0.88rem",
    cursor: "pointer",
    marginTop: 2,
  },

  cartBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "2px solid rgba(255,140,66,0.25)",
    padding: "12px 16px 20px",
    zIndex: 30,
    boxShadow: "0 -8px 32px rgba(200,100,60,0.14)",
    animation: "cartPop 0.25s ease",
  },
  cartItems: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  cartChip: {
    background: "rgba(255,240,220,0.9)",
    border: "1px solid rgba(255,160,80,0.3)",
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#6d4c2a",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  cartQty: {
    background: "#ff8c42",
    color: "#fff",
    borderRadius: 999,
    padding: "1px 7px",
    fontSize: "0.78rem",
    fontWeight: 800,
  },
  cartErr: {
    color: "#e94560",
    fontSize: "0.85rem",
    marginBottom: 8,
    fontWeight: 600,
  },
  orderBtn: {
    width: "100%",
    background: "linear-gradient(135deg,#ff6b6b,#ff8c42)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "16px 0",
    fontWeight: 900,
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 6px 24px rgba(255,107,107,0.4)",
    letterSpacing: "0.02em",
  },

  center: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#b09880",
    fontSize: "1.05rem",
  },
};
