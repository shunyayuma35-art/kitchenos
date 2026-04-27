from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from translate import ensure_multilingual

router = APIRouter(prefix="/api/menus", tags=["menus"])


@router.get("/", response_model=List[schemas.MenuOut])
def list_menus(active_only: bool = False, db: Session = Depends(get_db)):
    """メニュー一覧（active_only=trueで有効メニューのみ）"""
    q = db.query(models.Menu)
    if active_only:
        q = q.filter(models.Menu.is_active == True)
    return q.order_by(models.Menu.name).all()


@router.post("/translate-all")
async def translate_all_steps(db: Session = Depends(get_db)):
    """
    DBに保存済みの全メニューステップを一括翻訳してJSON形式に更新する。
    既にJSON形式のものはスキップ。
    """
    steps = db.query(models.MenuStep).all()
    updated = 0
    for step in steps:
        if not step.description:
            continue
        new_desc = await ensure_multilingual(step.description)
        if new_desc != step.description:
            step.description = new_desc
            updated += 1
    db.commit()
    return {"ok": True, "updated_steps": updated, "total_steps": len(steps)}


@router.get("/{menu_id}", response_model=schemas.MenuOut)
def get_menu(menu_id: int, db: Session = Depends(get_db)):
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu


@router.post("/", response_model=schemas.MenuOut)
async def create_menu(payload: schemas.MenuCreate, db: Session = Depends(get_db)):
    """新メニュー登録（手順付き）→ 全言語自動翻訳 → 即現場反映"""
    menu = models.Menu(name=payload.name, category=payload.category)
    db.add(menu)
    db.flush()

    for s in payload.steps:
        desc_i18n = await ensure_multilingual(s.description)
        step = models.MenuStep(
            menu_id=menu.id,
            step=s.step,
            task_type=s.task_type,
            description=desc_i18n,
            image_url=s.image_url,
        )
        db.add(step)

    db.commit()
    db.refresh(menu)
    return menu


@router.patch("/{menu_id}", response_model=schemas.MenuOut)
async def update_menu(menu_id: int, payload: schemas.MenuUpdate, db: Session = Depends(get_db)):
    """メニュー変更（手順・数量・盛付方法など）→ 全言語自動翻訳 → 即現場反映"""
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    if payload.name is not None:
        menu.name = payload.name
    if payload.category is not None:
        menu.category = payload.category
    if payload.is_active is not None:
        menu.is_active = payload.is_active

    if payload.steps is not None:
        for old_step in menu.steps:
            db.delete(old_step)
        db.flush()
        for s in payload.steps:
            desc_i18n = await ensure_multilingual(s.description)
            step = models.MenuStep(
                menu_id=menu.id,
                step=s.step,
                task_type=s.task_type,
                description=desc_i18n,
                image_url=s.image_url,
            )
            db.add(step)

    db.commit()
    db.refresh(menu)
    return menu


@router.delete("/{menu_id}")
def delete_menu(menu_id: int, db: Session = Depends(get_db)):
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    db.delete(menu)
    db.commit()
    return {"ok": True}
