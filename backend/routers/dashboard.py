"""
ダッシュボード & キッチン混雑可視化 API
- GET /api/dashboard/stats       : 本日の統計（平均調理時間・遅延数・昨日比）
- GET /api/dashboard/station-loads : ステーション別負荷（緑/黄/赤）
"""
from datetime import datetime, timedelta, date
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """本日の厨房統計"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    yesterday_start = today_start - timedelta(days=1)
    yesterday_end = today_start

    # 今日完了したタスク
    today_logs = (
        db.query(models.CompletionLog)
        .filter(models.CompletionLog.end_time >= today_start)
        .all()
    )
    today_count = len(today_logs)
    durations = [l.duration_seconds for l in today_logs if l.duration_seconds]
    avg_duration = int(sum(durations) / len(durations)) if durations else 0

    # 昨日完了したタスク数
    yesterday_count = (
        db.query(models.CompletionLog)
        .filter(
            models.CompletionLog.end_time >= yesterday_start,
            models.CompletionLog.end_time < yesterday_end,
        )
        .count()
    )

    # 遅延タスク: in_progress で 30分以上経過
    threshold = datetime.utcnow() - timedelta(minutes=30)
    delayed_tasks = (
        db.query(models.Task)
        .filter(
            models.Task.status == models.TaskStatus.in_progress,
            models.Task.started_at <= threshold,
        )
        .all()
    )
    delayed_count = len(delayed_tasks)

    # 現在進行中のオーダー数
    active_orders = (
        db.query(models.Order)
        .filter(models.Order.status.in_([models.OrderStatus.pending, models.OrderStatus.in_progress]))
        .count()
    )

    # 今日の注文数
    today_orders = (
        db.query(models.Order)
        .filter(models.Order.created_at >= today_start)
        .count()
    )

    return {
        "today_completed_tasks": today_count,
        "yesterday_completed_tasks": yesterday_count,
        "avg_duration_seconds": avg_duration,
        "delayed_task_count": delayed_count,
        "active_order_count": active_orders,
        "today_order_count": today_orders,
        "delayed_tasks": [
            {
                "task_id": t.id,
                "task_type": t.task_type,
                "menu_name": t.order_item.menu_name if t.order_item else "",
                "table_number": t.order_item.order.table_number if t.order_item and t.order_item.order else "",
                "elapsed_seconds": int((datetime.utcnow() - t.started_at).total_seconds()) if t.started_at else 0,
            }
            for t in delayed_tasks
        ],
    }


@router.get("/station-loads")
def get_station_loads(db: Session = Depends(get_db)):
    """ステーション別負荷状況（リアルタイム）"""
    station_map = {
        "cooking": "調理",
        "plating": "盛付",
        "prep": "仕込み",
    }

    loads = []
    for station_key, task_type in station_map.items():
        # 未完了タスク数
        pending_tasks = (
            db.query(models.Task)
            .filter(
                models.Task.task_type == task_type,
                models.Task.status != models.TaskStatus.completed,
            )
            .all()
        )
        count = len(pending_tasks)

        # 目安合計時間（秒）
        total_est = sum(
            t.estimated_time_seconds for t in pending_tasks if t.estimated_time_seconds
        )

        # 負荷レベル判定
        if count == 0:
            level = "idle"
        elif count <= 3:
            level = "low"
        elif count <= 7:
            level = "medium"
        else:
            level = "high"

        # 遅延タスク数
        threshold = datetime.utcnow() - timedelta(minutes=20)
        delayed = sum(
            1 for t in pending_tasks
            if t.status == models.TaskStatus.in_progress
            and t.started_at
            and t.started_at <= threshold
        )

        loads.append({
            "station": station_key,
            "task_type": task_type,
            "pending_count": count,
            "total_estimated_seconds": total_est,
            "load_level": level,
            "delayed_count": delayed,
        })

    return {"stations": loads, "updated_at": datetime.utcnow().isoformat()}


@router.get("/ingredient-usage")
def get_ingredient_usage(db: Session = Depends(get_db)):
    """本日の食材使用量集計（完了オーダーベース）"""
    today_start = datetime.combine(date.today(), datetime.min.time())

    # 今日完了した注文アイテム
    completed_items = (
        db.query(models.OrderItem)
        .join(models.Order)
        .filter(
            models.Order.status == models.OrderStatus.completed,
            models.Order.updated_at >= today_start,
        )
        .all()
    )

    # メニューごとの注文数集計
    menu_counts: dict[str, int] = {}
    for item in completed_items:
        menu_counts[item.menu_name] = menu_counts.get(item.menu_name, 0) + item.quantity

    # メニューの手順から食材情報を抽出
    import json
    usage: dict[str, float] = {}
    for menu_name, qty in menu_counts.items():
        menu = db.query(models.Menu).filter(models.Menu.name == menu_name).first()
        if not menu:
            continue
        for step in menu.steps:
            if not step.description:
                continue
            try:
                desc = json.loads(step.description)
                text = desc.get("ja", "") if isinstance(desc, dict) else step.description
            except Exception:
                text = step.description
            # 「・材料名\t量」の行を解析
            for line in text.split("\n"):
                line = line.strip()
                if line.startswith("・"):
                    parts = line[1:].split("\t")
                    if len(parts) >= 2:
                        ingredient_name = parts[0].strip()
                        amount_str = parts[1].strip()
                        key = ingredient_name
                        usage[key] = usage.get(key, 0) + qty

    return {
        "date": date.today().isoformat(),
        "menu_counts": [{"menu": k, "count": v} for k, v in menu_counts.items()],
        "ingredient_usage": [{"ingredient": k, "servings": v} for k, v in usage.items()],
    }
