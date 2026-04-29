"""
AI提供タイミング最適化ルーター
- POST /api/predict/timing  : 注文の完成予測タイムラインを生成
- GET  /api/predict/staff-speed : スタッフ速度プロファイル一覧
- POST /api/predict/rebuild-profiles : 速度プロファイルをhistoryから再計算

AIロジック:
1. cooking_history から menu/station ごとの平均作業時間を算出
2. スタッフ個人の速度倍率（speed_ratio）を学習
3. ステーション負荷（現在の作業中タスク数）で補正
4. 温度低下リスク（調理完成から10分以上経過）を検出
5. サイド・ライス・スープの最適開始タイミングを逆算
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db
from websocket_manager import manager

router = APIRouter(prefix="/api/predict", tags=["predict"])

# ── 温度危険モデル定数 ──────────────────────────────────────
TEMP_DANGER_SECONDS = 600        # 10分以上前に完成 → 冷める危険
SIDE_DISH_BUFFER_SECONDS = 90    # サイド先行マージン（90秒前に開始）
DEFAULT_TASK_SECONDS = 300       # 履歴なし時のデフォルト推定（5分）
STATION_LOAD_FACTOR = 0.15       # タスク1件追加ごとに15%増加


# ── ヘルパー: ステーション別平均作業時間を取得 ─────────────────
def _get_station_avg(db: Session, station: str, menu_name: str = None) -> float:
    """cooking_history から特定ステーション（＋オプションでメニュー名）の平均秒数を返す"""
    q = db.query(func.avg(models.CookingHistory.duration_seconds)).filter(
        models.CookingHistory.station == station,
        models.CookingHistory.duration_seconds.isnot(None),
        models.CookingHistory.status == "completed",
    )
    if menu_name:
        q = q.filter(models.CookingHistory.menu_name == menu_name)
    result = q.scalar()
    return float(result) if result else DEFAULT_TASK_SECONDS


def _get_staff_speed_ratio(db: Session, staff_id: str, station: str) -> float:
    """スタッフ速度倍率を返す。プロファイルなければ 1.0"""
    if not staff_id:
        return 1.0
    profile = db.query(models.StaffSpeedProfile).filter(
        models.StaffSpeedProfile.staff_id == staff_id,
        models.StaffSpeedProfile.station == station,
    ).first()
    return profile.speed_ratio if profile else 1.0


def _get_station_load(db: Session, station: str) -> int:
    """現在そのステーションで作業中のタスク数を返す"""
    return db.query(models.Task).filter(
        models.Task.assigned_station == station,
        models.Task.status.in_(["pending", "in_progress"]),
    ).count()


def _predict_task_seconds(
    db: Session,
    task: models.Task,
    menu_name: str,
    staff_id: Optional[str] = None,
) -> int:
    """タスク1件の残り予測秒数を計算"""
    station = task.assigned_station or "cooking"

    # ベース: 履歴平均 or estimated_time_seconds
    if task.estimated_time_seconds:
        base = float(task.estimated_time_seconds)
    else:
        base = _get_station_avg(db, station, menu_name)

    # スタッフ速度補正
    speed = _get_staff_speed_ratio(db, staff_id, station)

    # ステーション負荷補正
    load = _get_station_load(db, station)
    load_factor = 1.0 + (load * STATION_LOAD_FACTOR)

    # 既に in_progress なら経過時間を引く
    elapsed = 0
    if task.status == "in_progress" and task.started_at:
        elapsed = int((datetime.utcnow() - task.started_at).total_seconds())

    predicted = max(0, int(base * speed * load_factor) - elapsed)
    return predicted


def _recommend_staff(db: Session, station: str) -> Optional[str]:
    """そのステーションで最も速いスタッフIDを返す"""
    profile = db.query(models.StaffSpeedProfile).filter(
        models.StaffSpeedProfile.station == station,
        models.StaffSpeedProfile.sample_count >= 3,
    ).order_by(models.StaffSpeedProfile.speed_ratio.asc()).first()
    return profile.staff_id if profile else None


# ── POST /api/predict/timing ───────────────────────────────
@router.post("/timing", response_model=schemas.TimingPredictionResponse)
async def predict_timing(
    payload: schemas.TimingPredictRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    注文IDを指定して、全タスクの完成予測タイムラインを生成。
    - スタッフ速度・ステーション負荷・履歴平均を組み合わせたAIロジック
    - 温度低下リスク・遅延リスクを自動検出
    - サイドメニューの最適開始タイミングを逆算
    """
    order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    now = datetime.utcnow()
    task_infos: List[schemas.TaskTimingInfo] = []
    max_finish_offset = 0  # 全タスク中の最大完了所要秒数
    delay_risk = False

    # ステーション負荷スナップショット
    station_loads: Dict[str, int] = {}
    for st in ["cooking", "plating", "prep"]:
        station_loads[st] = _get_station_load(db, st)

    # 温度危険ゾーン: 調理完了タスクが何秒前に終わったか
    main_completed_tasks = [
        t for item in order.items
        for t in item.tasks
        if t.task_type == "調理" and t.status == "completed" and t.completed_at
    ]
    # 最後に完了した調理タスクの時刻
    last_main_finish: Optional[datetime] = None
    if main_completed_tasks:
        last_main_finish = max(t.completed_at for t in main_completed_tasks)

    for item in order.items:
        for task in item.tasks:
            if task.status == "completed":
                remaining = 0
                finish_at = task.completed_at
            else:
                remaining = _predict_task_seconds(
                    db, task, item.menu_name, payload.staff_id
                )
                finish_at = now + timedelta(seconds=remaining)

            # 遅延リスク: 残り時間が estimated の 130% 超
            is_delayed = False
            if task.estimated_time_seconds and task.status != "completed":
                if task.status == "in_progress" and task.started_at:
                    elapsed = (now - task.started_at).total_seconds()
                    if elapsed > task.estimated_time_seconds * 1.3:
                        is_delayed = True
                        delay_risk = True

            # 温度リスク: 調理完成から TEMP_DANGER_SECONDS 以上経過 & まだ盛付が残っている
            temp_risk = False
            if last_main_finish:
                elapsed_since_main = (now - last_main_finish).total_seconds()
                if elapsed_since_main >= TEMP_DANGER_SECONDS and task.task_type == "盛付" and task.status != "completed":
                    temp_risk = True

            if task.status != "completed":
                max_finish_offset = max(max_finish_offset, remaining)

            station = task.assigned_station or "cooking"
            task_infos.append(schemas.TaskTimingInfo(
                task_id=task.id,
                order_item_id=item.id,
                menu_name=item.menu_name,
                step=task.step,
                task_type=task.task_type,
                station=station,
                status=task.status,
                predicted_finish_at=finish_at.isoformat() if finish_at else None,
                estimated_remaining_seconds=remaining,
                delay_risk=is_delayed,
                temperature_risk=temp_risk,
                assigned_staff=task.assigned_staff,
                recommended_staff=_recommend_staff(db, station),
            ))

    # サイドメニュー開始タイミングの計算
    # メニュー別 timing_config を優先、なければデフォルト値を使用
    import json as _json

    # 注文のメニュー名からタイミング設定を取得（複数メニューなら最大値を採用）
    timing_cfg: dict = {}
    for item in order.items:
        menu_obj = db.query(models.Menu).filter(models.Menu.name == item.menu_name).first()
        if menu_obj and menu_obj.timing_config:
            try:
                cfg = _json.loads(menu_obj.timing_config)
                # より長い方（安全側）を採用
                for k, v in cfg.items():
                    if isinstance(v, (int, float)):
                        timing_cfg[k] = max(timing_cfg.get(k, 0), v)
            except Exception:
                pass

    # デフォルト値（timing_config がない場合）
    RICE_BEFORE  = timing_cfg.get("rice_before_seconds",  60)    # ご飯: 1分前
    MISO_BEFORE  = timing_cfg.get("miso_before_seconds",  60)    # 味噌汁: 1分前
    SIDE_BEFORE  = timing_cfg.get("side_before_seconds",  30)    # サイド: 30秒前
    SALAD_BEFORE = timing_cfg.get("salad_before_seconds", 60)    # サラダ: 1分前
    DRINK_BEFORE = timing_cfg.get("drink_before_seconds", 60)    # ドリンク: 1分前

    main_tasks = [t for t in task_infos if t.task_type == "調理"]
    side_timings: List[schemas.SideDishTiming] = []
    if main_tasks:
        pending_main = [t for t in main_tasks if t.status != "completed"]
        max_main_remaining = max(t.estimated_remaining_seconds for t in pending_main) if pending_main else 0

        def _make_timing(item_type: str, before_seconds: int, label_ja: str) -> schemas.SideDishTiming:
            start_offset = max(0, int(max_main_remaining - before_seconds))
            if start_offset <= 0:
                reason = f"今すぐ{label_ja}を開始（メイン完成まで{max_main_remaining}秒）"
            else:
                reason = f"{start_offset}秒後に{label_ja}を開始（メイン完成{before_seconds}秒前）"
            return schemas.SideDishTiming(
                item_type=item_type,
                start_in_seconds=start_offset,
                reason=reason,
            )

        side_timings = [
            _make_timing("rice",  RICE_BEFORE,  "ライス"),
            _make_timing("soup",  MISO_BEFORE,  "味噌汁"),
            _make_timing("side",  SIDE_BEFORE,  "サイドメニュー"),
            _make_timing("salad", SALAD_BEFORE, "サラダ"),
            _make_timing("drink", DRINK_BEFORE, "ドリンク"),
        ]

    # ステーション負荷レベル変換
    def _load_level(count: int) -> str:
        if count == 0: return "idle"
        if count <= 2: return "low"
        if count <= 5: return "medium"
        return "high"

    station_load_resp = {st: _load_level(cnt) for st, cnt in station_loads.items()}

    predicted_completion = (now + timedelta(seconds=max_finish_offset)).isoformat()

    response = schemas.TimingPredictionResponse(
        order_id=order.id,
        table_number=order.table_number,
        predicted_completion_at=predicted_completion,
        estimated_total_seconds=max_finish_offset,
        delay_risk=delay_risk,
        station_load=station_load_resp,
        tasks=task_infos,
        side_dish_timings=side_timings,
        generated_at=now.isoformat(),
    )

    # バックグラウンドでWebSocket配信
    background.add_task(
        manager.broadcast_timing_updated,
        response.model_dump(),
    )

    return response


# ── GET /api/predict/staff-speed ──────────────────────────
@router.get("/staff-speed")
def get_staff_speed_profiles(db: Session = Depends(get_db)):
    """スタッフ速度プロファイル一覧"""
    profiles = db.query(models.StaffSpeedProfile).order_by(
        models.StaffSpeedProfile.speed_ratio.asc()
    ).all()
    return [
        {
            "staff_id": p.staff_id,
            "station": p.station,
            "speed_ratio": round(p.speed_ratio, 3),
            "avg_duration_seconds": p.avg_duration_seconds,
            "sample_count": p.sample_count,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        }
        for p in profiles
    ]


# ── POST /api/predict/rebuild-profiles ─────────────────────
@router.post("/rebuild-profiles")
def rebuild_speed_profiles(db: Session = Depends(get_db)):
    """
    cooking_history 全データからスタッフ速度プロファイルを再計算。
    speed_ratio = staff_avg / station_global_avg
    """
    # ステーション全体平均
    station_avgs: Dict[str, float] = {}
    for station in ["cooking", "plating", "prep"]:
        avg = db.query(func.avg(models.CookingHistory.duration_seconds)).filter(
            models.CookingHistory.station == station,
            models.CookingHistory.duration_seconds.isnot(None),
        ).scalar()
        station_avgs[station] = float(avg) if avg else DEFAULT_TASK_SECONDS

    # スタッフ×ステーション別の平均・件数
    rows = (
        db.query(
            models.CookingHistory.staff_id,
            models.CookingHistory.station,
            func.avg(models.CookingHistory.duration_seconds).label("avg_dur"),
            func.count(models.CookingHistory.id).label("cnt"),
        )
        .filter(models.CookingHistory.duration_seconds.isnot(None))
        .group_by(models.CookingHistory.staff_id, models.CookingHistory.station)
        .all()
    )

    updated = 0
    for row in rows:
        global_avg = station_avgs.get(row.station, DEFAULT_TASK_SECONDS)
        ratio = float(row.avg_dur) / global_avg if global_avg > 0 else 1.0
        ratio = max(0.3, min(3.0, ratio))  # 0.3〜3.0 にクリップ

        profile = db.query(models.StaffSpeedProfile).filter(
            models.StaffSpeedProfile.staff_id == row.staff_id,
            models.StaffSpeedProfile.station == row.station,
        ).first()

        if profile:
            profile.speed_ratio = ratio
            profile.avg_duration_seconds = float(row.avg_dur)
            profile.sample_count = row.cnt
            profile.updated_at = datetime.utcnow()
        else:
            db.add(models.StaffSpeedProfile(
                staff_id=row.staff_id,
                station=row.station,
                speed_ratio=ratio,
                avg_duration_seconds=float(row.avg_dur),
                sample_count=row.cnt,
            ))
        updated += 1

    db.commit()
    return {"message": f"{updated}件のスタッフ速度プロファイルを更新しました", "updated": updated}
