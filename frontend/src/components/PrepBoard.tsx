import { useState, useEffect, useCallback } from "react";
import type { PrepWork, PrepTask, Language, WSMessage } from "../types";
import { t } from "../i18n/translations";
import { useVoice } from "../hooks/useVoice";
import { useWebSocket } from "../hooks/useWebSocket";

interface Props {
  language: Language;
  staffName: string;
}

export default function PrepBoard({ language, staffName }: Props) {
  const [prepWorks, setPrepWorks] = useState<PrepWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { notifyTaskComplete } = useVoice(language);

  const today = new Date().toISOString().slice(0, 10);

  const fetchPrep = useCallback(() => {
    fetch(`/api/prep/?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        setPrepWorks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [today]);

  useEffect(() => { fetchPrep(); }, [fetchPrep]);

  // WebSocket: receive real-time prep updates
  const handleWSMessage = useCallback((msg: WSMessage) => {
    if (msg.type === "prep_updated") {
      setPrepWorks((prev) => {
        const exists = prev.find((pw) => pw.id === msg.data.id);
        if (exists) {
          return prev.map((pw) => pw.id === msg.data.id ? msg.data : pw);
        }
        return msg.data.date === today ? [...prev, msg.data] : prev;
      });
    }
  }, [today]);

  useWebSocket("prep", handleWSMessage);

  const startTask = async (taskId: number) => {
    const res = await fetch(`/api/prep/tasks/${taskId}/start`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_staff: staffName }),
    });
    if (res.ok) {
      const updated: PrepTask = await res.json();
      setPrepWorks((prev) =>
        prev.map((pw) => ({
          ...pw,
          tasks: pw.tasks.map((t) => (t.id === updated.id ? updated : t)),
        }))
      );
    }
  };

  const completeTask = async (prepWorkId: number, taskId: number) => {
    const res = await fetch(`/api/prep/tasks/${taskId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed_by: staffName }),
    });
    if (res.ok) {
      const updated: PrepTask = await res.json();
      notifyTaskComplete("仕込み");
      setPrepWorks((prev) =>
        prev.map((pw) => {
          if (pw.id !== prepWorkId) return pw;
          const newTasks = pw.tasks.map((t) =>
            t.id === updated.id ? updated : t
          );
          const allDone = newTasks.every((t) => t.status === "completed");
          return { ...pw, tasks: newTasks, status: allDone ? "completed" : pw.status };
        })
      );
    }
  };

  const addPrepWork = async (data: { name: string; steps: string[] }) => {
    const payload = {
      name: data.name,
      date: today,
      priority: 0,
      tasks: data.steps.map((s, i) => ({ step: i + 1, description: s })),
    };
    const res = await fetch("/api/prep/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created: PrepWork = await res.json();
      setPrepWorks((prev) => [...prev, created]);
      setShowForm(false);
    }
  };

  if (loading) {
    return <div style={styles.center}>読み込み中...</div>;
  }

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>{t(language, "prepWork")}</h2>
        <button className="btn-primary btn-small" onClick={() => setShowForm(true)}>
          + {t(language, "createPrep")}
        </button>
      </div>

      {showForm && (
        <PrepForm
          language={language}
          onSubmit={addPrepWork}
          onCancel={() => setShowForm(false)}
        />
      )}

      {prepWorks.length === 0 && !showForm ? (
        <div style={styles.empty}>{t(language, "noPrep")}</div>
      ) : (
        <div style={styles.list}>
          {prepWorks.map((pw) => (
            <PrepWorkCard
              key={pw.id}
              prepWork={pw}
              language={language}
              onStart={(taskId) => startTask(taskId)}
              onComplete={(taskId) => completeTask(pw.id, taskId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PrepWorkCard({
  prepWork,
  language,
  onStart,
  onComplete,
}: {
  prepWork: PrepWork;
  language: Language;
  onStart: (taskId: number) => void;
  onComplete: (taskId: number) => void;
}) {
  const done = prepWork.tasks.filter((t) => t.status === "completed").length;
  const total = prepWork.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = prepWork.status === "completed" || done === total;

  return (
    <div
      style={{
        ...styles.pwCard,
        borderLeft: `5px solid ${allDone ? "#27ae60" : "#27ae6066"}`,
        opacity: allDone ? 0.7 : 1,
      }}
    >
      <div style={styles.pwHeader}>
        <span style={styles.pwName}>🥬 {prepWork.name}</span>
        <span style={styles.pwProgress}>
          {done}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${pct}%`,
            background: allDone ? "#27ae60" : "#f39c12",
          }}
        />
      </div>

      <div style={styles.taskList}>
        {prepWork.tasks.map((task) => (
          <PrepTaskRow
            key={task.id}
            task={task}
            language={language}
            onStart={() => onStart(task.id)}
            onComplete={() => onComplete(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PrepTaskRow({
  task,
  language,
  onStart,
  onComplete,
}: {
  task: PrepTask;
  language: Language;
  onStart: () => void;
  onComplete: () => void;
}) {
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";

  return (
    <div
      style={{
        ...styles.taskRow,
        opacity: isCompleted ? 0.5 : 1,
        textDecoration: isCompleted ? "line-through" : "none",
      }}
    >
      <span style={styles.stepNum}>{task.step}</span>
      <span style={styles.taskDesc}>{task.description}</span>
      {task.assigned_staff && !isCompleted && (
        <span style={styles.staffTag}>👤 {task.assigned_staff}</span>
      )}
      {!isCompleted && !isInProgress && (
        <button className="btn-start btn-small" onClick={onStart}>
          {t(language, "start")}
        </button>
      )}
      {isInProgress && (
        <button className="btn-success btn-small" onClick={onComplete}>
          ✓ {t(language, "complete")}
        </button>
      )}
      {isCompleted && <span style={styles.checkMark}>✓</span>}
    </div>
  );
}

function PrepForm({
  language,
  onSubmit,
  onCancel,
}: {
  language: Language;
  onSubmit: (data: { name: string; steps: string[] }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState(["", "", ""]);

  const addStep = () => setSteps([...steps, ""]);
  const updateStep = (i: number, v: string) => {
    const s = [...steps];
    s[i] = v;
    setSteps(s);
  };
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    const validSteps = steps.filter((s) => s.trim());
    if (!name.trim() || validSteps.length === 0) return;
    onSubmit({ name: name.trim(), steps: validSteps });
  };

  return (
    <div style={styles.form}>
      <h3 style={styles.formTitle}>{t(language, "createPrep")}</h3>
      <input
        placeholder={t(language, "name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.formInput}
      />
      <div style={{ marginBottom: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={styles.stepRow}>
            <span style={styles.stepNum2}>{i + 1}</span>
            <input
              placeholder={`${t(language, "step")} ${i + 1}`}
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
              style={{ ...styles.formInput, margin: 0, flex: 1 }}
            />
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(i)}
                style={styles.removeBtn}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="btn-secondary btn-small" onClick={addStep} style={{ marginBottom: 12 }}>
        + {t(language, "addStep")}
      </button>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
          {t(language, "submit")}
        </button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
          {t(language, "cancel")}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { padding: "0 0 24px" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#eaeaea" },
  center: { textAlign: "center", padding: 40, color: "#a0a0b0" },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#555570",
    fontSize: "1.1rem",
  },
  list: { display: "flex", flexDirection: "column", gap: 16 },
  pwCard: {
    background: "#1a1a2e",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  pwHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 10,
  },
  pwName: { flex: 1, fontWeight: 700, fontSize: "1.1rem", color: "#eaeaea" },
  pwProgress: {
    background: "#16213e",
    color: "#7fb3ff",
    padding: "4px 12px",
    borderRadius: 8,
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  progressBar: {
    height: 6,
    background: "#16213e",
    borderRadius: 3,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.4s ease",
  },
  taskList: { display: "flex", flexDirection: "column", gap: 8 },
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#16213e",
    borderRadius: 8,
    padding: "10px 14px",
    transition: "opacity 0.3s",
  },
  stepNum: {
    width: 26,
    height: 26,
    background: "#0f3460",
    color: "#7fb3ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  taskDesc: { flex: 1, fontSize: "0.95rem", color: "#eaeaea" },
  staffTag: { fontSize: "0.8rem", color: "#7fb3ff" },
  checkMark: { color: "#27ae60", fontWeight: 700, fontSize: "1.1rem" },
  form: {
    background: "#1a1a2e",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    border: "2px solid #e94560",
  },
  formTitle: {
    fontWeight: 700,
    marginBottom: 14,
    color: "#eaeaea",
  },
  formInput: {
    width: "100%",
    padding: "10px 14px",
    background: "#16213e",
    border: "2px solid #0f3460",
    borderRadius: 8,
    color: "#eaeaea",
    fontSize: "0.95rem",
    marginBottom: 10,
    outline: "none",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  stepNum2: {
    width: 28,
    textAlign: "center",
    color: "#7fb3ff",
    fontWeight: 700,
    flexShrink: 0,
  },
  removeBtn: {
    background: "#e9456033",
    color: "#e94560",
    border: "none",
    borderRadius: 6,
    padding: "8px 10px",
    cursor: "pointer",
    flexShrink: 0,
  },
};
