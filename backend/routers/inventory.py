"""
在庫管理 API
GET    /api/inventory/              — 食材一覧（在庫量・アラート付き）
POST   /api/inventory/              — 食材登録
PATCH  /api/inventory/{id}          — 食材情報更新（名前・単位・アラート閾値）
DELETE /api/inventory/{id}          — 食材削除
POST   /api/inventory/{id}/adjust   — 在庫量を手動調整（入荷・廃棄）
GET    /api/inventory/{id}/logs     — 変動履歴
GET    /api/inventory/alerts        — 不足アラート一覧
GET    /api/inventory/menu/{menu_id}         — メニューの使用食材一覧
POST   /api/inventory/menu/{menu_id}         — メニューの使用食材を一括登録
DELETE /api/inventory/menu/{menu_id}/{item_id} — 紐付け削除
"""
from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


# ────────────────────────────────────────────────────────
#  食材マスター CRUD
# ────────────────────────────────────────────────────────

@router.get("/alerts", response_model=List[schemas.IngredientOut])
def get_alerts(db: Session = Depends(get_db)):
    """在庫がアラート閾値以下の食材一覧"""
    return (
        db.query(models.Ingredient)
        .filter(models.Ingredient.current_stock <= models.Ingredient.min_stock_alert)
        .filter(models.Ingredient.min_stock_alert > 0)
        .order_by(models.Ingredient.name)
        .all()
    )


@router.get("/", response_model=List[schemas.IngredientOut])
def list_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).order_by(models.Ingredient.name).all()


@router.post("/", response_model=schemas.IngredientOut)
def create_ingredient(payload: schemas.IngredientCreate, db: Session = Depends(get_db)):
    ing = models.Ingredient(
        name=payload.name,
        unit=payload.unit,
        current_stock=payload.current_stock,
        min_stock_alert=payload.min_stock_alert,
    )
    db.add(ing)
    # 初期在庫ログ
    if payload.current_stock > 0:
        log = models.InventoryLog(
            ingredient_id=ing.id,
            change_amount=payload.current_stock,
            reason="初期登録",
        )
        db.add(log)
    db.commit()
    db.refresh(ing)
    return ing


@router.patch("/{ingredient_id}", response_model=schemas.IngredientOut)
def update_ingredient(
    ingredient_id: int,
    payload: schemas.IngredientUpdate,
    db: Session = Depends(get_db),
):
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    if payload.name is not None:
        ing.name = payload.name
    if payload.unit is not None:
        ing.unit = payload.unit
    if payload.min_stock_alert is not None:
        ing.min_stock_alert = payload.min_stock_alert
    # current_stock の直接変更は /adjust エンドポイントで行う（ログ記録のため）
    ing.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ing)
    return ing


@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(ing)
    db.commit()
    return {"ok": True}


@router.post("/{ingredient_id}/adjust", response_model=schemas.IngredientOut)
def adjust_stock(
    ingredient_id: int,
    payload: schemas.StockAdjust,
    db: Session = Depends(get_db),
):
    """在庫量を手動調整する（入荷・廃棄・棚卸し修正）"""
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    ing.current_stock = max(0.0, ing.current_stock + payload.amount)
    ing.updated_at = datetime.utcnow()

    log = models.InventoryLog(
        ingredient_id=ingredient_id,
        change_amount=payload.amount,
        reason=payload.reason,
        note=payload.note,
    )
    db.add(log)
    db.commit()
    db.refresh(ing)
    return ing


@router.get("/{ingredient_id}/logs", response_model=List[schemas.InventoryLogOut])
def get_ingredient_logs(
    ingredient_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return (
        db.query(models.InventoryLog)
        .filter(models.InventoryLog.ingredient_id == ingredient_id)
        .order_by(models.InventoryLog.created_at.desc())
        .limit(limit)
        .all()
    )


# ────────────────────────────────────────────────────────
#  メニュー × 食材 紐付け
# ────────────────────────────────────────────────────────

@router.get("/menu/{menu_id}", response_model=List[schemas.MenuIngredientOut])
def list_menu_ingredients(menu_id: int, db: Session = Depends(get_db)):
    """メニューに紐付いた食材と使用量を取得"""
    return (
        db.query(models.MenuIngredient)
        .filter(models.MenuIngredient.menu_id == menu_id)
        .all()
    )


@router.post("/menu/{menu_id}", response_model=List[schemas.MenuIngredientOut])
def set_menu_ingredients(
    menu_id: int,
    items: List[schemas.MenuIngredientCreate],
    db: Session = Depends(get_db),
):
    """メニューの食材紐付けを一括上書き"""
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    # 既存の紐付けを全削除
    db.query(models.MenuIngredient).filter(models.MenuIngredient.menu_id == menu_id).delete()
    db.flush()

    results = []
    for item in items:
        ing = db.query(models.Ingredient).filter(models.Ingredient.id == item.ingredient_id).first()
        if not ing:
            continue
        mi = models.MenuIngredient(
            menu_id=menu_id,
            ingredient_id=item.ingredient_id,
            quantity_per_serving=item.quantity_per_serving,
        )
        db.add(mi)
        results.append(mi)

    db.commit()
    for mi in results:
        db.refresh(mi)
    return results


@router.delete("/menu/{menu_id}/{item_id}")
def delete_menu_ingredient(menu_id: int, item_id: int, db: Session = Depends(get_db)):
    mi = db.query(models.MenuIngredient).filter(
        models.MenuIngredient.id == item_id,
        models.MenuIngredient.menu_id == menu_id,
    ).first()
    if not mi:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(mi)
    db.commit()
    return {"ok": True}


# ────────────────────────────────────────────────────────
#  在庫使用量サマリー（ダッシュボード用）
# ────────────────────────────────────────────────────────

@router.get("/usage/today")
def get_today_usage(db: Session = Depends(get_db)):
    """本日の在庫使用量ログ一覧"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    logs = (
        db.query(models.InventoryLog)
        .filter(
            models.InventoryLog.created_at >= today_start,
            models.InventoryLog.change_amount < 0,
        )
        .order_by(models.InventoryLog.created_at.desc())
        .all()
    )
    # ingredient_id ごとに集計
    summary: dict[int, dict] = {}
    for log in logs:
        iid = log.ingredient_id
        if iid not in summary:
            ing = db.query(models.Ingredient).filter(models.Ingredient.id == iid).first()
            summary[iid] = {
                "ingredient_id": iid,
                "name": ing.name if ing else "?",
                "unit": ing.unit if ing else "",
                "total_used": 0.0,
                "current_stock": ing.current_stock if ing else 0.0,
            }
        summary[iid]["total_used"] += abs(log.change_amount)
    return {"date": date.today().isoformat(), "usage": list(summary.values())}


def deduct_stock_for_order(order_id: int, db: Session):
    """
    注文完了時に在庫を自動消費する。
    orders.py の complete_task から呼び出す。
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        return

    for item in order.items:
        menu = db.query(models.Menu).filter(models.Menu.name == item.menu_name).first()
        if not menu:
            continue
        for mi in menu.menu_ingredients:
            consume = mi.quantity_per_serving * item.quantity
            ing = mi.ingredient
            ing.current_stock = max(0.0, ing.current_stock - consume)
            ing.updated_at = datetime.utcnow()
            log = models.InventoryLog(
                ingredient_id=ing.id,
                change_amount=-consume,
                reason="注文使用",
                order_id=order_id,
                note=f"{item.menu_name} ×{item.quantity}",
            )
            db.add(log)
    # commit は呼び出し元（orders.py）で行う
