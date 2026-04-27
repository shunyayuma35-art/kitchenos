import { useState, useEffect, useCallback } from "react";
import type { Menu, MenuStep, Ingredient, MenuIngredient, Language } from "../types";
import { t } from "../i18n/translations";

interface Props {
  language: Language;
}

const TASK_TYPES = ["仕込み", "調理", "盛付"];
const TYPE_COLOR: Record<string, string> = {
  調理: "#f39c12",
  盛付: "#9b59b6",
  仕込み: "#27ae60",
};

export default function MenuManager({ language }: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [ingredientMenu, setIngredientMenu] = useState<Menu | null>(null);

  useEffect(() => {
    fetch("/api/menus/")
      .then((r) => r.json())
      .then((data) => { setMenus(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleActive = async (menu: Menu) => {
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !menu.is_active }),
    });
    if (res.ok) {
      const updated: Menu = await res.json();
      setMenus((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    }
  };

  const deleteMenu = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
    if (res.ok) setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  const onSaved = (menu: Menu) => {
    setMenus((prev) => {
      const exists = prev.find((m) => m.id === menu.id);
      return exists ? prev.map((m) => (m.id === menu.id ? menu : m)) : [...prev, menu];
    });
    setEditing(null);
    setShowForm(false);
  };

  if (ingredientMenu) {
    return (
      <MenuIngredientEditor
        menu={ingredientMenu}
        language={language}
        onBack={() => setIngredientMenu(null)}
      />
    );
  }

  if (editing) {
    return (
      <MenuForm
        menu={editing}
        language={language}
        onSaved={onSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (showForm) {
    return (
      <MenuForm
        menu={null}
        language={language}
        onSaved={onSaved}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>{t(language, "menus")}</h2>
        <button className="btn-primary btn-small" onClick={() => setShowForm(true)}>
          + {t(language, "addMenu")}
        </button>
      </div>

      {loading ? (
        <div style={styles.center}>読み込み中...</div>
      ) : menus.length === 0 ? (
        <div style={styles.empty}>{t(language, "noMenus")}</div>
      ) : (
        <div style={styles.list}>
          {menus.map((menu) => (
            <div
              key={menu.id}
              style={{
                ...styles.menuCard,
                opacity: menu.is_active ? 1 : 0.5,
              }}
            >
              <div style={styles.menuHeader}>
                <div>
                  <div style={styles.menuName}>{menu.name}</div>
                  {menu.category && (
                    <div style={styles.category}>{menu.category}</div>
                  )}
                </div>
                <div style={styles.menuActions}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: menu.is_active ? "#27ae6033" : "#55557033",
                      color: menu.is_active ? "#27ae60" : "#a0a0b0",
                    }}
                  >
                    {menu.is_active ? t(language, "active") : t(language, "inactive")}
                  </span>
                  <button
                    className="btn-secondary btn-small"
                    onClick={() => setEditing(menu)}
                  >
                    ✏ {t(language, "editMenu")}
                  </button>
                  <button
                    className="btn-secondary btn-small"
                    onClick={() => setIngredientMenu(menu)}
                    title={t(language, "linkIngredients")}
                  >
                    📦 {t(language, "inventory")}
                  </button>
                  <button
                    style={styles.toggleBtn}
                    onClick={() => toggleActive(menu)}
                  >
                    {menu.is_active ? "⏸" : "▶"}
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteMenu(menu.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* 手順プレビュー */}
              <div style={styles.steps}>
                {menu.steps.map((step) => (
                  <StepChip key={step.id} step={step} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function resolveJa(raw: string): string {
  try {
    const p = JSON.parse(raw);
    if (typeof p === "object" && p !== null && "ja" in p) return p.ja as string;
  } catch { /* plain text */ }
  return raw;
}

function StepChip({ step }: { step: MenuStep }) {
  const desc = resolveJa(step.description);
  const preview = desc.length > 40 ? desc.slice(0, 40) + "…" : desc;
  return (
    <div style={styles.stepChip}>
      <span
        style={{
          ...styles.stepType,
          background: (TYPE_COLOR[step.task_type] ?? "#555") + "33",
          color: TYPE_COLOR[step.task_type] ?? "#555",
        }}
      >
        {step.task_type}
      </span>
      <span style={styles.stepNum}>{step.step}</span>
      <span style={styles.stepDesc}>{preview}</span>
      {step.estimated_time_seconds && (
        <span style={styles.timeBadge}>⏱{Math.round(step.estimated_time_seconds / 60)}m</span>
      )}
    </div>
  );
}

// ─── メニュー登録・編集フォーム ────────────────────────────
interface FormProps {
  menu: Menu | null;
  language: Language;
  onSaved: (menu: Menu) => void;
  onCancel: () => void;
}

interface StepDraft {
  step: number;
  task_type: string;
  description: string;
  estimated_time_seconds: number | "";
  auto_next: boolean;
  required_checklist: string;  // comma-separated → JSON array on submit
}

function MenuForm({ menu, language, onSaved, onCancel }: FormProps) {
  const [name, setName] = useState(menu?.name ?? "");
  const [category, setCategory] = useState(menu?.category ?? "");
  const [steps, setSteps] = useState<StepDraft[]>(
    menu?.steps.map((s) => ({
      step: s.step,
      task_type: s.task_type,
      description: s.description,
      estimated_time_seconds: s.estimated_time_seconds ?? "",
      auto_next: s.auto_next ?? false,
      required_checklist: s.required_checklist
        ? (() => { try { return (JSON.parse(s.required_checklist!) as string[]).join(", "); } catch { return s.required_checklist ?? ""; } })()
        : "",
    })) ?? [
      { step: 1, task_type: "仕込み", description: "", estimated_time_seconds: "", auto_next: false, required_checklist: "" },
      { step: 2, task_type: "調理", description: "", estimated_time_seconds: "", auto_next: false, required_checklist: "" },
      { step: 3, task_type: "盛付", description: "", estimated_time_seconds: "", auto_next: false, required_checklist: "" },
    ]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addStep = () =>
    setSteps([...steps, { step: steps.length + 1, task_type: "調理", description: "", estimated_time_seconds: "", auto_next: false, required_checklist: "" }]);

  const updateStep = (i: number, field: keyof StepDraft, value: string | number | boolean) => {
    const s = steps.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    s.forEach((item, idx) => { item.step = idx + 1; });
    setSteps(s);
  };

  const removeStep = (i: number) => {
    const s = steps.filter((_, idx) => idx !== i);
    s.forEach((item, idx) => { item.step = idx + 1; });
    setSteps(s);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("メニュー名を入力してください"); return; }
    const validSteps = steps.filter((s) => s.description.trim());
    if (validSteps.length === 0) { setError("手順を1つ以上入力してください"); return; }

    setSubmitting(true);
    setError("");

    const payload = {
      name: name.trim(),
      category: category.trim() || null,
      steps: validSteps.map((s) => ({
        step: s.step,
        task_type: s.task_type,
        description: s.description,
        estimated_time_seconds: s.estimated_time_seconds !== "" ? Number(s.estimated_time_seconds) : null,
        auto_next: s.auto_next,
        required_checklist: s.required_checklist.trim()
          ? JSON.stringify(s.required_checklist.split(",").map((x) => x.trim()).filter(Boolean))
          : null,
      })),
    };

    try {
      const url = menu ? `/api/menus/${menu.id}` : "/api/menus/";
      const method = menu ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved: Menu = await res.json();
        onSaved(saved);
      } else {
        setError("保存に失敗しました");
      }
    } catch {
      setError("通信エラー");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.formRoot}>
      <div style={styles.formHeader}>
        <h2 style={styles.title}>
          {menu ? t(language, "editMenu") : t(language, "addMenu")}
        </h2>
        <button className="btn-secondary btn-small" onClick={onCancel}>
          {t(language, "cancel")}
        </button>
      </div>

      <div style={styles.formField}>
        <label style={styles.label}>{t(language, "name")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: スンドゥブ"
          style={styles.input}
        />
      </div>

      <div style={styles.formField}>
        <label style={styles.label}>{t(language, "category")}</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="例: 鍋物・定食・惣菜"
          style={styles.input}
        />
      </div>

      <div style={styles.formField}>
        <label style={styles.label}>調理手順</label>
        {steps.map((step, i) => (
          <div key={i} style={{ ...styles.stepRow, flexDirection: "column", alignItems: "stretch", gap: 8, padding: "12px", background: "rgba(255,248,240,0.85)", borderRadius: 10, marginBottom: 8, border: "1px solid rgba(220,190,160,0.25)" }}>
            {/* Row 1: 番号・種別・説明・削除 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={styles.stepNumLabel}>{i + 1}</span>
              <select
                value={step.task_type}
                onChange={(e) => updateStep(i, "task_type", e.target.value)}
                style={{ ...styles.input, width: 110, flex: "none" }}
              >
                {TASK_TYPES.map((tt) => (
                  <option key={tt} value={tt}>{tt}</option>
                ))}
              </select>
              <input
                value={step.description}
                onChange={(e) => updateStep(i, "description", e.target.value)}
                placeholder={`手順 ${i + 1} の内容`}
                style={{ ...styles.input, flex: 1 }}
              />
              {steps.length > 1 && (
                <button style={styles.removeBtn} onClick={() => removeStep(i)}>✕</button>
              )}
            </div>
            {/* Row 2: タイマー・自動進行・チェックリスト */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={styles.subLabel}>⏱ 目安(秒)</span>
                <input
                  type="number"
                  min={0}
                  value={step.estimated_time_seconds}
                  onChange={(e) => updateStep(i, "estimated_time_seconds", e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="例: 120"
                  style={{ ...styles.input, width: 90 }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={step.auto_next}
                  onChange={(e) => updateStep(i, "auto_next", e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span style={styles.subLabel}>自動完了</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 180 }}>
                <span style={styles.subLabel}>✓ チェック項目</span>
                <input
                  value={step.required_checklist}
                  onChange={(e) => updateStep(i, "required_checklist", e.target.value)}
                  placeholder="項目1, 項目2, ..."
                  style={{ ...styles.input, flex: 1, fontSize: "0.82rem" }}
                />
              </div>
            </div>
          </div>
        ))}
        <button className="btn-secondary btn-small" onClick={addStep} style={{ marginTop: 8 }}>
          + {t(language, "addStep")}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        className="btn-primary"
        style={{ width: "100%", marginTop: 8 }}
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? "保存中..." : t(language, "submit")}
      </button>
    </div>
  );
}

// ─── メニュー × 食材 紐付けエディタ ──────────────────────
function MenuIngredientEditor({ menu, language, onBack }: {
  menu: Menu;
  language: Language;
  onBack: () => void;
}) {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [linked, setLinked] = useState<MenuIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規行の状態
  const [selIngId, setSelIngId] = useState<number | "">("");
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    const [allRes, linkedRes] = await Promise.all([
      fetch("/api/inventory/"),
      fetch(`/api/inventory/menu/${menu.id}`),
    ]);
    if (allRes.ok) setAllIngredients(await allRes.json());
    if (linkedRes.ok) setLinked(await linkedRes.json());
    setLoading(false);
  }, [menu.id]);

  useEffect(() => { reload(); }, [reload]);

  const addLink = async () => {
    if (!selIngId || !qty) return;
    setSaving(true);
    // 既存リスト + 新規行 を一括保存
    const items = [
      ...linked.map((l) => ({ ingredient_id: l.ingredient_id, quantity_per_serving: l.quantity_per_serving })),
      { ingredient_id: Number(selIngId), quantity_per_serving: parseFloat(qty) },
    ];
    const res = await fetch(`/api/inventory/menu/${menu.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    if (res.ok) { await reload(); setSelIngId(""); setQty(""); }
    setSaving(false);
  };

  const removeLink = async (itemId: number) => {
    const items = linked
      .filter((l) => l.id !== itemId)
      .map((l) => ({ ingredient_id: l.ingredient_id, quantity_per_serving: l.quantity_per_serving }));
    const res = await fetch(`/api/inventory/menu/${menu.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    if (res.ok) await reload();
  };

  const unlinkedIngredients = allIngredients.filter(
    (i) => !linked.find((l) => l.ingredient_id === i.id)
  );

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>📦 {menu.name} — {t(language, "linkIngredients")}</h2>
        <button className="btn-secondary btn-small" onClick={onBack}>← {t(language, "back")}</button>
      </div>

      <p style={{ color: "#a0a0b0", fontSize: "0.85rem", marginBottom: 16 }}>
        {t(language, "autoDeducted")}（1人前あたりの使用量を設定してください）
      </p>

      {loading ? (
        <div style={{ color: "#a0a0b0" }}>{t(language, "loading")}</div>
      ) : (
        <>
          {/* 紐付け済みリスト */}
          {linked.length === 0 ? (
            <div style={{ color: "#555570", marginBottom: 16 }}>{t(language, "noIngredients")}</div>
          ) : (
            <div style={miStyles.list}>
              {linked.map((l) => (
                <div key={l.id} style={miStyles.row}>
                  <span style={miStyles.ingName}>{l.ingredient.name}</span>
                  <span style={miStyles.qty}>
                    {l.quantity_per_serving}{l.ingredient.unit}
                    <span style={{ color: "#7070a0", fontSize: "0.75rem" }}> / 人前</span>
                  </span>
                  <span style={{ color: "#a0a0b0", fontSize: "0.8rem" }}>
                    在庫: {l.ingredient.current_stock}{l.ingredient.unit}
                  </span>
                  <button style={miStyles.removeBtn} onClick={() => removeLink(l.id)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* 追加行 */}
          {unlinkedIngredients.length > 0 ? (
            <div style={miStyles.addRow}>
              <select
                value={selIngId}
                onChange={(e) => setSelIngId(e.target.value === "" ? "" : Number(e.target.value))}
                style={{ ...styles.input, flex: 2, minWidth: 120 }}
              >
                <option value="">食材を選択...</option>
                {unlinkedIngredients.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}（{i.unit}）</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step={0.1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="量"
                style={{ ...styles.input, flex: 1, minWidth: 80 }}
              />
              {selIngId !== "" && (
                <span style={{ color: "#a0a0b0", fontSize: "0.85rem", whiteSpace: "nowrap" as const }}>
                  {allIngredients.find((i) => i.id === selIngId)?.unit ?? ""}
                </span>
              )}
              <button
                className="btn-primary btn-small"
                disabled={!selIngId || !qty || saving}
                onClick={addLink}
                style={{ whiteSpace: "nowrap" as const }}
              >
                + {t(language, "addLink")}
              </button>
            </div>
          ) : (
            <div style={{ color: "#555570", fontSize: "0.85rem", marginTop: 8 }}>
              すべての食材が紐付け済みです。<br />
              新しい食材は「在庫管理」タブから登録できます。
            </div>
          )}
        </>
      )}
    </div>
  );
}

const miStyles: Record<string, React.CSSProperties> = {
  list: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  row: {
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const,
    background: "rgba(255,248,240,0.85)", borderRadius: 10, padding: "10px 14px",
    border: "1px solid rgba(220,190,160,0.25)",
  },
  ingName: { fontWeight: 700, color: "#2d2013", flex: 1, minWidth: 80 },
  qty: { color: "#27ae60", fontWeight: 700 },
  removeBtn: {
    background: "rgba(233,69,96,0.08)", color: "#e94560", border: "none",
    borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.85rem", marginLeft: "auto",
  },
  addRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginTop: 8 },
};

const styles: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 24px" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#2d2013" },
  center: { textAlign: "center", padding: 40, color: "#8c6f5a" },
  empty: { textAlign: "center", padding: 60, color: "#b09880", fontSize: "1.1rem" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  menuCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 4px 20px rgba(180,100,60,0.09)",
    border: "1px solid rgba(220,190,160,0.22)",
  },
  menuHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  menuName: { fontWeight: 700, fontSize: "1.1rem", color: "#2d2013" },
  category: { fontSize: "0.8rem", color: "#5a7daf", marginTop: 2 },
  menuActions: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  toggleBtn: {
    background: "rgba(255,248,240,0.9)",
    border: "1px solid rgba(220,190,160,0.35)",
    color: "#8c6f5a",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "rgba(233,69,96,0.08)",
    border: "none",
    color: "#e94560",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
  },
  steps: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
  stepChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,248,240,0.85)",
    borderRadius: 8,
    padding: "6px 12px",
    border: "1px solid rgba(220,190,160,0.2)",
  },
  stepType: { padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700 },
  stepNum: { color: "#8c6f5a", fontSize: "0.8rem" },
  stepDesc: { color: "#2d2013", fontSize: "0.9rem" },
  timeBadge: { color: "#c47f00", fontSize: "0.75rem", background: "rgba(245,158,11,0.10)", padding: "2px 6px", borderRadius: 4 },
  // Form styles
  formRoot: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    padding: 24,
    maxWidth: 640,
    border: "1px solid rgba(220,190,160,0.22)",
    boxShadow: "0 4px 24px rgba(180,100,60,0.10)",
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  formField: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: "0.9rem",
    color: "#8c6f5a",
    marginBottom: 8,
    fontWeight: 600,
  },
  input: {
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid rgba(200,140,100,0.25)",
    borderRadius: 8,
    color: "#2d2013",
    padding: "10px 14px",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
  },
  stepRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  stepNumLabel: { width: 28, textAlign: "center" as const, color: "#5a7daf", fontWeight: 700, flexShrink: 0 },
  subLabel: { fontSize: "0.78rem", color: "#8c6f5a", whiteSpace: "nowrap" as const, flexShrink: 0 },
  removeBtn: {
    background: "rgba(233,69,96,0.08)",
    color: "#e94560",
    border: "none",
    borderRadius: 6,
    padding: "10px 12px",
    cursor: "pointer",
    flexShrink: 0,
  },
  error: {
    background: "rgba(233,69,96,0.08)",
    color: "#e94560",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 8,
    fontSize: "0.9rem",
    border: "1px solid rgba(233,69,96,0.2)",
  },
};
