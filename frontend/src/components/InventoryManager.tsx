import { useState, useEffect, useCallback } from "react";
import type { Ingredient, InventoryLog, Language } from "../types";
import { t } from "../i18n/translations";

interface Props {
  language: Language;
}

const UNITS = ["g", "kg", "ml", "L", "個", "枚", "本", "袋", "缶", "パック"];

export default function InventoryManager({ language }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Ingredient | null>(null);
  const [logTarget, setLogTarget] = useState<Ingredient | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [todayUsage, setTodayUsage] = useState<{ name: string; unit: string; total_used: number }[]>([]);

  const fetchAll = useCallback(async () => {
    const [ingRes, usageRes] = await Promise.all([
      fetch("/api/inventory/"),
      fetch("/api/inventory/usage/today"),
    ]);
    if (ingRes.ok) setIngredients(await ingRes.json());
    if (usageRes.ok) {
      const data = await usageRes.json();
      setTodayUsage(data.usage ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openLogs = async (ing: Ingredient) => {
    setLogTarget(ing);
    const res = await fetch(`/api/inventory/${ing.id}/logs`);
    if (res.ok) setLogs(await res.json());
  };

  const deleteIngredient = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    if (res.ok) setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const alertCount = ingredients.filter(
    (i) => i.min_stock_alert > 0 && i.current_stock <= i.min_stock_alert
  ).length;

  if (loading) return <div style={s.center}>{t(language, "loading")}</div>;

  if (logTarget) {
    return (
      <div style={s.root}>
        <div style={s.headerRow}>
          <h2 style={s.title}>📋 {t(language, "stockHistory")} — {logTarget.name}</h2>
          <button className="btn-secondary btn-small" onClick={() => { setLogTarget(null); setLogs([]); }}>
            ← {t(language, "back")}
          </button>
        </div>
        <div style={s.logList}>
          {logs.length === 0 ? (
            <div style={s.empty}>履歴なし</div>
          ) : logs.map((log) => (
            <div key={log.id} style={{ ...s.logRow, borderColor: log.change_amount >= 0 ? "#27ae6044" : "#e9456044" }}>
              <span style={{ color: log.change_amount >= 0 ? "#27ae60" : "#e94560", fontWeight: 800, fontSize: "1rem" }}>
                {log.change_amount >= 0 ? "+" : ""}{log.change_amount}{logTarget.unit}
              </span>
              <span style={s.logReason}>{log.reason}</span>
              {log.note && <span style={{ color: "#a0a0b0", fontSize: "0.8rem" }}>{log.note}</span>}
              <span style={{ color: "#555570", fontSize: "0.75rem", marginLeft: "auto" }}>
                {new Date(log.created_at).toLocaleString("ja-JP")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (adjustTarget) {
    return (
      <AdjustForm
        ingredient={adjustTarget}
        language={language}
        onDone={(updated) => {
          setIngredients((prev) => prev.map((i) => i.id === updated.id ? updated : i));
          setAdjustTarget(null);
        }}
        onCancel={() => setAdjustTarget(null)}
      />
    );
  }

  if (showForm) {
    return (
      <IngredientForm
        language={language}
        onSaved={(ing) => {
          setIngredients((prev) => [...prev, ing]);
          setShowForm(false);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div style={s.root}>
      {/* ヘッダー */}
      <div style={s.headerRow}>
        <h2 style={s.title}>
          📦 {t(language, "inventory")}
          {alertCount > 0 && (
            <span style={s.alertBadge}>⚠ {alertCount}</span>
          )}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary btn-small" onClick={fetchAll}>↻</button>
          <button className="btn-primary btn-small" onClick={() => setShowForm(true)}>
            + {t(language, "addIngredient")}
          </button>
        </div>
      </div>

      {/* 本日の使用量サマリー */}
      {todayUsage.length > 0 && (
        <section style={s.section}>
          <h3 style={s.sectionTitle}>📊 {t(language, "todayUsage")}</h3>
          <div style={s.usageGrid}>
            {todayUsage.map((u) => (
              <div key={u.name} style={s.usageCard}>
                <div style={{ fontWeight: 700, color: "#eaeaea" }}>{u.name}</div>
                <div style={{ color: "#e94560", fontWeight: 800, fontSize: "1.1rem" }}>
                  -{u.total_used}{u.unit}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 食材リスト */}
      {ingredients.length === 0 ? (
        <div style={s.empty}>{t(language, "noIngredients")}</div>
      ) : (
        <div style={s.list}>
          {ingredients.map((ing) => {
            const isLow = ing.min_stock_alert > 0 && ing.current_stock <= ing.min_stock_alert;
            const pct = ing.min_stock_alert > 0
              ? Math.min(100, (ing.current_stock / (ing.min_stock_alert * 3)) * 100)
              : null;
            return (
              <div
                key={ing.id}
                style={{
                  ...s.card,
                  borderColor: isLow ? "#e94560" : "#0f3460",
                  boxShadow: isLow ? "0 0 12px #e9456033" : "none",
                }}
              >
                {/* 名前・単位・アラートバッジ */}
                <div style={s.cardTop}>
                  <div>
                    <span style={s.ingName}>{ing.name}</span>
                    <span style={s.unitTag}>{ing.unit}</span>
                    {isLow && (
                      <span style={s.lowBadge}>⚠ {t(language, "stockLow")}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={s.iconBtn} onClick={() => openLogs(ing)} title="履歴">📋</button>
                    <button style={s.iconBtn} onClick={() => setAdjustTarget(ing)} title="在庫調整">+/-</button>
                    <button style={{ ...s.iconBtn, color: "#e94560" }} onClick={() => deleteIngredient(ing.id)}>🗑</button>
                  </div>
                </div>

                {/* 在庫量 */}
                <div style={s.stockRow}>
                  <span style={{ ...s.stockNum, color: isLow ? "#e94560" : "#27ae60" }}>
                    {ing.current_stock}{ing.unit}
                  </span>
                  {ing.min_stock_alert > 0 && (
                    <span style={{ color: "#a0a0b0", fontSize: "0.8rem" }}>
                      / アラート: {ing.min_stock_alert}{ing.unit}
                    </span>
                  )}
                </div>

                {/* 在庫バー */}
                {pct !== null && (
                  <div style={s.barTrack}>
                    <div style={{
                      ...s.barFill,
                      width: `${pct}%`,
                      background: isLow ? "#e94560" : pct < 50 ? "#f39c12" : "#27ae60",
                    }} />
                  </div>
                )}

                {/* 入荷ボタン（クイック） */}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {[10, 50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      style={s.quickBtn}
                      onClick={async () => {
                        const res = await fetch(`/api/inventory/${ing.id}/adjust`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ amount: amt, reason: "入荷" }),
                        });
                        if (res.ok) {
                          const updated: Ingredient = await res.json();
                          setIngredients((prev) => prev.map((i) => i.id === updated.id ? updated : i));
                        }
                      }}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 在庫調整フォーム ────────────────────────────────────
function AdjustForm({ ingredient, language, onDone, onCancel }: {
  ingredient: Ingredient;
  language: Language;
  onDone: (updated: Ingredient) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"restock" | "dispose" | "adjust">("restock");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    const change = mode === "dispose" ? -n : n;
    const reason = mode === "restock" ? "入荷" : mode === "dispose" ? "廃棄" : "手動調整";
    setSubmitting(true);
    const res = await fetch(`/api/inventory/${ingredient.id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: change, reason, note: note || null }),
    });
    if (res.ok) onDone(await res.json());
    setSubmitting(false);
  };

  return (
    <div style={s.root}>
      <div style={s.headerRow}>
        <h2 style={s.title}>📦 {ingredient.name} — 在庫調整</h2>
        <button className="btn-secondary btn-small" onClick={onCancel}>{t(language, "cancel")}</button>
      </div>

      <div style={s.adjustCard}>
        <div style={{ fontSize: "0.85rem", color: "#a0a0b0", marginBottom: 12 }}>
          {t(language, "currentStock")}: <strong style={{ color: "#eaeaea" }}>{ingredient.current_stock}{ingredient.unit}</strong>
        </div>

        {/* モード選択 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["restock", "dispose", "adjust"] as const).map((m) => (
            <button
              key={m}
              style={{ ...s.modeBtn, ...(mode === m ? s.modeBtnActive : {}) }}
              onClick={() => setMode(m)}
            >
              {m === "restock" ? "📥 入荷" : m === "dispose" ? "🗑 廃棄" : "✏ 手動調整"}
            </button>
          ))}
        </div>

        <div style={s.formRow}>
          <label style={s.label}>{mode === "dispose" ? t(language, "disposeAmount") : t(language, "restockAmount")} ({ingredient.unit})</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例: 500"
            style={s.input}
            autoFocus
          />
        </div>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "note")}（任意）</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 〇〇業者から入荷"
            style={s.input}
          />
        </div>

        <button
          className={mode === "dispose" ? "btn-secondary" : "btn-primary"}
          style={{ width: "100%", marginTop: 8 }}
          disabled={submitting || !amount}
          onClick={handleSubmit}
        >
          {submitting ? "処理中..." : mode === "restock" ? "入荷を記録" : mode === "dispose" ? "廃棄を記録" : "調整を記録"}
        </button>
      </div>
    </div>
  );
}

// ── 食材登録フォーム ────────────────────────────────────
function IngredientForm({ language, onSaved, onCancel }: {
  language: Language;
  onSaved: (ing: Ingredient) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");
  const [stock, setStock] = useState("");
  const [minAlert, setMinAlert] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/inventory/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        unit,
        current_stock: parseFloat(stock) || 0,
        min_stock_alert: parseFloat(minAlert) || 0,
      }),
    });
    if (res.ok) onSaved(await res.json());
    setSubmitting(false);
  };

  return (
    <div style={s.root}>
      <div style={s.headerRow}>
        <h2 style={s.title}>+ {t(language, "addIngredient")}</h2>
        <button className="btn-secondary btn-small" onClick={onCancel}>{t(language, "cancel")}</button>
      </div>

      <div style={s.adjustCard}>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "ingredientName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 豚肉" style={s.input} autoFocus />
        </div>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "unit")}</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={s.input}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "currentStock")}</label>
          <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" style={s.input} />
        </div>
        <div style={s.formRow}>
          <label style={s.label}>{t(language, "minStockAlert")} （この量を下回るとアラート）</label>
          <input type="number" min={0} value={minAlert} onChange={(e) => setMinAlert(e.target.value)} placeholder="0" style={s.input} />
        </div>
        <button className="btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={submitting || !name.trim()} onClick={handleSubmit}>
          {submitting ? "登録中..." : t(language, "submit")}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 32px" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea", display: "flex", alignItems: "center", gap: 10 },
  alertBadge: {
    background: "#e9456033", color: "#e94560",
    borderRadius: 999, padding: "2px 10px", fontSize: "0.8rem", fontWeight: 700,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#eaeaea", marginBottom: 10 },
  usageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 },
  usageCard: { background: "#16213e", borderRadius: 10, padding: "12px", border: "1px solid #e9456033" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#1a1a2e", borderRadius: 14, padding: 16,
    border: "2px solid", transition: "box-shadow 0.2s",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  ingName: { fontWeight: 700, fontSize: "1.05rem", color: "#eaeaea" },
  unitTag: {
    marginLeft: 8, background: "#0f3460", color: "#7fb3ff",
    padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700,
  },
  lowBadge: {
    marginLeft: 8, background: "#e9456033", color: "#e94560",
    padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700,
  },
  stockRow: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 },
  stockNum: { fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 },
  barTrack: { height: 6, background: "#0f0f1a", borderRadius: 99, overflow: "hidden", marginBottom: 4 },
  barFill: { height: "100%", borderRadius: 99, transition: "width 0.5s" },
  quickBtn: {
    background: "#27ae6022", color: "#27ae60",
    border: "1px solid #27ae6044", borderRadius: 8,
    padding: "6px 10px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700,
  },
  iconBtn: {
    background: "#16213e", border: "1px solid #0f3460", color: "#a0a0b0",
    borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: "0.85rem",
  },
  logList: { display: "flex", flexDirection: "column", gap: 8 },
  logRow: {
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const,
    background: "#16213e", borderRadius: 10, padding: "10px 14px",
    border: "1px solid",
  },
  logReason: { color: "#a0a0b0", fontSize: "0.85rem" },
  adjustCard: { background: "#16213e", borderRadius: 14, padding: 24, maxWidth: 500 },
  formRow: { marginBottom: 16 },
  label: { display: "block", fontSize: "0.85rem", color: "#a0a0b0", marginBottom: 6, fontWeight: 600 },
  input: {
    background: "#1a1a2e", border: "2px solid #0f3460", borderRadius: 8,
    color: "#eaeaea", padding: "10px 14px", fontSize: "0.95rem",
    outline: "none", width: "100%",
  },
  modeBtn: {
    flex: 1, background: "#1a1a2e", border: "2px solid #0f3460",
    color: "#a0a0b0", borderRadius: 10, padding: "10px",
    cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
  },
  modeBtnActive: { borderColor: "#7fb3ff", color: "#7fb3ff", background: "#7fb3ff11" },
  center: { textAlign: "center", padding: 60, color: "#a0a0b0" },
  empty: { textAlign: "center", padding: 40, color: "#555570" },
};
