"""
アレルゲン管理ルーター
- GET  /api/allergens/         : 29品目の定義一覧（義務/推奨/候補分類付き）
- POST /api/allergens/guess    : メニュー名・説明からアレルゲン自動推定
- PATCH /api/menus/{id}/allergens : アレルゲンマップを保存
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json

import models
from database import get_db

router = APIRouter(prefix="/api/allergens", tags=["allergens"])

# ── アレルゲン定義 ───────────────────────────────────────────────

MANDATORY: list[str] = [
    "egg", "milk", "wheat", "buckwheat",
    "peanut", "shrimp", "crab", "walnut",
]

RECOMMENDED: list[str] = [
    "almond", "abalone", "squid", "salmon_roe",
    "orange", "cashew", "kiwi", "beef",
    "sesame", "salmon", "mackerel", "soybean",
    "chicken", "banana", "pork", "matsutake",
    "peach", "yam", "apple", "gelatin",
]

FUTURE: list[str] = ["pistachio"]

ALL_ALLERGENS: list[str] = MANDATORY + RECOMMENDED + FUTURE


# ── キーワードマッチング辞書（日本語メニュー名・説明文対応） ──────────

ALLERGEN_KEYWORDS: Dict[str, list[str]] = {
    "egg": [
        "卵", "たまご", "タマゴ", "玉子", "マヨネーズ", "マヨ",
        "温泉卵", "卵液", "溶き卵", "卵黄", "卵白", "オムレツ",
        "オムライス", "卵とじ", "親子", "茶碗蒸し", "だし巻き",
        "スクランブル", "目玉焼き", "ゆで卵",
    ],
    "milk": [
        "乳", "牛乳", "バター", "チーズ", "生クリーム", "クリーム",
        "ミルク", "ヨーグルト", "グラタン", "シチュー", "ホワイトソース",
        "ベシャメル", "ラクトース", "カスタード",
    ],
    "wheat": [
        "小麦", "薄力粉", "強力粉", "中力粉", "パン粉", "パン",
        "麺", "ラーメン", "うどん", "パスタ", "スパゲッティ",
        "餃子", "春巻き", "天ぷら", "揚げ物", "フライ", "カツ",
        "とんかつ", "唐揚げ", "コロッケ", "オムライス", "ピザ",
        "小麦粉",
    ],
    "buckwheat": [
        "そば", "蕎麦", "ソバ",
    ],
    "peanut": [
        "落花生", "ピーナッツ", "ピーナツ", "ピーナッツバター",
        "バンバンジー", "棒棒鶏",
    ],
    "shrimp": [
        "えび", "エビ", "海老", "シュリンプ", "プロン",
        "海老フライ", "エビフライ", "天ぷら", "えびチリ",
    ],
    "crab": [
        "かに", "カニ", "蟹", "クラブ", "かにかま", "カニカマ",
        "カニクリーム",
    ],
    "walnut": [
        "くるみ", "クルミ", "胡桃", "ウォールナッツ",
    ],
    "almond": [
        "アーモンド", "扁桃",
    ],
    "abalone": [
        "あわび", "アワビ", "鮑",
    ],
    "squid": [
        "いか", "イカ", "烏賊", "スルメ", "ゲソ",
    ],
    "salmon_roe": [
        "いくら", "イクラ", "サーモンロー",
    ],
    "orange": [
        "オレンジ", "柑橘", "みかん", "ネーブル",
    ],
    "cashew": [
        "カシューナッツ", "カシュー", "腰果",
    ],
    "kiwi": [
        "キウイ", "キウィ",
    ],
    "beef": [
        "牛肉", "ビーフ", "ステーキ", "すき焼き", "しゃぶしゃぶ",
        "牛丼", "ローストビーフ", "ハンバーグ", "ハンバーガー",
        "牛", "和牛",
    ],
    "sesame": [
        "ごま", "ゴマ", "胡麻", "ゴマ油", "セサミ", "ねりごま",
        "芝麻",
    ],
    "salmon": [
        "さけ", "サケ", "鮭", "サーモン", "スモークサーモン",
    ],
    "mackerel": [
        "さば", "サバ", "鯖", "さば味噌",
    ],
    "soybean": [
        "大豆", "豆腐", "味噌", "醤油", "しょうゆ", "枝豆",
        "油揚げ", "納豆", "豆乳", "みそ", "豆みそ",
    ],
    "chicken": [
        "鶏肉", "鶏もも", "鶏むね", "チキン", "唐揚げ", "から揚げ",
        "親子", "鶏", "フライドチキン", "ローストチキン",
    ],
    "banana": [
        "バナナ",
    ],
    "pork": [
        "豚肉", "ポーク", "豚", "チャーシュー", "とんかつ",
        "ベーコン", "ハム", "ソーセージ", "ウインナー",
        "豚しゃぶ", "豚バラ", "角煮", "生姜焼き",
    ],
    "matsutake": [
        "まつたけ", "マツタケ", "松茸",
    ],
    "peach": [
        "もも", "モモ", "桃", "ピーチ",
    ],
    "yam": [
        "やまいも", "山芋", "長芋", "とろろ", "ヤマイモ",
    ],
    "apple": [
        "りんご", "リンゴ", "林檎", "アップル",
    ],
    "gelatin": [
        "ゼラチン", "ゼリー", "コラーゲン", "煮こごり",
    ],
    "pistachio": [
        "ピスタチオ",
    ],
}


# ── スキーマ ──────────────────────────────────────────────────

class AllergenGuessRequest(BaseModel):
    menu_name: str
    description: Optional[str] = None
    step_descriptions: Optional[list[str]] = None


class AllergenSaveRequest(BaseModel):
    allergens: Dict[str, Any]  # {egg: true, milk: false, wheat: null, ...}


# ── エンドポイント ────────────────────────────────────────────


@router.get("/")
def get_allergen_definitions():
    """29品目の定義一覧を返す（義務/推奨/候補分類付き）"""
    result = []
    for key in ALL_ALLERGENS:
        if key in MANDATORY:
            classification = "mandatory"
        elif key in RECOMMENDED:
            classification = "recommended"
        else:
            classification = "future"
        result.append({
            "key": key,
            "classification": classification,
        })
    return {"allergens": result, "total": len(result)}


@router.post("/guess")
def guess_allergens(payload: AllergenGuessRequest):
    """
    メニュー名・説明文からルールベースでアレルゲンを自動推定。
    戻り値: {egg: true/false, milk: true/false, ...} (29品目すべて)
    """
    # テキスト結合（検索対象）
    texts = [payload.menu_name]
    if payload.description:
        texts.append(payload.description)
    if payload.step_descriptions:
        texts.extend(payload.step_descriptions)
    combined = "".join(texts)

    result: Dict[str, Optional[bool]] = {}
    for key in ALL_ALLERGENS:
        keywords = ALLERGEN_KEYWORDS.get(key, [])
        detected = any(kw in combined for kw in keywords)
        result[key] = detected  # True=含む, False=含まない

    detected_keys = [k for k, v in result.items() if v]
    return {
        "allergens": result,
        "detected": detected_keys,
        "detected_count": len(detected_keys),
    }


@router.patch("/menus/{menu_id}")
def save_menu_allergens(
    menu_id: int,
    payload: AllergenSaveRequest,
    db: Session = Depends(get_db),
):
    """アレルゲンマップをメニューに保存"""
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    # バリデーション: 値は true/false/null のみ
    valid_keys = set(ALL_ALLERGENS)
    for k, v in payload.allergens.items():
        if k not in valid_keys:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown allergen key: {k}",
            )
        if v is not None and not isinstance(v, bool):
            raise HTTPException(
                status_code=422,
                detail=f"Allergen value must be true/false/null, got {v!r} for key {k}",
            )

    menu.allergens = json.dumps(payload.allergens, ensure_ascii=False)
    db.commit()
    return {"menu_id": menu_id, "allergens": payload.allergens, "saved": True}


@router.get("/menus/{menu_id}")
def get_menu_allergens(menu_id: int, db: Session = Depends(get_db)):
    """メニューのアレルゲンマップを取得"""
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    if menu.allergens:
        try:
            allergen_map = json.loads(menu.allergens)
        except Exception:
            allergen_map = {}
    else:
        # 全 null（未調査）
        allergen_map = {k: None for k in ALL_ALLERGENS}

    return {
        "menu_id": menu_id,
        "menu_name": menu.name,
        "allergens": allergen_map,
    }


@router.get("/menus/by-name/{menu_name}")
def get_menu_allergens_by_name(menu_name: str, db: Session = Depends(get_db)):
    """メニュー名でアレルゲンマップを取得"""
    menu = db.query(models.Menu).filter(models.Menu.name == menu_name).first()
    if not menu:
        return {"menu_name": menu_name, "allergens": None}

    allergen_map = None
    if menu.allergens:
        try:
            allergen_map = json.loads(menu.allergens)
        except Exception:
            pass

    return {
        "menu_id": menu.id,
        "menu_name": menu.name,
        "allergens": allergen_map,
    }


@router.get("/menus-all")
def get_all_menu_allergens(db: Session = Depends(get_db)):
    """全メニューのアレルゲンマップを一括取得（menu_name → allergens辞書）"""
    menus = db.query(models.Menu).filter(models.Menu.is_active == True).all()
    result = {}
    for menu in menus:
        if menu.allergens:
            try:
                result[menu.name] = json.loads(menu.allergens)
            except Exception:
                result[menu.name] = None
        else:
            result[menu.name] = None
    return result


# ── 食材名からアレルゲン自動推定 ──────────────────────────────

@router.post("/guess-ingredient")
def guess_ingredient_allergens(payload: AllergenGuessRequest):
    """
    食材名からルールベースでアレルゲンを自動推定。
    メニュー名推定と同じロジックを使用。
    """
    texts = [payload.menu_name]
    if payload.description:
        texts.append(payload.description)
    combined = "".join(texts)

    result: Dict[str, Optional[bool]] = {}
    for key in ALL_ALLERGENS:
        keywords = ALLERGEN_KEYWORDS.get(key, [])
        detected = any(kw in combined for kw in keywords)
        result[key] = True if detected else None  # 検出=True, 未検出=null（未調査）

    detected_keys = [k for k, v in result.items() if v is True]
    return {
        "allergens": result,
        "detected": detected_keys,
        "detected_count": len(detected_keys),
    }


# ── 食材からメニューのアレルゲン自動計算 ─────────────────────

@router.post("/from-ingredients/{menu_id}")
def calc_allergens_from_ingredients(
    menu_id: int,
    db: Session = Depends(get_db),
):
    """
    メニューに紐付いた食材のアレルゲンを合算して、メニューのアレルゲンマップを更新。
    食材に allergens が設定されている場合はそれを優先。
    設定がない場合は食材名から自動推定。
    """
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    menu_ings = db.query(models.MenuIngredient).filter(
        models.MenuIngredient.menu_id == menu_id
    ).all()

    # 食材ごとのアレルゲンを合算 (OR演算: いずれかにtrue→true)
    merged: Dict[str, Optional[bool]] = {k: None for k in ALL_ALLERGENS}

    for mi in menu_ings:
        ing = db.query(models.Ingredient).filter(models.Ingredient.id == mi.ingredient_id).first()
        if not ing:
            continue

        # 食材のアレルゲン: 設定済みならそれを使用、なければ名前から推定
        ing_allergens: Dict[str, Optional[bool]] = {}
        if ing.allergens:
            try:
                ing_allergens = json.loads(ing.allergens)
            except Exception:
                pass

        if not ing_allergens:
            # 食材名から自動推定
            for key in ALL_ALLERGENS:
                keywords = ALLERGEN_KEYWORDS.get(key, [])
                if any(kw in ing.name for kw in keywords):
                    ing_allergens[key] = True

        # マージ
        for key in ALL_ALLERGENS:
            v = ing_allergens.get(key)
            if v is True:
                merged[key] = True
            elif v is False and merged[key] is None:
                merged[key] = False

    # 既存のメニューアレルゲンと統合（手動設定を優先、食材由来で補完）
    existing: Dict[str, Optional[bool]] = {}
    if menu.allergens:
        try:
            existing = json.loads(menu.allergens)
        except Exception:
            pass

    final: Dict[str, Optional[bool]] = {}
    for key in ALL_ALLERGENS:
        existing_val = existing.get(key)
        computed_val = merged.get(key)
        if existing_val is True:
            final[key] = True   # 手動設定を尊重
        elif computed_val is True:
            final[key] = True   # 食材由来を適用
        elif existing_val is False:
            final[key] = False  # 手動で「なし」設定を尊重
        else:
            final[key] = computed_val  # null のまま

    menu.allergens = json.dumps(final, ensure_ascii=False)
    db.commit()

    detected = [k for k, v in final.items() if v is True]
    return {
        "menu_id": menu_id,
        "menu_name": menu.name,
        "allergens": final,
        "detected_from_ingredients": detected,
        "ingredient_count": len(menu_ings),
    }


# ── 食材のアレルゲン保存 ──────────────────────────────────────

@router.patch("/ingredients/{ingredient_id}")
def save_ingredient_allergens(
    ingredient_id: int,
    payload: AllergenSaveRequest,
    db: Session = Depends(get_db),
):
    """食材のアレルゲンマップを保存"""
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    ing.allergens = json.dumps(payload.allergens, ensure_ascii=False)
    db.commit()
    return {"ingredient_id": ingredient_id, "allergens": payload.allergens, "saved": True}
