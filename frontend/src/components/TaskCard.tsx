import { useState, useRef, useEffect, useCallback } from "react";
import type { Task, Language } from "../types";
import { t } from "../i18n/translations";
import { MANDATORY_ALLERGENS, RECOMMENDED_ALLERGENS, ALLERGEN_NAMES, type AllergenKey } from "../i18n/allergens";

interface Props {
  task: Task;
  menuName: string;
  tableNumber: string;
  language: Language;
  allergenJson?: string | null;
  onStart: (taskId: number) => void;
  onComplete: (taskId: number, photoUrl?: string) => void;
}

const TYPE_COLOR: Record<string, string> = {
  調理: "#f39c12",
  盛付: "#9b59b6",
  仕込み: "#27ae60",
};
const TYPE_EMOJI: Record<string, string> = {
  調理: "🍳",
  盛付: "🍽️",
  仕込み: "🥬",
};
const TYPE_I18N_KEY: Record<string, "taskCooking" | "taskPlating" | "taskPrep"> = {
  調理: "taskCooking",
  盛付: "taskPlating",
  仕込み: "taskPrep",
};

// ─── 多言語JSON記述の解決 ───────────────────────────────
function resolveDescription(raw: string, lang: Language): string {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return (parsed[lang] as string) || (parsed["ja"] as string) || raw;
    }
  } catch {
    // plain text fallback
  }
  return raw;
}

// ─── 手順テキストを解析して構造化 ───────────────────────
type Block =
  | { kind: "heading"; text: string }
  | { kind: "ingredient"; text: string }
  | { kind: "step"; num: string; text: string }
  | { kind: "note"; text: string }
  | { kind: "plain"; text: string };

function parseDescription(desc: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of desc.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("【") && line.includes("】")) {
      blocks.push({ kind: "heading", text: line.replace(/【|】/g, "") });
    } else if (line.startsWith("・")) {
      blocks.push({ kind: "ingredient", text: line.slice(1) });
    } else if (/^[①-⑯⑰⑱⑲⑳]/.test(line)) {
      const num = line[0];
      blocks.push({ kind: "step", num, text: line.slice(1).trim() });
    } else if (line.startsWith("※") || line.startsWith("＊")) {
      blocks.push({ kind: "note", text: line });
    } else {
      blocks.push({ kind: "plain", text: line });
    }
  }
  return blocks;
}

// ─── レシピ写真ビュー ──────────────────────────────────
function RecipePhoto({ url }: { url: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ marginBottom: 4 }}>
      <img
        src={url}
        alt="レシピ写真"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          maxHeight: expanded ? 400 : 140,
          objectFit: "cover",
          borderRadius: 10,
          border: "1.5px solid rgba(220,190,160,0.35)",
          cursor: "pointer",
          transition: "max-height 0.3s",
          display: "block",
        }}
      />
      <div style={{ fontSize: "0.72rem", color: "#a0a0b0", textAlign: "center" as const, marginTop: 3 }}>
        📷 レシピ写真 {expanded ? "（タップで縮小）" : "（タップで拡大）"}
      </div>
    </div>
  );
}

// ─── 手順ビュー（チェック付き） ───────────────────────
function ProcedureView({ description, color, language, recipeImageUrl }: { description: string; color: string; language: Language; recipeImageUrl?: string | null }) {
  const resolved = resolveDescription(description, language);
  const blocks = parseDescription(resolved);
  const stepCount = blocks.filter((b) => b.kind === "step").length;
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggleStep = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  let stepIndex = 0;

  return (
    <div style={proc.root}>
      {/* レシピ写真 */}
      {recipeImageUrl && <RecipePhoto url={recipeImageUrl} />}

      {/* 進捗バー */}
      {stepCount > 0 && (
        <div style={proc.progressWrap}>
          <div style={proc.progressBar}>
            <div
              style={{
                ...proc.progressFill,
                width: `${(checked.size / stepCount) * 100}%`,
                background: color,
              }}
            />
          </div>
          <span style={{ ...proc.progressLabel, color }}>
            {checked.size} / {stepCount}
          </span>
        </div>
      )}

      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <div key={i} style={{ ...proc.heading, color }}>
              {block.text}
            </div>
          );
        }
        if (block.kind === "ingredient") {
          const parts = block.text.split(/\s{2,}|\t/);
          const name = parts[0] ?? block.text;
          const qty = parts[1] ?? "";
          return (
            <div key={i} style={proc.ingredientRow}>
              <span style={proc.ingredientName}>{name}</span>
              {qty && <span style={proc.ingredientQty}>{qty}</span>}
            </div>
          );
        }
        if (block.kind === "step") {
          const idx = stepIndex++;
          const done = checked.has(idx);
          return (
            <button
              key={i}
              style={{ ...proc.stepRow, ...(done ? proc.stepDone : {}) }}
              onClick={() => toggleStep(idx)}
            >
              <div style={{ ...proc.stepNum, background: done ? "#27ae60" : color }}>
                {done ? "✓" : block.num}
              </div>
              <span style={{ ...proc.stepText, textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}>
                {block.text}
              </span>
            </button>
          );
        }
        if (block.kind === "note") {
          return (
            <div key={i} style={proc.note}>{block.text}</div>
          );
        }
        return (
          <div key={i} style={proc.plain}>{block.text}</div>
        );
      })}
    </div>
  );
}

// ─── カウントダウンタイマー ────────────────────────────
function useCountdown(task: Task, onAutoComplete: () => void) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (task.status !== "in_progress" || !task.estimated_time_seconds || !task.started_at) {
      setRemaining(null);
      return;
    }
    const startMs = new Date(task.started_at).getTime();
    const totalMs = task.estimated_time_seconds * 1000;

    const tick = () => {
      const elapsed = Date.now() - startMs;
      const rem = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      setRemaining(rem);
      if (rem === 0 && task.auto_next) {
        onAutoComplete();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [task.status, task.estimated_time_seconds, task.started_at, task.auto_next, onAutoComplete]);

  return remaining;
}

// ─── チェックリストコンポーネント ──────────────────────
function Checklist({ raw, color, language, onAllChecked }: { raw: string; color: string; language: Language; onAllChecked: () => void }) {
  let items: string[] = [];
  try { items = JSON.parse(raw); } catch { items = [raw]; }

  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      if (next.size === items.length) onAllChecked();
      return next;
    });
  };

  return (
    <div style={chk.root}>
      <div style={{ ...chk.label, color }}>{t(language, "checkAllToComplete")}</div>
      {items.map((item, i) => {
        const done = checked.has(i);
        return (
          <button key={i} style={{ ...chk.row, ...(done ? chk.rowDone : {}) }} onClick={() => toggle(i)}>
            <span style={{ ...chk.box, background: done ? color : "transparent", borderColor: color }}>
              {done && "✓"}
            </span>
            <span style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1, fontSize: "0.9rem", color: "#3d2010" }}>
              {item}
            </span>
          </button>
        );
      })}
      <div style={chk.progress}>
        <div style={{ ...chk.progressFill, width: `${(checked.size / items.length) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── メインコンポーネント ───────────────────────────────
export default function TaskCard({
  task,
  menuName,
  tableNumber,
  language,
  allergenJson,
  onStart,
  onComplete,
}: Props) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAutoComplete = useCallback(() => {
    if (!checklistDone && task.required_checklist) return; // チェックリストが残っている場合は自動完了しない
    onComplete(task.id, photoUrl ?? undefined);
  }, [checklistDone, task.required_checklist, task.id, photoUrl, onComplete]);

  const remaining = useCountdown(task, handleAutoComplete);

  const color = TYPE_COLOR[task.task_type] ?? "#555";
  const emoji = TYPE_EMOJI[task.task_type] ?? "📋";
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";
  const isPlating = task.task_type === "盛付";
  // 盛付・調理・仕込みすべてで写真撮影可能
  const canTakePhoto = isInProgress && (task.task_type === "盛付" || task.task_type === "調理" || task.task_type === "仕込み");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/photo", { method: "POST", body: form });
      if (res.ok) setPhotoUrl((await res.json()).url);
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = () => {
    onComplete(task.id, photoUrl ?? undefined);
  };

  // チェックリストがある場合、全チェック完了まで完了ボタンを無効化
  const hasChecklist = isInProgress && !!task.required_checklist;
  const canComplete = !hasChecklist || checklistDone;

  // タイマー表示用フォーマット
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
  };

  // タイマー警告色
  const timerColor = remaining === null ? color
    : remaining === 0 ? "#e94560"
    : remaining < 30 ? "#f39c12"
    : "#27ae60";

  return (
    <div
      style={{
        ...styles.card,
        borderLeft: `5px solid ${isCompleted ? "#27ae60" : isInProgress ? color : "#333"}`,
        opacity: isCompleted ? 0.65 : 1,
      }}
    >
      {/* ── ヘッダー ── */}
      <div style={styles.header}>
        <span style={{ fontSize: "1.6rem" }}>{emoji}</span>
        <div style={styles.headerInfo}>
          <div style={{ color, fontWeight: 800, fontSize: "1.1rem" }}>
            {TYPE_I18N_KEY[task.task_type] ? t(language, TYPE_I18N_KEY[task.task_type]) : task.task_type}
          </div>
          <div style={styles.menuName}>{menuName}</div>
          <div style={styles.tableBadge}>
            🪑 {t(language, "table")} {tableNumber}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <StatusBadge status={task.status} language={language} />
          {task.assigned_staff && (
            <span style={styles.staffTag}>👤 {task.assigned_staff}</span>
          )}
        </div>
      </div>

      {/* ── アレルゲン警告 ── */}
      <AllergenStrip allergenJson={allergenJson} taskType={task.task_type} />

      {/* ── カウントダウンタイマー ── */}
      {isInProgress && remaining !== null && (
        <div style={{ ...styles.timerBar, borderColor: timerColor }}>
          <span style={{ color: timerColor, fontWeight: 800, fontSize: "1.1rem" }}>
            ⏱ {remaining === 0 ? "0:00" : formatTime(remaining)}
          </span>
          <span style={{ color: "#a0a0b0", fontSize: "0.8rem" }}>
            {remaining === 0 ? t(language, "autoComplete") : t(language, "timerRemaining")}
          </span>
          {task.estimated_time_seconds && (
            <div style={styles.timerTrack}>
              <div style={{
                ...styles.timerFill,
                width: `${Math.max(0, (remaining / task.estimated_time_seconds) * 100)}%`,
                background: timerColor,
              }} />
            </div>
          )}
        </div>
      )}

      {/* ── 手順トグル ── */}
      {task.description && (
        <button
          style={{ ...styles.toggleBtn, borderColor: color, color }}
          onClick={() => setShowProcedure((v) => !v)}
        >
          {showProcedure ? t(language, "hideProcedure") : t(language, "showProcedure")}
        </button>
      )}

      {showProcedure && task.description && (
        <ProcedureView
          description={task.description}
          color={color}
          language={language}
          recipeImageUrl={task.image_url}
        />
      )}

      {/* ── チェックリスト（作業中のみ） ── */}
      {hasChecklist && (
        <Checklist
          raw={task.required_checklist!}
          color={color}
          language={language}
          onAllChecked={() => setChecklistDone(true)}
        />
      )}

      {/* ── 写真プレビュー ── */}
      {photoPreview && (
        <div style={styles.photoWrap}>
          <img src={photoPreview} alt="盛付写真" style={styles.photoImg} />
          {uploading && <div style={styles.photoLabel}>アップロード中...</div>}
          {photoUrl && !isCompleted && <div style={{ ...styles.photoLabel, background: "#9b59b6cc" }}>{t(language, "photoDone")}</div>}
          {photoUrl && isCompleted && <div style={{ ...styles.photoLabel, background: "#27ae60cc" }}>{t(language, "photoSaved")}</div>}
          {!isCompleted && (
            <button style={styles.removeBtn} onClick={() => { setPhotoPreview(null); setPhotoUrl(null); }}>✕</button>
          )}
        </div>
      )}

      {/* ── アクションボタン ── */}
      {!isCompleted && (
        <div style={styles.actions}>
          {!isInProgress && (
            <button
              style={{ ...styles.actionBtn, background: color + "22", color, border: `2px solid ${color}` }}
              onClick={() => { onStart(task.id); setShowProcedure(true); }}
            >
              ▶ {t(language, "start")}
            </button>
          )}
          {isInProgress && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
              {canTakePhoto && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment"
                    style={{ display: "none" }} onChange={handleFileChange} />
                  <button
                    style={{ ...styles.photoBtn, ...(photoUrl ? styles.photoBtnDone : {}) }}
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <span style={{ fontSize: "1.5rem" }}>
                      {isPlating ? "📸" : task.task_type === "調理" ? "🍳" : "🥬"}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {uploading ? t(language, "uploading") : photoUrl ? t(language, "retakePhoto") : t(language, "takePhoto")}
                    </span>
                  </button>
                </>
              )}
              <button
                style={{ ...styles.completeBtn, opacity: canComplete ? 1 : 0.4, cursor: canComplete ? "pointer" : "not-allowed" }}
                onClick={handleComplete}
                disabled={uploading || !canComplete}
              >
                ✓ {t(language, "complete")}
              </button>
            </div>
          )}
        </div>
      )}

      {isCompleted && task.completed_by && (
        <div style={styles.completedInfo}>✓ {task.completed_by}</div>
      )}
    </div>
  );
}

// ─── アレルゲン警告ストリップ ────────────────────────────────
function AllergenStrip({ allergenJson, taskType }: { allergenJson: string | null | undefined; taskType: string }) {
  if (!allergenJson) return null;
  let map: Record<string, boolean | null>;
  try { map = JSON.parse(allergenJson); } catch { return null; }

  const mandatoryPresent = MANDATORY_ALLERGENS.filter((k) => map[k] === true);
  const recommendedPresent = RECOMMENDED_ALLERGENS.filter((k) => map[k] === true);
  if (mandatoryPresent.length === 0 && recommendedPresent.length === 0) return null;

  const label = taskType === "盛付" ? "盛付時アレルゲン確認" : taskType === "仕込み" ? "仕込み時アレルゲン注意" : "調理時アレルゲン注意";

  return (
    <div style={{
      background: "rgba(192,57,43,0.07)",
      border: "1.5px solid rgba(192,57,43,0.25)",
      borderRadius: 10,
      padding: "8px 12px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 6,
    }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#c0392b", letterSpacing: "0.02em" }}>
        🥜 {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
        {mandatoryPresent.map((k) => (
          <span key={k} style={{
            fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, fontWeight: 700,
            background: "rgba(192,57,43,0.14)", color: "#c0392b",
            border: "1px solid rgba(192,57,43,0.3)",
          }}>
            {ALLERGEN_NAMES[k as AllergenKey]?.ja ?? k}
          </span>
        ))}
        {recommendedPresent.map((k) => (
          <span key={k} style={{
            fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, fontWeight: 600,
            background: "rgba(214,137,16,0.12)", color: "#d68910",
            border: "1px solid rgba(214,137,16,0.28)",
          }}>
            {ALLERGEN_NAMES[k as AllergenKey]?.ja ?? k}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, language }: { status: string; language: Language }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:     { label: t(language, "pending"),    cls: "badge badge-pending" },
    in_progress: { label: t(language, "inProgress"), cls: "badge badge-progress" },
    completed:   { label: t(language, "completed"),  cls: "badge badge-completed" },
  };
  const item = map[status] ?? map.pending;
  return <span className={item.cls}>{item.label}</span>;
}

// ─── スタイル: カード ────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 14,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 4px 24px rgba(180,100,60,0.10)",
    border: "1px solid rgba(220,190,160,0.22)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  headerInfo: { flex: 1 },
  menuName: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#2d2013",
    marginTop: 2,
  },
  tableBadge: {
    fontSize: "0.85rem",
    color: "#8c6f5a",
    marginTop: 4,
  },
  staffTag: {
    fontSize: "0.8rem",
    color: "#5a7daf",
  },
  toggleBtn: {
    background: "transparent",
    border: "1px dashed",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
  },
  actions: { display: "flex", gap: 10 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    padding: "14px",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "center" as const,
  },
  photoBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    width: "100%", background: "rgba(155,89,182,0.08)", color: "#9b59b6",
    border: "2px dashed #9b59b6", borderRadius: 12, padding: "14px", cursor: "pointer",
    fontSize: "1rem",
  },
  photoBtnDone: { background: "rgba(155,89,182,0.18)", border: "2px solid #9b59b6" },
  completeBtn: {
    width: "100%", background: "linear-gradient(135deg, #27ae60, #1e9e52)", color: "#fff",
    border: "none", borderRadius: 12, padding: "16px",
    fontSize: "1.15rem", fontWeight: 800, cursor: "pointer",
    boxShadow: "0 4px 16px rgba(39,174,96,0.30)",
  },
  photoWrap: {
    position: "relative" as const, borderRadius: 10,
    overflow: "hidden", border: "2px solid #9b59b6",
  },
  photoImg: { width: "100%", maxHeight: 200, objectFit: "cover" as const, display: "block" },
  photoLabel: {
    position: "absolute" as const, bottom: 8, left: 8,
    background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.8rem",
    padding: "4px 10px", borderRadius: 6,
  },
  removeBtn: {
    position: "absolute" as const, top: 6, right: 6,
    background: "rgba(0,0,0,0.45)", color: "#fff", border: "none",
    borderRadius: "50%", width: 28, height: 28,
    cursor: "pointer", fontSize: "0.85rem",
  },
  completedInfo: { fontSize: "0.85rem", color: "#27ae60", textAlign: "right" as const },
  timerBar: {
    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const,
    background: "rgba(255,248,240,0.9)", borderRadius: 10, padding: "10px 14px",
    border: "1.5px solid",
  },
  timerTrack: {
    flex: 1, minWidth: 60, height: 6, background: "rgba(220,190,160,0.25)", borderRadius: 99, overflow: "hidden",
  },
  timerFill: {
    height: "100%", borderRadius: 99, transition: "width 1s linear",
  },
};

// ─── スタイル: 手順ビュー ────────────────────────────────
const proc: Record<string, React.CSSProperties> = {
  root: {
    background: "rgba(255,248,240,0.85)",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    border: "1px solid rgba(220,190,160,0.2)",
  },
  progressWrap: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
  },
  progressBar: {
    flex: 1, height: 8, background: "rgba(220,190,160,0.25)", borderRadius: 99, overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 99, transition: "width 0.3s",
  },
  progressLabel: {
    fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
  },
  heading: {
    fontWeight: 800, fontSize: "0.95rem",
    borderBottom: "1px solid rgba(220,190,160,0.3)",
    paddingBottom: 6, marginTop: 10, marginBottom: 4,
  },
  ingredientRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(255,245,230,0.8)", borderRadius: 8,
    padding: "8px 12px",
    border: "1px solid rgba(220,190,160,0.15)",
  },
  ingredientName: { fontSize: "0.95rem", color: "#2d2013", fontWeight: 500 },
  ingredientQty: {
    fontSize: "0.95rem", color: "#c47f00", fontWeight: 700,
    background: "rgba(245,158,11,0.12)", padding: "2px 10px", borderRadius: 6,
  },
  stepRow: {
    display: "flex", alignItems: "flex-start", gap: 10,
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(220,190,160,0.22)",
    borderRadius: 10, padding: "10px 12px",
    cursor: "pointer", textAlign: "left" as const, width: "100%",
    transition: "background 0.15s",
  },
  stepDone: { background: "rgba(39,174,96,0.07)", borderColor: "rgba(39,174,96,0.3)" },
  stepNum: {
    minWidth: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0,
  },
  stepText: { fontSize: "0.95rem", color: "#3d2010", lineHeight: 1.7, flex: 1 },
  note: {
    fontSize: "0.85rem", color: "#b45309",
    background: "rgba(251,191,36,0.10)", borderRadius: 6,
    padding: "6px 10px",
    border: "1px solid rgba(245,158,11,0.18)",
  },
  plain: { fontSize: "0.9rem", color: "#8c6f5a", paddingLeft: 4 },
};

// ─── スタイル: チェックリスト ────────────────────────────
const chk: Record<string, React.CSSProperties> = {
  root: {
    background: "rgba(255,248,240,0.85)", borderRadius: 10, padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: 8,
    border: "1px solid rgba(220,190,160,0.2)",
  },
  label: { fontSize: "0.8rem", fontWeight: 700, marginBottom: 4 },
  row: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(220,190,160,0.22)",
    borderRadius: 8, padding: "8px 10px",
    cursor: "pointer", textAlign: "left" as const, width: "100%",
    transition: "background 0.15s",
  },
  rowDone: { background: "rgba(39,174,96,0.07)", borderColor: "rgba(39,174,96,0.3)" },
  box: {
    width: 22, height: 22, borderRadius: 6, border: "2px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, fontSize: "0.8rem", fontWeight: 800, color: "#fff",
    transition: "background 0.15s",
  },
  progress: {
    height: 4, background: "rgba(220,190,160,0.25)", borderRadius: 99, overflow: "hidden",
    marginTop: 4,
  },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.3s" },
};
