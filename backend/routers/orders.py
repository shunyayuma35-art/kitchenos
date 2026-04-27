from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from websocket_manager import manager
from routers.inventory import deduct_stock_for_order
from routers.tasks_now import _generate_tasks_now

router = APIRouter(prefix="/api/orders", tags=["orders"])


async def _refresh_tasks_now_bg(db, ws_manager):
    """タスク完了後にtasks_nowを再生成してWebSocket配信"""
    try:
        result = _generate_tasks_now(db)
        await ws_manager.broadcast_tasks_now_updated(result.model_dump())
    except Exception:
        pass  # バックグラウンド処理なので失敗しても無視


STATION_MAP = {
    "調理": "cooking",
    "盛付": "plating",
    "仕込み": "prep",
}


def assign_station(task_type: str) -> str:
    return STATION_MAP.get(task_type, "cooking")


@router.post("/", response_model=schemas.OrderOut)
async def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    order = models.Order(
        table_number=payload.table_number,
        status=models.OrderStatus.pending,
        priority=0,
    )
    db.add(order)
    db.flush()

    for item_data in payload.items:
        item = models.OrderItem(
            order_id=order.id,
            menu_name=item_data.menu_name,
            quantity=item_data.quantity,
            note=item_data.note,
        )
        db.add(item)
        db.flush()

        for t in item_data.tasks:
            # メニューマスターから手順説明を取得
            menu_step = (
                db.query(models.MenuStep)
                .join(models.Menu)
                .filter(models.Menu.name == item_data.menu_name, models.MenuStep.step == t.step)
                .first()
            )
            task = models.Task(
                order_item_id=item.id,
                step=t.step,
                task_type=t.task_type,
                description=menu_step.description if menu_step else None,
                status=models.TaskStatus.pending,
                assigned_station=assign_station(t.task_type),
                estimated_time_seconds=menu_step.estimated_time_seconds if menu_step else None,
                auto_next=menu_step.auto_next if menu_step else False,
                required_checklist=menu_step.required_checklist if menu_step else None,
            )
            db.add(task)

    db.commit()
    db.refresh(order)

    order_dict = schemas.OrderOut.model_validate(order).model_dump()
    await manager.broadcast_order_created(order_dict)

    return order


@router.get("/logs/", response_model=List[schemas.CompletionLogOut])
def list_logs(limit: int = 100, db: Session = Depends(get_db)):
    """完了ログ一覧（クレーム対応・品質管理用）"""
    return (
        db.query(models.CompletionLog)
        .order_by(models.CompletionLog.end_time.desc())
        .limit(limit)
        .all()
    )


@router.get("/", response_model=List[schemas.OrderOut])
def list_orders(status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.Order)
    if status:
        q = q.filter(models.Order.status == status)
    return q.order_by(models.Order.priority.desc(), models.Order.created_at.asc()).all()


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
async def update_order_status(
    order_id: int, payload: schemas.OrderStatusUpdate, db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


@router.patch("/tasks/{task_id}/start", response_model=schemas.TaskOut)
async def start_task(
    task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = models.TaskStatus.in_progress
    task.started_at = datetime.utcnow()
    task.assigned_staff = payload.assigned_staff or task.assigned_staff
    db.commit()
    db.refresh(task)

    await manager.broadcast_task_updated(
        schemas.TaskOut.model_validate(task).model_dump(),
        station_type=task.assigned_station,
    )
    return task


@router.patch("/tasks/{task_id}/complete", response_model=schemas.TaskOut)
async def complete_task(
    task_id: int, payload: schemas.TaskUpdate, background: BackgroundTasks, db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    now = datetime.utcnow()
    duration = None
    if task.started_at:
        duration = int((now - task.started_at).total_seconds())

    task.status = models.TaskStatus.completed
    task.completed_at = now
    task.completed_by = payload.completed_by or "unknown"

    log = models.CompletionLog(
        task_id=task.id,
        staff_name=payload.completed_by or "unknown",
        task_type=task.task_type,
        description=f"{task.order_item.menu_name} - {task.task_type} (step {task.step})",
        start_time=task.started_at,
        end_time=now,
        duration_seconds=duration,
        photo_url=payload.photo_url,
        note=payload.note,
    )
    db.add(log)

    # ── 調理履歴に自動保存（改ざん防止: created_at は自動付与） ──
    order_item = task.order_item
    order = order_item.order
    history = models.CookingHistory(
        order_id=order.id,
        order_item_id=order_item.id,
        step=task.step,
        task_type=task.task_type,
        station=task.assigned_station or task.task_type,
        staff_id=payload.completed_by or "unknown",
        menu_name=order_item.menu_name,
        table_number=order.table_number,
        completed_at=now,
        duration_seconds=duration,
        status="completed",
        note=payload.note,
    )
    db.add(history)
    db.commit()
    db.refresh(task)
    db.refresh(history)

    log_dict = schemas.CompletionLogOut.model_validate(log).model_dump()
    await manager.broadcast_task_completed(log_dict)
    await manager.broadcast_task_updated(
        schemas.TaskOut.model_validate(task).model_dump(),
        station_type=task.assigned_station,
    )

    # ── step_completed イベント配信 ────────────────────────
    history_dict = schemas.CookingHistoryOut.model_validate(history).model_dump()
    await manager.broadcast_step_completed(history_dict)

    # ── 調理完了 → 盛付ステーションへ "main_completed" アラート ──
    if task.task_type == "調理":
        await manager.broadcast_main_completed({
            "order_id": order.id,
            "table_number": order.table_number,
            "menu_name": order_item.menu_name,
            "staff_id": payload.completed_by or "unknown",
            "completed_at": now.isoformat(),
        })
        # station_alert: ライス・スープ・サイド・ドリンクへ通知
        await manager.broadcast_station_alert(
            data={
                "type": "alert",
                "order_id": order.id,
                "table": order.table_number,
                "message": f"{order_item.menu_name}の調理が完成しました。提供準備を開始してください。",
                "targets": ["rice", "soup", "side", "drink"],
                "urgency": "warning",
            },
            targets=["cooking", "plating", "prep", "admin"],
        )

    # ── tasks_now をバックグラウンドで再生成 → 全ステーションへ配信 ──
    background.add_task(_refresh_tasks_now_bg, db, manager)
    all_items = order.items
    all_done = all(
        all(t.status == models.TaskStatus.completed for t in i.tasks)
        for i in all_items
    )
    if all_done:
        order.status = models.OrderStatus.completed
        # 📦 在庫を自動消費
        deduct_stock_for_order(order.id, db)
        db.commit()

        # 🔔 全ステーション＋客席タブレットへ「提供OK」通知
        order_ready_data = {
            "order_id": order.id,
            "table_number": order.table_number,
            "menu_items": [i.menu_name for i in all_items],
        }
        await manager.broadcast_order_ready(order_ready_data)

    return task
