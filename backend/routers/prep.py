from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from websocket_manager import manager

router = APIRouter(prefix="/api/prep", tags=["prep"])


@router.post("/", response_model=schemas.PrepWorkOut)
async def create_prep_work(payload: schemas.PrepWorkCreate, db: Session = Depends(get_db)):
    prep = models.PrepWork(
        name=payload.name,
        date=payload.date,
        status=models.TaskStatus.pending,
        priority=payload.priority,
    )
    db.add(prep)
    db.flush()

    for t in payload.tasks:
        prep_task = models.PrepTask(
            prep_work_id=prep.id,
            step=t.step,
            description=t.description,
            status=models.TaskStatus.pending,
        )
        db.add(prep_task)

    db.commit()
    db.refresh(prep)

    prep_dict = schemas.PrepWorkOut.model_validate(prep).model_dump()
    await manager.broadcast_prep_updated(prep_dict)

    return prep


@router.get("/", response_model=List[schemas.PrepWorkOut])
def list_prep_works(date: str = None, db: Session = Depends(get_db)):
    q = db.query(models.PrepWork)
    if date:
        q = q.filter(models.PrepWork.date == date)
    return q.order_by(models.PrepWork.priority.desc(), models.PrepWork.created_at.asc()).all()


@router.get("/{prep_id}", response_model=schemas.PrepWorkOut)
def get_prep_work(prep_id: int, db: Session = Depends(get_db)):
    prep = db.query(models.PrepWork).filter(models.PrepWork.id == prep_id).first()
    if not prep:
        raise HTTPException(status_code=404, detail="PrepWork not found")
    return prep


@router.patch("/tasks/{task_id}/start", response_model=schemas.PrepTaskOut)
async def start_prep_task(
    task_id: int, payload: schemas.PrepTaskUpdate, db: Session = Depends(get_db)
):
    task = db.query(models.PrepTask).filter(models.PrepTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="PrepTask not found")

    task.status = models.TaskStatus.in_progress
    task.assigned_staff = payload.assigned_staff or task.assigned_staff
    db.commit()
    db.refresh(task)

    prep = task.prep_work
    prep_dict = schemas.PrepWorkOut.model_validate(prep).model_dump()
    await manager.broadcast_prep_updated(prep_dict)

    return task


@router.patch("/tasks/{task_id}/complete", response_model=schemas.PrepTaskOut)
async def complete_prep_task(
    task_id: int, payload: schemas.PrepTaskUpdate, db: Session = Depends(get_db)
):
    task = db.query(models.PrepTask).filter(models.PrepTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="PrepTask not found")

    now = datetime.utcnow()
    task.status = models.TaskStatus.completed
    task.completed_at = now
    task.completed_by = payload.completed_by or "unknown"

    log = models.CompletionLog(
        prep_task_id=task.id,
        staff_name=payload.completed_by or "unknown",
        task_type="仕込み",
        description=f"{task.prep_work.name} - {task.description} (step {task.step})",
        completed_at=now,
    )
    db.add(log)
    db.commit()
    db.refresh(task)

    # Auto-update prep work status
    prep = task.prep_work
    if all(t.status == models.TaskStatus.completed for t in prep.tasks):
        prep.status = models.TaskStatus.completed
        db.commit()

    prep_dict = schemas.PrepWorkOut.model_validate(prep).model_dump()
    log_dict = schemas.CompletionLogOut.model_validate(log).model_dump()

    await manager.broadcast_prep_updated(prep_dict)
    await manager.broadcast_task_completed(log_dict)

    return task


@router.delete("/{prep_id}")
async def delete_prep_work(prep_id: int, db: Session = Depends(get_db)):
    prep = db.query(models.PrepWork).filter(models.PrepWork.id == prep_id).first()
    if not prep:
        raise HTTPException(status_code=404, detail="PrepWork not found")
    db.delete(prep)
    db.commit()
    return {"ok": True}
