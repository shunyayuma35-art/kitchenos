from typing import Dict, List
from fastapi import WebSocket
import json


class ConnectionManager:
    """
    WebSocket接続をステーション種別で管理する。
    station_type: "cooking" | "plating" | "prep" | "admin" | "table"
    """

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "cooking": [],
            "plating": [],
            "prep": [],
            "admin": [],
            "table": [],   # 客席・カウンタータブレット
        }

    async def connect(self, websocket: WebSocket, station_type: str):
        await websocket.accept()
        if station_type not in self.active_connections:
            self.active_connections[station_type] = []
        self.active_connections[station_type].append(websocket)

    def disconnect(self, websocket: WebSocket, station_type: str):
        if station_type in self.active_connections:
            try:
                self.active_connections[station_type].remove(websocket)
            except ValueError:
                pass

    async def send_to_station(self, station_type: str, message: dict):
        dead = []
        for ws in self.active_connections.get(station_type, []):
            try:
                await ws.send_text(json.dumps(message, ensure_ascii=False, default=str))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, station_type)

    async def broadcast(self, message: dict, stations: List[str] = None):
        targets = stations if stations else list(self.active_connections.keys())
        for station in targets:
            await self.send_to_station(station, message)

    async def broadcast_order_created(self, order: dict):
        """新規注文 → 調理/盛付/仕込み/管理/客席タブレットへ配信"""
        await self.broadcast(
            {"type": "order_created", "data": order},
            stations=["cooking", "plating", "prep", "admin", "table"],
        )

    async def broadcast_task_updated(self, task: dict, station_type: str = None):
        msg = {"type": "task_updated", "data": task}
        if station_type:
            await self.send_to_station(station_type, msg)
            await self.send_to_station("admin", msg)
        else:
            await self.broadcast(msg)

    async def broadcast_task_completed(self, log: dict):
        await self.broadcast({"type": "task_completed", "data": log})

    async def broadcast_order_ready(self, order_ready: dict):
        """
        全タスク完了 → 全ステーション＋客席タブレットへ通知。
        order_ready: { order_id, table_number, menu_items: [str] }
        """
        await self.broadcast(
            {"type": "order_ready", "data": order_ready},
            stations=["cooking", "plating", "prep", "admin", "table"],
        )

    async def broadcast_prep_updated(self, prep: dict):
        await self.broadcast(
            {"type": "prep_updated", "data": prep},
            stations=["prep", "admin"],
        )

    async def broadcast_step_completed(self, history: dict):
        """調理ステップ完了 → 全ステーションへ通知（調理履歴更新用）"""
        await self.broadcast(
            {"type": "step_completed", "data": history},
            stations=["cooking", "plating", "prep", "admin"],
        )

    async def broadcast_main_completed(self, data: dict):
        """メイン料理（調理）完成 → 盛付・管理へアラート
        data: { order_id, table_number, menu_name, staff_id, completed_at }
        """
        await self.broadcast(
            {"type": "main_completed", "data": data},
            stations=["plating", "admin"],
        )

    async def broadcast_timing_updated(self, data: dict):
        """AI予測タイミング更新 → 全調理ステーション + 管理へ配信
        data: TimingPredictionResponse dict
        """
        await self.broadcast(
            {"type": "timing_updated", "data": data},
            stations=["cooking", "plating", "prep", "admin"],
        )

    async def broadcast_station_alert(self, data: dict, targets: list = None):
        """ステーション間アラート（メイン完成でサイド開始など）
        data: { order_id, table_number, message, targets, urgency }
        targets: ["cooking","plating","prep","admin"] のサブセット
        """
        stations = targets if targets else ["cooking", "plating", "prep", "admin"]
        await self.broadcast(
            {"type": "station_alert", "data": data},
            stations=stations,
        )

    async def broadcast_tasks_now_updated(self, data: dict):
        """「今やるべきこと」リスト更新 → 全ステーションへ配信"""
        await self.broadcast(
            {"type": "tasks_now_updated", "data": data},
            stations=["cooking", "plating", "prep", "admin"],
        )

    async def broadcast_inventory_updated(self, data: dict):
        """在庫変動リアルタイム通知 → 管理・仕込みへ配信
        data: { ingredient_id, name, category, current_stock, unit,
                min_stock_alert, is_low, change_amount, reason }
        """
        await self.broadcast(
            {"type": "inventory_updated", "data": data},
            stations=["prep", "admin"],
        )


manager = ConnectionManager()
