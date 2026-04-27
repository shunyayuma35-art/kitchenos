"""
調理履歴（Cooking History）ルーター
- POST /api/steps/complete        : 手動ステップ完了登録
- GET  /api/cooking-history/order/{order_id} : 注文別調理履歴
- GET  /api/cooking-history/staff/{staff_id} : スタッフ別履歴
- GET  /api/cooking-history/reports/daily    : 日報
- GET  /api/cooking-history/reports/monthly  : 月報
"""
from datetime import datetime, date
from typing import List, Optional
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db
from websocket_manager import manager

router = APIRouter(prefix="/api/cooking-history", tags=["cooking_history"])


# ── POST /api/steps/complete ──────────────────────────────
@router.post("/complete", response_model=schemas.CookingHistoryOut)
async def step_complete(payload: schemas.StepCompletePayload, db: Session = Depends(get_db)):
    """
    外部システム・スタッフ端末からのステップ完了通知を受け取り、
    cooking_history に保存して step_completed イベントを発火する。
    staff_id はリクエストから取得（ログインユーザー想定）。
    """
    try:
        completed_at = datetime.fromisoformat(payload.completed_at.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="completed_at は ISO8601 形式で指定してください")

    # order から table_number / menu_name を補完
    table_number = None
    menu_name = None
    task_type = "調理"

    if payload.order_id:
        order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
        if order:
            table_number = order.table_number
            # item_id が数値なら order_item を引く
            try:
                item_id_int = int(payload.item_id) if payload.item_id else None
                if item_id_int:
                    item = db.query(models.OrderItem).filter(
                        models.OrderItem.id == item_id_int
                    ).first()
                    if item:
                        menu_name = item.menu_name
            except (ValueError, TypeError):
                menu_name = payload.item_id

    # station から task_type を推定
    station_to_type = {"cooking": "調理", "plating": "盛付", "prep": "仕込み"}
    task_type = station_to_type.get(payload.station, payload.station)

    history = models.CookingHistory(
        order_id=payload.order_id,
        order_item_id=int(payload.item_id) if payload.item_id and payload.item_id.isdigit() else None,
        step=int(payload.step_id) if payload.step_id and payload.step_id.isdigit() else None,
        task_type=task_type,
        station=payload.station,
        staff_id=payload.staff_id,
        menu_name=menu_name,
        table_number=table_number,
        completed_at=completed_at,
        status="completed",
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    history_dict = schemas.CookingHistoryOut.model_validate(history).model_dump()
    await manager.broadcast_step_completed(history_dict)

    # 調理完了なら main_completed も発火
    if payload.station == "cooking" and payload.order_id:
        await manager.broadcast_main_completed({
            "order_id": payload.order_id,
            "table_number": table_number,
            "menu_name": menu_name,
            "staff_id": payload.staff_id,
            "completed_at": completed_at.isoformat(),
        })

    return history


# ── GET 注文別履歴 ────────────────────────────────────────
@router.get("/order/{order_id}", response_model=List[schemas.CookingHistoryOut])
def get_order_history(order_id: int, db: Session = Depends(get_db)):
    """指定注文のすべての調理ステップ履歴を返す"""
    return (
        db.query(models.CookingHistory)
        .filter(models.CookingHistory.order_id == order_id)
        .order_by(models.CookingHistory.completed_at.asc())
        .all()
    )


# ── GET スタッフ別履歴 ────────────────────────────────────
@router.get("/staff/{staff_id}", response_model=List[schemas.CookingHistoryOut])
def get_staff_history(
    staff_id: str,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    """指定スタッフの調理履歴を返す"""
    return (
        db.query(models.CookingHistory)
        .filter(models.CookingHistory.staff_id == staff_id)
        .order_by(models.CookingHistory.completed_at.desc())
        .limit(limit)
        .all()
    )


# ── GET 全履歴（管理画面用） ───────────────────────────────
@router.get("/", response_model=List[schemas.CookingHistoryOut])
def list_history(
    limit: int = Query(200, le=1000),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    station: Optional[str] = None,
    staff_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """調理履歴一覧（フィルタ対応）"""
    q = db.query(models.CookingHistory)
    if date_from:
        try:
            q = q.filter(models.CookingHistory.completed_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass
    if date_to:
        try:
            q = q.filter(models.CookingHistory.completed_at <= datetime.fromisoformat(date_to))
        except ValueError:
            pass
    if station:
        q = q.filter(models.CookingHistory.station == station)
    if staff_id:
        q = q.filter(models.CookingHistory.staff_id == staff_id)
    return q.order_by(models.CookingHistory.completed_at.desc()).limit(limit).all()


# ── 内部ユーティリティ ────────────────────────────────────
def _build_staff_reports(records: list) -> List[schemas.StaffReportItem]:
    staff_map: dict = defaultdict(lambda: {
        "task_count": 0,
        "total_duration": 0,
        "duration_count": 0,
        "station_breakdown": defaultdict(int),
        "task_type_breakdown": defaultdict(int),
    })
    for r in records:
        s = staff_map[r.staff_id]
        s["task_count"] += 1
        if r.duration_seconds is not None:
            s["total_duration"] += r.duration_seconds
            s["duration_count"] += 1
        s["station_breakdown"][r.station] += 1
        s["task_type_breakdown"][r.task_type] += 1

    result = []
    for staff_id, s in sorted(staff_map.items(), key=lambda x: -x[1]["task_count"]):
        avg = (s["total_duration"] / s["duration_count"]) if s["duration_count"] > 0 else None
        result.append(schemas.StaffReportItem(
            staff_id=staff_id,
            task_count=s["task_count"],
            avg_duration_seconds=round(avg, 1) if avg else None,
            total_duration_seconds=s["total_duration"],
            station_breakdown=dict(s["station_breakdown"]),
            task_type_breakdown=dict(s["task_type_breakdown"]),
        ))
    return result


def _build_station_reports(records: list) -> List[schemas.StationReportItem]:
    station_map: dict = defaultdict(lambda: {"count": 0, "total": 0, "cnt": 0})
    for r in records:
        m = station_map[r.station]
        m["count"] += 1
        if r.duration_seconds is not None:
            m["total"] += r.duration_seconds
            m["cnt"] += 1
    result = []
    for station, m in sorted(station_map.items()):
        avg = (m["total"] / m["cnt"]) if m["cnt"] > 0 else None
        result.append(schemas.StationReportItem(
            station=station,
            task_count=m["count"],
            avg_duration_seconds=round(avg, 1) if avg else None,
        ))
    return result


# ── GET 日報 ──────────────────────────────────────────────
@router.get("/reports/daily", response_model=schemas.DailyReportOut)
def daily_report(
    target_date: Optional[str] = Query(None, description="YYYY-MM-DD。省略時は今日"),
    db: Session = Depends(get_db),
):
    """スタッフ別・ステーション別の日報を生成する"""
    if target_date:
        try:
            d = date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="date は YYYY-MM-DD 形式で指定してください")
    else:
        d = date.today()

    day_start = datetime(d.year, d.month, d.day, 0, 0, 0)
    day_end = datetime(d.year, d.month, d.day, 23, 59, 59)

    records = (
        db.query(models.CookingHistory)
        .filter(
            models.CookingHistory.completed_at >= day_start,
            models.CookingHistory.completed_at <= day_end,
        )
        .all()
    )

    total = len(records)
    durations = [r.duration_seconds for r in records if r.duration_seconds is not None]
    avg = round(sum(durations) / len(durations), 1) if durations else None

    return schemas.DailyReportOut(
        date=d.isoformat(),
        total_tasks=total,
        staff_reports=_build_staff_reports(records),
        station_reports=_build_station_reports(records),
        avg_duration_seconds=avg,
    )


# ── GET 月報 ──────────────────────────────────────────────
@router.get("/reports/monthly", response_model=schemas.MonthlyReportOut)
def monthly_report(
    year: int = Query(None, description="年（省略時は今年）"),
    month: int = Query(None, description="月（省略時は今月）"),
    db: Session = Depends(get_db),
):
    """月単位の調理履歴集計レポートを生成する"""
    today = date.today()
    y = year or today.year
    m = month or today.month
    if not (1 <= m <= 12):
        raise HTTPException(status_code=400, detail="month は 1〜12 で指定してください")

    # 月の始まりと終わりを計算
    import calendar
    last_day = calendar.monthrange(y, m)[1]
    month_start = datetime(y, m, 1, 0, 0, 0)
    month_end = datetime(y, m, last_day, 23, 59, 59)

    records = (
        db.query(models.CookingHistory)
        .filter(
            models.CookingHistory.completed_at >= month_start,
            models.CookingHistory.completed_at <= month_end,
        )
        .all()
    )

    # 日別サマリー
    daily_map: dict = defaultdict(int)
    for r in records:
        daily_map[r.completed_at.date().isoformat()] += 1
    daily_summary = [{"date": k, "count": v} for k, v in sorted(daily_map.items())]

    total = len(records)
    durations = [r.duration_seconds for r in records if r.duration_seconds is not None]
    avg = round(sum(durations) / len(durations), 1) if durations else None

    return schemas.MonthlyReportOut(
        year=y,
        month=m,
        total_tasks=total,
        staff_reports=_build_staff_reports(records),
        station_reports=_build_station_reports(records),
        avg_duration_seconds=avg,
        daily_summary=daily_summary,
    )
