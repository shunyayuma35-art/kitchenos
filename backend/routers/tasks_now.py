"""
「今やるべきこと」AI生成ルーター
- GET  /api/tasks/now              : 全ステーション向け今やるべきタスク一覧
- GET  /api/tasks/now/{station}    : ステーション別フィルタ
- POST /api/tasks/now/refresh      : 手動リフレッシュ + WS配信

AIロジック:
1. 全未完了タスクに優先スコアを付ける
   - 経過時間超過（遅延）: +50点
   - 温度危険（調理後10分以上): +40点
   - テーブル待ち時間長い: +最大30点
   - 注文優先度: +最大20点
   - ステップ順（前のステップが完了した直後): +15点
2. スタッフ推奨: 速度プロファイルから最適な担当者を割り当て
3. サイドメニューアラート: メイン料理完成直後はサイドに自動+60点
4. キャッシュに保存してWebSocket配信
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict
import json

from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db
from websocket_manager import manager

router = APIRouter(prefix="/api/tasks", tags=["tasks_now"])

# ── 定数 ───────────────────────────────────────────────────
TEMP_DANGER_SECONDS = 600          # 10分 → 冷める危険
DELAY_THRESHOLD_RATIO = 1.3        # 推定時間×1.3超 → 遅延
MAX_TABLE_WAIT_SECONDS = 1800      # 30分以上は最高優先
SIDE_DISH_ALERT_WINDOW = 120       # メイン完成後120秒以内はサイドアラート
DEFAULT_TASK_SECONDS = 300


def _get_staff_speed_ratio(db: Session, staff_id: str, station: str) -> float:
    if not staff_id:
        return 1.0
    profile = db.query(models.StaffSpeedProfile).filter(
        models.StaffSpeedProfile.staff_id == staff_id,
        models.StaffSpeedProfile.station == station,
    ).first()
    return profile.speed_ratio if profile else 1.0


def _best_staff_for_station(db: Session, station: str) -> Optional[str]:
    """速度プロファイルで最速かつサンプル3件以上のスタッフ"""
    p = db.query(models.StaffSpeedProfile).filter(
        models.StaffSpeedProfile.station == station,
        models.StaffSpeedProfile.sample_count >= 3,
    ).order_by(models.StaffSpeedProfile.speed_ratio.asc()).first()
    return p.staff_id if p else None


def _station_avg_seconds(db: Session, station: str) -> float:
    avg = db.query(func.avg(models.CookingHistory.duration_seconds)).filter(
        models.CookingHistory.station == station,
        models.CookingHistory.duration_seconds.isnot(None),
    ).scalar()
    return float(avg) if avg else DEFAULT_TASK_SECONDS


def _build_task_now(
    db: Session,
    task: models.Task,
    order: models.Order,
    menu_name: str,
    station_avgs: Dict[str, float],
    now: datetime,
) -> schemas.TaskNowItem:
    station = task.assigned_station or "cooking"
    base_seconds = task.estimated_time_seconds or station_avgs.get(station, DEFAULT_TASK_SECONDS)

    # 経過時間
    if task.started_at:
        elapsed = int((now - task.started_at).total_seconds())
    elif task.status == "pending":
        # オーダー作成からの待機時間をマイナス経過として扱う
        elapsed = 0
    else:
        elapsed = 0

    # 残り予測
    remaining = max(0, int(base_seconds) - elapsed)

    # 遅延判定
    is_delayed = (task.status == "in_progress" and elapsed > base_seconds * DELAY_THRESHOLD_RATIO)
    delay_seconds = max(0, elapsed - int(base_seconds)) if is_delayed else 0

    # 温度危険: 同注文アイテムの調理タスクが完了してから長時間経過
    temp_danger = False
    if task.task_type in ("盛付", "plating"):
        cooking_tasks = [
            t for t in task.order_item.tasks
            if t.task_type == "調理" and t.status == "completed" and t.completed_at
        ]
        if cooking_tasks:
            last_cook = max(t.completed_at for t in cooking_tasks)
            if (now - last_cook).total_seconds() >= TEMP_DANGER_SECONDS:
                temp_danger = True

    # サイドアラート: 同注文内で調理完了直後かどうか
    side_dish_alert = False
    if task.task_type in ("調理", "cooking"):
        sibling_cooking = [
            t for item in order.items for t in item.tasks
            if t.task_type == "調理" and t.status == "completed" and t.completed_at
        ]
        if sibling_cooking:
            most_recent = max(t.completed_at for t in sibling_cooking)
            if (now - most_recent).total_seconds() <= SIDE_DISH_ALERT_WINDOW:
                side_dish_alert = True

    # ─── 優先スコア計算 ────────────────────────────────────
    score = 0.0

    # 遅延ペナルティ
    if is_delayed:
        score += 50.0 + min(delay_seconds / 60.0, 30.0)  # 最大+80

    # 温度危険
    if temp_danger:
        score += 40.0

    # サイドアラート
    if side_dish_alert:
        score += 60.0

    # テーブル待ち時間
    wait_seconds = (now - order.created_at).total_seconds()
    score += min(wait_seconds / MAX_TABLE_WAIT_SECONDS * 30.0, 30.0)

    # 注文優先度
    score += min(order.priority * 5.0, 20.0)

    # ステップ順（直前ステップが完了している場合ボーナス）
    prev_step = task.step - 1
    if prev_step > 0:
        prev_task = next(
            (t for t in task.order_item.tasks if t.step == prev_step and t.status == "completed"),
            None,
        )
        if prev_task:
            score += 15.0

    # ステータス補正: in_progress は pending より高スコア
    if task.status == "in_progress":
        score += 10.0

    # ─── ラベル ────────────────────────────────────────────
    if score >= 70:
        label = "🔴 緊急"
        action = "今すぐ開始"
    elif score >= 40:
        label = "🟠 要注意"
        action = "間もなく"
    else:
        label = "🟢 通常"
        action = "準備"

    return schemas.TaskNowItem(
        task_id=task.id,
        order_id=order.id,
        order_item_id=task.order_item_id,
        table_number=order.table_number,
        menu_name=menu_name,
        step=task.step,
        task_type=task.task_type,
        station=station,
        status=task.status,
        priority_score=round(score, 1),
        priority_label=label,
        estimated_remaining_seconds=remaining,
        elapsed_seconds=elapsed,
        is_delayed=is_delayed,
        delay_seconds=delay_seconds,
        temperature_danger=temp_danger,
        assigned_staff=task.assigned_staff,
        recommended_staff=_best_staff_for_station(db, station),
        action=action,
        side_dish_alert=side_dish_alert,
    )


def _generate_tasks_now(db: Session) -> schemas.TasksNowResponse:
    now = datetime.utcnow()

    # ステーション平均を一括取得
    station_avgs = {}
    for st in ["cooking", "plating", "prep"]:
        station_avgs[st] = _station_avg_seconds(db, st)

    # アクティブな注文のみ対象
    active_orders = db.query(models.Order).filter(
        models.Order.status.in_(["pending", "in_progress"])
    ).order_by(models.Order.priority.desc(), models.Order.created_at.asc()).all()

    all_tasks: List[schemas.TaskNowItem] = []
    alerts: List[str] = []

    for order in active_orders:
        for item in order.items:
            for task in item.tasks:
                if task.status == "completed":
                    continue
                task_now = _build_task_now(db, task, order, item.menu_name, station_avgs, now)
                all_tasks.append(task_now)

    # スコア降順でソート
    all_tasks.sort(key=lambda t: t.priority_score, reverse=True)

    # ステーション別グルーピング
    by_station: Dict[str, List[dict]] = defaultdict(list)
    for task in all_tasks:
        by_station[task.station].append(task.model_dump())

    # サマリーカウント
    urgent = sum(1 for t in all_tasks if t.priority_score >= 70)
    warning = sum(1 for t in all_tasks if 40 <= t.priority_score < 70)
    normal = sum(1 for t in all_tasks if t.priority_score < 40)

    # 全体アラートメッセージ生成
    delayed = [t for t in all_tasks if t.is_delayed]
    temp_danger_tasks = [t for t in all_tasks if t.temperature_danger]

    if delayed:
        alerts.append(f"⚠️ {len(delayed)}件の遅延タスクがあります")
    if temp_danger_tasks:
        alerts.append(f"🌡️ {len(temp_danger_tasks)}件の料理が冷める危険があります")
    if urgent > 0:
        alerts.append(f"🔴 緊急タスク {urgent}件 — 即対応してください")

    response = schemas.TasksNowResponse(
        generated_at=now.isoformat(),
        total_urgent=urgent,
        total_warning=warning,
        total_normal=normal,
        by_station=dict(by_station),
        all_tasks=all_tasks,
        alerts=alerts,
    )

    # キャッシュ保存（ステーション別）
    for station, task_list in by_station.items():
        cache = db.query(models.TasksNowCache).filter(
            models.TasksNowCache.station == station
        ).first()
        if cache:
            cache.task_list = json.dumps(task_list, ensure_ascii=False, default=str)
            cache.updated_at = now
        else:
            db.add(models.TasksNowCache(
                station=station,
                task_list=json.dumps(task_list, ensure_ascii=False, default=str),
                generated_at=now,
            ))

    # 全ステーション用 "all" キャッシュ
    all_cache = db.query(models.TasksNowCache).filter(
        models.TasksNowCache.station == "all"
    ).first()
    all_data = [t.model_dump() for t in all_tasks]
    if all_cache:
        all_cache.task_list = json.dumps(all_data, ensure_ascii=False, default=str)
        all_cache.updated_at = now
    else:
        db.add(models.TasksNowCache(
            station="all",
            task_list=json.dumps(all_data, ensure_ascii=False, default=str),
            generated_at=now,
        ))

    db.commit()
    return response


# ── GET /api/tasks/now ────────────────────────────────────
@router.get("/now", response_model=schemas.TasksNowResponse)
async def get_tasks_now(
    station: Optional[str] = Query(None, description="cooking/plating/prep/admin"),
    db: Session = Depends(get_db),
):
    """今やるべきタスク一覧を返す（AIスコアリング）"""
    result = _generate_tasks_now(db)

    if station and station != "admin":
        # ステーションフィルタ
        filtered = [t for t in result.all_tasks if t.station == station]
        result.all_tasks = filtered
        result.by_station = {station: [t.model_dump() for t in filtered]}
        result.total_urgent = sum(1 for t in filtered if t.priority_score >= 70)
        result.total_warning = sum(1 for t in filtered if 40 <= t.priority_score < 70)
        result.total_normal = sum(1 for t in filtered if t.priority_score < 40)

    return result


# ── GET /api/tasks/now/{station} ──────────────────────────
@router.get("/now/{station}", response_model=schemas.TasksNowResponse)
async def get_tasks_now_by_station(
    station: str,
    db: Session = Depends(get_db),
):
    """ステーション別「今やるべきこと」"""
    result = _generate_tasks_now(db)
    if station != "admin":
        filtered = [t for t in result.all_tasks if t.station == station]
        result.all_tasks = filtered
        result.by_station = {station: [t.model_dump() for t in filtered]}
        result.total_urgent = sum(1 for t in filtered if t.priority_score >= 70)
        result.total_warning = sum(1 for t in filtered if 40 <= t.priority_score < 70)
        result.total_normal = sum(1 for t in filtered if t.priority_score < 40)
    return result


# ── POST /api/tasks/now/refresh ───────────────────────────
@router.post("/now/refresh")
async def refresh_tasks_now(
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """タスクリストを手動リフレッシュしてWebSocket配信"""
    result = _generate_tasks_now(db)
    background.add_task(
        manager.broadcast_tasks_now_updated,
        result.model_dump(),
    )
    return {"message": "リフレッシュ完了", "urgent": result.total_urgent, "total": len(result.all_tasks)}
