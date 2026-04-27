"""
初期セットアップ API
POST /api/setup/template/{type}  — 業態別テンプレートメニューを一括登録
GET  /api/setup/templates        — 利用可能テンプレート一覧
"""
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

import models
from database import get_db
from translate import ensure_multilingual

router = APIRouter(prefix="/api/setup", tags=["setup"])


def _j(d: dict) -> str:
    return json.dumps(d, ensure_ascii=False)


# ─── 業態テンプレート定義 ───────────────────────────────────
TEMPLATES = {
    "ramen": {
        "label": "ラーメン店",
        "emoji": "🍜",
        "menus": [
            {
                "name": "醤油ラーメン",
                "category": "ラーメン",
                "steps": [
                    (1, "仕込み", "スープを仕込む（水・鶏ガラ・醤油ダレ）", 600, True, '["スープ量確認", "温度確認(85℃以上)"]'),
                    (2, "調理", "麺を茹でる（2分）・丼にスープを注ぐ", 120, True, '["麺の茹で加減確認"]'),
                    (3, "盛付", "チャーシュー・メンマ・ネギを盛付", 60, False, '["盛付バランス確認"]'),
                ],
            },
            {
                "name": "味噌ラーメン",
                "category": "ラーメン",
                "steps": [
                    (1, "仕込み", "味噌ダレを仕込む（白味噌・赤味噌・みりん）", 600, True, '["ダレの味確認"]'),
                    (2, "調理", "スープと味噌ダレを合わせて麺を茹でる", 120, True, '["麺の茹で加減確認"]'),
                    (3, "盛付", "コーン・バター・ネギを盛付", 60, False, None),
                ],
            },
        ],
    },
    "izakaya": {
        "label": "居酒屋",
        "emoji": "🍶",
        "menus": [
            {
                "name": "唐揚げ",
                "category": "揚げ物",
                "steps": [
                    (1, "仕込み", "鶏肉に下味をつける（醤油・酒・生姜）、30分漬け込む", 1800, False, '["味の確認", "漬け時間確認"]'),
                    (2, "調理", "片栗粉をまぶして170℃で5分揚げる", 300, True, '["油温確認(170℃)", "揚げ色確認"]'),
                    (3, "盛付", "キャベツを添えてレモンを添える", 30, False, None),
                ],
            },
            {
                "name": "枝豆",
                "category": "前菜",
                "steps": [
                    (1, "調理", "枝豆を塩茹でする（5分）", 300, True, '["茹で加減確認"]'),
                    (2, "盛付", "水を切り塩をふって盛付", 30, False, None),
                ],
            },
            {
                "name": "焼き鳥（もも）",
                "category": "焼き物",
                "steps": [
                    (1, "仕込み", "鶏もも肉を串に刺す（3切れ）", 120, False, None),
                    (2, "調理", "炭火で塩またはタレで焼く（7分）", 420, True, '["焼き色確認", "中心温度確認"]'),
                    (3, "盛付", "皿に盛り付け、塩・タレを添える", 30, False, None),
                ],
            },
        ],
    },
    "cafe": {
        "label": "カフェ",
        "emoji": "☕",
        "menus": [
            {
                "name": "カフェラテ",
                "category": "ドリンク",
                "steps": [
                    (1, "仕込み", "エスプレッソを抽出する（20秒・30ml）", 20, True, '["抽出量確認(30ml)", "クレマ確認"]'),
                    (2, "調理", "ミルクをスチームする（60℃）", 30, True, '["温度確認(60℃)", "泡の質確認"]'),
                    (3, "盛付", "エスプレッソにミルクを注ぎラテアートする", 20, False, None),
                ],
            },
            {
                "name": "パンケーキ",
                "category": "フード",
                "steps": [
                    (1, "仕込み", "生地を混ぜる（薄力粉・卵・牛乳・バター）", 180, False, '["生地のダマ確認"]'),
                    (2, "調理", "フライパンで弱火で両面焼く（各3分）", 360, True, '["焼き色確認", "膨らみ確認"]'),
                    (3, "盛付", "バター・メープルシロップ・フルーツを添える", 30, False, None),
                ],
            },
        ],
    },
    "teishoku": {
        "label": "定食屋",
        "emoji": "🍱",
        "menus": [
            {
                "name": "豚生姜焼き定食",
                "category": "定食",
                "steps": [
                    (1, "仕込み", "豚肉を生姜ダレに漬ける（醤油・みりん・生姜）", 600, False, None),
                    (2, "仕込み", "ご飯を炊く・味噌汁を仕込む", 1200, True, '["ご飯の炊き上がり確認"]'),
                    (3, "調理", "フライパンで豚肉を炒める（中火4分）", 240, True, '["焼き色確認", "火の通り確認"]'),
                    (4, "盛付", "ご飯・味噌汁・サラダ・漬物を盛り付ける", 60, False, '["盛付量確認"]'),
                ],
            },
            {
                "name": "唐揚げ定食",
                "category": "定食",
                "steps": [
                    (1, "仕込み", "鶏肉に下味をつける・ご飯を炊く", 1800, False, None),
                    (2, "調理", "唐揚げを揚げる（170℃・5分）", 300, True, '["油温確認", "揚げ色確認"]'),
                    (3, "盛付", "定食セットを盛り付ける", 60, False, None),
                ],
            },
        ],
    },
}


class TemplateApplyResult(BaseModel):
    ok: bool
    template: str
    menus_created: int


@router.get("/templates")
def list_templates():
    """利用可能な業態テンプレート一覧"""
    return {
        "templates": [
            {"key": k, "label": v["label"], "emoji": v["emoji"], "menu_count": len(v["menus"])}
            for k, v in TEMPLATES.items()
        ]
    }


@router.post("/template/{template_type}")
async def apply_template(
    template_type: str,
    db: Session = Depends(get_db),
    clear_existing: bool = False,
):
    """
    業態テンプレートをDBに登録する。
    clear_existing=true の場合は既存メニューを全削除してから登録。
    """
    template = TEMPLATES.get(template_type)
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Template '{template_type}' not found")

    if clear_existing:
        db.query(models.MenuStep).delete()
        db.query(models.Menu).delete()
        db.commit()

    created = 0
    for menu_data in template["menus"]:
        # 同名メニューが既にある場合はスキップ
        existing = db.query(models.Menu).filter(models.Menu.name == menu_data["name"]).first()
        if existing:
            continue

        menu = models.Menu(name=menu_data["name"], category=menu_data["category"])
        db.add(menu)
        db.flush()

        for step_num, task_type, desc_ja, est_sec, auto_next, checklist in menu_data["steps"]:
            desc_i18n = await ensure_multilingual(desc_ja)
            step = models.MenuStep(
                menu_id=menu.id,
                step=step_num,
                task_type=task_type,
                description=desc_i18n,
                estimated_time_seconds=est_sec,
                auto_next=auto_next,
                required_checklist=checklist,
            )
            db.add(step)

        created += 1

    db.commit()
    return {"ok": True, "template": template_type, "menus_created": created}
