"""
外部注文システム連携 API
POST /api/external/orders  — 外部POSや注文アプリからの注文受付
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models
import schemas
from database import get_db
from websocket_manager import manager

router = APIRouter(prefix="/api/external", tags=["external"])

# シンプルなAPIキー認証（環境変数で管理推奨）
EXTERNAL_API_KEY = "kitchen-external-2024"


class ExternalOrderItem(BaseModel):
    menu_name: str
    quantity: int = 1
    note: Optional[str] = None


class ExternalOrder(BaseModel):
    table_number: str
    source: str = "external"   # 注文元システム名
    items: List[ExternalOrderItem]


STATION_MAP = {
    "調理": "cooking",
    "盛付": "plating",
    "仕込み": "prep",
}


@router.post("/orders", response_model=schemas.OrderOut)
async def receive_external_order(
    payload: ExternalOrder,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(default=None),
):
    """
    外部注文システムからの注文を受け付け、タスクを自動生成する。
    Header: X-Api-Key: kitchen-external-2024
    """
    if x_api_key != EXTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

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

        # メニューマスターから手順を取得してタスクを生成
        menu = db.query(models.Menu).filter(
            models.Menu.name == item_data.menu_name,
            models.Menu.is_active == True,
        ).first()

        if menu:
            for menu_step in menu.steps:
                task = models.Task(
                    order_item_id=item.id,
                    step=menu_step.step,
                    task_type=menu_step.task_type,
                    description=menu_step.description,
                    status=models.TaskStatus.pending,
                    assigned_station=STATION_MAP.get(menu_step.task_type, "cooking"),
                    estimated_time_seconds=menu_step.estimated_time_seconds,
                    auto_next=menu_step.auto_next,
                    required_checklist=menu_step.required_checklist,
                )
                db.add(task)
        else:
            # メニューマスターにない場合はデフォルトタスクを生成
            task = models.Task(
                order_item_id=item.id,
                step=1,
                task_type="調理",
                description=None,
                status=models.TaskStatus.pending,
                assigned_station="cooking",
            )
            db.add(task)

    db.commit()
    db.refresh(order)

    order_dict = schemas.OrderOut.model_validate(order).model_dump()
    await manager.broadcast_order_created(order_dict)

    return order


@router.get("/orders/status/{order_id}")
def get_external_order_status(
    order_id: int,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(default=None),
):
    """外部システム向け：注文ステータス照会"""
    if x_api_key != EXTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    all_tasks = [t for item in order.items for t in item.tasks]
    completed = sum(1 for t in all_tasks if t.status == models.TaskStatus.completed)
    total = len(all_tasks)

    return {
        "order_id": order.id,
        "table_number": order.table_number,
        "status": order.status,
        "progress": f"{completed}/{total}",
        "estimated_completion_seconds": sum(
            t.estimated_time_seconds for t in all_tasks
            if t.estimated_time_seconds and t.status != models.TaskStatus.completed
        ),
    }
