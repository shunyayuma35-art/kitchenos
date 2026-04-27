import { useState, useEffect, useCallback } from "react";
import type { Order, Language, StationType, Task, WSMessage, OrderReadyData } from "../types";
import { t } from "../i18n/translations";
import { useVoice } from "../hooks/useVoice";
import TaskCard from "./TaskCard";

interface Props {
  station: StationType;
  language: Language;
  staffName: string;
  onOrderReady?: (data: OrderReadyData) => void;
}

const STATION_TASK_TYPE: Record<StationType, string> = {
  cooking: "調理",
  plating: "盛付",
  prep: "仕込み",
  admin: "",  // 全て表示
  table: "",
};

export default function OrderBoard({ station, language, staffName, onOrderReady }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const { notifyTaskComplete } = useVoice(language);

  // StationView側のWebSocketから受け取るメッセージを処理
  const handleMessage = useCallback(
    (msg: WSMessage) => {
      if (msg.type === "order_created") {
        setOrders((prev) => {
          if (prev.some((o) => o.id === msg.data.id)) return prev;
          return [msg.data, ...prev];
        });
      } else if (msg.type === "task_updated") {
        setOrders((prev) =>
          prev.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
              ...item,
              tasks: item.tasks.map((task: Task) =>
                task.id === msg.data.id ? { ...task, ...msg.data } : task
              ),
            })),
          }))
        );
      } else if (msg.type === "task_completed") {
        notifyTaskComplete(msg.data.task_type);
      } else if (msg.type === "order_ready") {
        // 完了した注文をリストから除去
        setOrders((prev) => prev.filter((o) => o.id !== msg.data.order_id));
        onOrderReady?.(msg.data);
      }
    },
    [notifyTaskComplete, onOrderReady]
  );

  // OrderBoardは自分のステーション接続を持つ（StationViewとは別）
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const stationWS = station === "table" ? "admin" : station;
    const ws = new WebSocket(`${protocol}://${host}/ws/${stationWS}`);
    let pingInterval: ReturnType<typeof setInterval>;

    ws.onopen = () => {
      setConnected(true);
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 25000);
    };
    ws.onmessage = (e) => {
      if (e.data === "pong") return;
      try { handleMessage(JSON.parse(e.data)); } catch {}
    };
    ws.onclose = () => { setConnected(false); clearInterval(pingInterval); };
    ws.onerror = () => ws.close();

    return () => { clearInterval(pingInterval); ws.close(); };
  }, [station, handleMessage]);

  useEffect(() => {
    fetch("/api/orders/")
      .then((r) => r.json())
      .then((data: Order[]) => {
        setOrders(data.filter((o) => o.status !== "completed" && o.status !== "cancelled"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const startTask = async (taskId: number) => {
    await fetch(`/api/orders/tasks/${taskId}/start`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_staff: staffName }),
    });
  };

  const completeTask = async (taskId: number, photoUrl?: string) => {
    await fetch(`/api/orders/tasks/${taskId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed_by: staffName, photo_url: photoUrl ?? null }),
    });
  };

  const myTaskType = STATION_TASK_TYPE[station];
  const visibleOrders = orders
    .map((order) => ({
      ...order,
      items: order.items
        .map((item) => ({
          ...item,
          tasks: item.tasks.filter(
            (task) => !myTaskType || task.task_type === myTaskType
          ),
        }))
        .filter((item) => item.tasks.length > 0),
    }))
    .filter((order) => order.items.length > 0);

  const pendingCount = visibleOrders.reduce(
    (acc, o) =>
      acc + o.items.reduce(
        (a, i) => a + i.tasks.filter((task) => task.status !== "completed").length,
        0
      ),
    0
  );

  if (loading) return <div style={styles.center}>{t(language, "loading")}</div>;

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>{t(language, "orders")}</h2>
        <div style={styles.meta}>
          <span style={{ ...styles.dot, background: connected ? "#27ae60" : "#e94560" }} />
          <span style={styles.connLabel}>
            {connected ? t(language, "connected") : t(language, "disconnected")}
          </span>
          {pendingCount > 0 && (
            <span style={styles.countBadge}>{pendingCount}</span>
          )}
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div style={styles.empty}>{t(language, "noOrders")}</div>
      ) : (
        <div style={styles.orderList}>
          {visibleOrders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <span style={styles.tableLabel}>
                  {t(language, "tableLabel")} {order.table_number}
                </span>
                <span style={styles.orderId}>#{order.id}</span>
                <span style={styles.orderTime}>
                  {new Date(order.created_at).toLocaleTimeString(
                    language === "ja" ? "ja-JP" : language === "ne" ? "ne-NP" : language === "my" ? "my-MM" : language === "vi" ? "vi-VN" : language === "id" ? "id-ID" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </span>
              </div>
              {order.items.map((item) => (
                <div key={item.id} style={styles.itemBlock}>
                  <div style={styles.itemName}>
                    {item.menu_name}
                    {item.quantity > 1 && (
                      <span style={styles.qty}>×{item.quantity}</span>
                    )}
                    {item.note && (
                      <span style={styles.noteTag}>📝 {item.note}</span>
                    )}
                  </div>
                  <div style={styles.taskGrid}>
                    {item.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        menuName={item.menu_name}
                        tableNumber={order.table_number}
                        language={language}
                        onStart={startTask}
                        onComplete={completeTask}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
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
  title: { fontSize: "1.3rem", fontWeight: 700, color: "#2d2013" },
  meta: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: "50%" },
  connLabel: { fontSize: "0.85rem", color: "#8c6f5a" },
  countBadge: {
    background: "#e94560",
    color: "#fff",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  center: { textAlign: "center", padding: 40, color: "#8c6f5a" },
  empty: { textAlign: "center", padding: 60, color: "#b09880", fontSize: "1.1rem" },
  orderList: { display: "flex", flexDirection: "column", gap: 16 },
  orderCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(180,100,60,0.10)",
    border: "1px solid rgba(220,190,160,0.22)",
  },
  orderHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    background: "linear-gradient(135deg, rgba(255,240,220,0.9), rgba(255,230,200,0.8))",
    borderBottom: "1px solid rgba(220,190,160,0.25)",
  },
  tableLabel: { fontWeight: 800, fontSize: "1.1rem", color: "#2d2013", flex: 1 },
  orderId: { color: "#8c6f5a", fontSize: "0.9rem", fontWeight: 600 },
  orderTime: { color: "#b09880", fontSize: "0.9rem" },
  itemBlock: { padding: "12px 16px" },
  itemName: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 700,
    fontSize: "1rem",
    marginBottom: 10,
    color: "#2d2013",
  },
  qty: {
    background: "rgba(124,157,207,0.12)",
    color: "#5a7daf",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  noteTag: { fontSize: "0.85rem", color: "#c47f00" },
  taskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 10,
  },
};
