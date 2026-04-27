import { useState, useEffect } from "react";
import type { Language, Menu } from "../types";
import { t } from "../i18n/translations";

interface MenuItem {
  menu_name: string;
  quantity: number;
  note: string;
  tasks: { step: number; task_type: string }[];
}

interface Props {
  language: Language;
  onSuccess: () => void;
}

const DEFAULT_TASKS = [
  { step: 1, task_type: "仕込み" },
  { step: 2, task_type: "調理" },
  { step: 3, task_type: "盛付" },
];

export default function NewOrderForm({ language, onSuccess }: Props) {
  const [tableNumber, setTableNumber] = useState("");
  const [items, setItems] = useState<MenuItem[]>([
    { menu_name: "", quantity: 1, note: "", tasks: DEFAULT_TASKS },
  ]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // メニューマスターを取得
  useEffect(() => {
    fetch("/api/menus/?active_only=true")
      .then((r) => r.json())
      .then((data: Menu[]) => setMenus(data))
      .catch(() => {});
  }, []);

  const addItem = () =>
    setItems([...items, { menu_name: "", quantity: 1, note: "", tasks: DEFAULT_TASKS }]);

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItemField = (
    i: number,
    field: keyof Pick<MenuItem, "menu_name" | "note">,
    value: string
  ) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const updateQuantity = (i: number, value: number) => {
    const updated = [...items];
    updated[i].quantity = value;
    setItems(updated);
  };

  // メニューマスターから選択した場合、手順を自動セット
  const selectMenu = (i: number, menuId: string) => {
    const menu = menus.find((m) => m.id === parseInt(menuId));
    const updated = [...items];
    if (menu) {
      updated[i].menu_name = menu.name;
      updated[i].tasks =
        menu.steps.length > 0
          ? menu.steps.map((s) => ({ step: s.step, task_type: s.task_type }))
          : DEFAULT_TASKS;
    } else {
      updated[i].menu_name = "";
      updated[i].tasks = DEFAULT_TASKS;
    }
    setItems(updated);
  };

  // 練習用: 味噌ラーメンのデモデータをフォームにセット
  const fillDemo = () => {
    setTableNumber("A1");
    const misoRamen = menus.find((m) => m.name === "味噌ラーメン");
    if (misoRamen) {
      setItems([{
        menu_name: misoRamen.name,
        quantity: 1,
        note: "",
        tasks: misoRamen.steps.length > 0
          ? misoRamen.steps.map((s) => ({ step: s.step, task_type: s.task_type }))
          : DEFAULT_TASKS,
      }]);
    } else {
      setItems([{ menu_name: "味噌ラーメン", quantity: 1, note: "", tasks: DEFAULT_TASKS }]);
    }
  };

  const handleSubmit = async () => {
    if (!tableNumber.trim()) {
      setError("テーブル番号を入力してください");
      return;
    }
    const validItems = items.filter((i) => i.menu_name.trim());
    if (validItems.length === 0) {
      setError("メニューを1つ以上選択/入力してください");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      table_number: tableNumber.trim(),
      items: validItems.map((item) => ({
        menu_name: item.menu_name.trim(),
        quantity: item.quantity,
        note: item.note.trim() || null,
        tasks: item.tasks,
      })),
    };

    try {
      const res = await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError("送信に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ ...styles.title, marginBottom: 0 }}>{t(language, "createOrder")}</h2>
        <button
          type="button"
          onClick={fillDemo}
          style={styles.demoBtn}
        >
          🍜 練習用入力
        </button>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>{t(language, "tableNumber")}</label>
        <input
          type="text"
          placeholder="例: A1, 3, テイクアウト"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>{t(language, "menu")}</label>
        {items.map((item, i) => (
          <div key={i} style={styles.itemCard}>
            {/* メニューマスターから選択 or 手入力 */}
            {menus.length > 0 ? (
              <div style={styles.menuRow}>
                <select
                  style={{ ...styles.input, flex: 2 }}
                  value={menus.find((m) => m.name === item.menu_name)?.id ?? ""}
                  onChange={(e) => selectMenu(i, e.target.value)}
                >
                  <option value="">-- メニューを選択 --</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.category ? ` (${m.category})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="または直接入力..."
                  value={item.menu_name}
                  onChange={(e) => updateItemField(i, "menu_name", e.target.value)}
                  style={{ ...styles.input, flex: 2 }}
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder={`${t(language, "menu")} ${i + 1}`}
                value={item.menu_name}
                onChange={(e) => updateItemField(i, "menu_name", e.target.value)}
                style={styles.input}
              />
            )}

            <div style={styles.itemRow2}>
              <div style={styles.qtyRow}>
                <label style={styles.smallLabel}>{t(language, "quantity")}</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(i, parseInt(e.target.value) || 1)}
                  style={{ ...styles.input, width: 80 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.smallLabel}>{t(language, "note")}</label>
                <input
                  type="text"
                  placeholder="辛さ控えめ、アレルギーなど"
                  value={item.note}
                  onChange={(e) => updateItemField(i, "note", e.target.value)}
                  style={styles.input}
                />
              </div>
              {items.length > 1 && (
                <button onClick={() => removeItem(i)} style={styles.removeBtn}>✕</button>
              )}
            </div>

            {/* タスクプレビュー */}
            <div style={styles.taskPreview}>
              {item.tasks.map((task, ti) => (
                <span key={ti} style={styles.taskChip}>
                  {task.step}. {task.task_type}
                </span>
              ))}
            </div>
          </div>
        ))}

        <button className="btn-secondary btn-small" onClick={addItem} style={{ marginTop: 8 }}>
          + {t(language, "addMenu")}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        className="btn-primary"
        style={{ width: "100%", marginTop: 16, fontSize: "1.1rem" }}
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? "送信中..." : t(language, "submit")}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: "#1a1a2e",
    borderRadius: 14,
    padding: 24,
    maxWidth: 640,
  },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea", marginBottom: 20 },
  field: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: "0.9rem",
    color: "#a0a0b0",
    marginBottom: 8,
    fontWeight: 600,
  },
  smallLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#a0a0b0",
    marginBottom: 4,
  },
  input: {
    background: "#16213e",
    border: "2px solid #0f3460",
    borderRadius: 8,
    color: "#eaeaea",
    padding: "10px 14px",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
  },
  itemCard: {
    background: "#16213e",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    border: "1px solid #0f3460",
  },
  menuRow: { display: "flex", gap: 8, marginBottom: 10 },
  itemRow2: { display: "flex", gap: 8, alignItems: "flex-end", marginTop: 10 },
  qtyRow: { width: 90 },
  removeBtn: {
    background: "#e9456033",
    color: "#e94560",
    border: "none",
    borderRadius: 6,
    padding: "10px 12px",
    cursor: "pointer",
    alignSelf: "flex-end" as const,
    flexShrink: 0,
  },
  taskPreview: { display: "flex", gap: 6, flexWrap: "wrap" as const, marginTop: 10 },
  taskChip: {
    background: "#0f3460",
    color: "#7fb3ff",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  demoBtn: {
    background: "#0f346044",
    color: "#7fb3ff",
    border: "1px solid #0f3460",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: "0.85rem",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
  },
  error: {
    background: "#e9456033",
    color: "#e94560",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: "0.9rem",
    marginTop: 8,
  },
};
