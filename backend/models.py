from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import relationship
from database import Base
import enum


class OrderStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


# ─── メニューマスター ──────────────────────────────────────
class Menu(Base):
    """管理者が登録するメニューマスター"""
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)        # 例: 鍋物・定食・惣菜
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    steps = relationship("MenuStep", back_populates="menu",
                         cascade="all, delete-orphan", order_by="MenuStep.step")
    menu_ingredients = relationship("MenuIngredient", back_populates="menu",
                                    cascade="all, delete-orphan")


class MenuStep(Base):
    """メニューの調理手順"""
    __tablename__ = "menu_steps"

    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    step = Column(Integer, nullable=False)
    task_type = Column(String, nullable=False)       # 調理 / 盛付 / 仕込み
    description = Column(String, nullable=False)
    image_url = Column(String, nullable=True)        # 手順画像URL
    estimated_time_seconds = Column(Integer, nullable=True)   # 目安時間(秒)
    auto_next = Column(Boolean, default=False)        # タイマー完了時に自動進行
    required_checklist = Column(String, nullable=True)        # JSON配列: ["確認1","確認2"]

    menu = relationship("Menu", back_populates="steps")


# ─── 注文 ───────────────────────────────────────────────
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String, nullable=False)
    status = Column(String, default=OrderStatus.pending)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    note = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")
    tasks = relationship("Task", back_populates="order_item", cascade="all, delete-orphan")


# ─── タスク ─────────────────────────────────────────────
class Task(Base):
    """注文から生成されるタスク（調理 / 盛付 / 仕込み）"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=False)
    step = Column(Integer, nullable=False)
    task_type = Column(String, nullable=False)
    status = Column(String, default=TaskStatus.pending)
    description = Column(String, nullable=True)        # 調理手順の詳細
    assigned_station = Column(String, nullable=True)
    assigned_staff = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)      # start_time
    completed_at = Column(DateTime, nullable=True)    # end_time
    completed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    estimated_time_seconds = Column(Integer, nullable=True)   # 目安時間(秒)
    auto_next = Column(Boolean, default=False)        # タイマー完了時に自動進行
    required_checklist = Column(String, nullable=True)        # JSON配列: ["確認1","確認2"]

    order_item = relationship("OrderItem", back_populates="tasks")
    completion_log = relationship("CompletionLog", back_populates="task", uselist=False)


# ─── 仕込み ─────────────────────────────────────────────
class PrepWork(Base):
    __tablename__ = "prep_works"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)            # YYYY-MM-DD
    status = Column(String, default=TaskStatus.pending)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("PrepTask", back_populates="prep_work", cascade="all, delete-orphan")


class PrepTask(Base):
    __tablename__ = "prep_tasks"

    id = Column(Integer, primary_key=True, index=True)
    prep_work_id = Column(Integer, ForeignKey("prep_works.id"), nullable=False)
    step = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default=TaskStatus.pending)
    assigned_staff = Column(String, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String, nullable=True)

    prep_work = relationship("PrepWork", back_populates="tasks")


# ─── 完了ログ ────────────────────────────────────────────
class CompletionLog(Base):
    """誰が・いつ・何を完了したか — クレーム対応・品質管理に使用"""
    __tablename__ = "completion_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    prep_task_id = Column(Integer, nullable=True)
    staff_name = Column(String, nullable=False)       # user
    task_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=True)      # 作業開始時刻
    end_time = Column(DateTime, default=datetime.utcnow)  # 作業完了時刻
    duration_seconds = Column(Integer, nullable=True)
    photo_url = Column(String, nullable=True)         # 盛付写真URL
    note = Column(String, nullable=True)

    task = relationship("Task", back_populates="completion_log")


# ─── 在庫管理 ────────────────────────────────────────────
class Ingredient(Base):
    """食材マスター（在庫管理）"""
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)             # 例: 豚肉, 醤油
    unit = Column(String, nullable=False, default="g")  # g / ml / 個 / 枚 / etc
    current_stock = Column(Float, default=0.0)        # 現在庫量
    min_stock_alert = Column(Float, default=0.0)      # この量を下回ったらアラート
    category = Column(String, nullable=True, default="その他")  # 野菜類/肉類/魚介類 etc
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    menu_ingredients = relationship("MenuIngredient", back_populates="ingredient",
                                    cascade="all, delete-orphan")
    logs = relationship("InventoryLog", back_populates="ingredient",
                        cascade="all, delete-orphan")


class MenuIngredient(Base):
    """メニューと食材の紐付け（1人前あたりの使用量）"""
    __tablename__ = "menu_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity_per_serving = Column(Float, nullable=False)  # 1人前あたりの使用量

    menu = relationship("Menu", back_populates="menu_ingredients")
    ingredient = relationship("Ingredient", back_populates="menu_ingredients")


class InventoryLog(Base):
    """在庫変動履歴（入荷・使用・廃棄）"""
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    change_amount = Column(Float, nullable=False)     # 正: 入荷, 負: 使用/廃棄
    reason = Column(String, nullable=False)           # 入荷 / 注文使用 / 廃棄 / 手動調整
    order_id = Column(Integer, nullable=True)         # 注文による使用の場合
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ingredient = relationship("Ingredient", back_populates="logs")


# ─── 調理履歴（改ざん防止・品質管理） ─────────────────────────
class CookingHistory(Base):
    """誰が・いつ・どの料理を作ったか — スタッフ評価・クレーム対応・品質管理に使用。
    created_at は自動付与・手動編集不可。"""
    __tablename__ = "cooking_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, index=True)
    order_item_id = Column(Integer, nullable=True)     # OrderItem.id
    step = Column(Integer, nullable=True)              # 手順番号
    task_type = Column(String, nullable=False)         # 調理 / 盛付 / 仕込み
    station = Column(String, nullable=False)           # cooking / plating / prep
    staff_id = Column(String, nullable=False, index=True)  # スタッフ名
    menu_name = Column(String, nullable=True)          # 料理名
    table_number = Column(String, nullable=True)       # テーブル番号
    completed_at = Column(DateTime, nullable=False)         # 完了時刻
    duration_seconds = Column(Integer, nullable=True)       # 作業時間（秒）
    status = Column(String, default="completed")            # completed / cancelled
    note = Column(String, nullable=True)                    # 備考
    created_at = Column(DateTime, default=datetime.utcnow)  # 自動付与・変更不可
    # ── AI タイミング予測フィールド ──────────────────────────
    predicted_finish_time = Column(DateTime, nullable=True)  # AI予測完了時刻
    actual_finish_time = Column(DateTime, nullable=True)     # 実際の完了時刻
    delay_seconds = Column(Integer, nullable=True)           # 遅延秒数（負=早い）

    order = relationship("Order")


# ─── AI タスクキャッシュ ──────────────────────────────────
class TasksNowCache(Base):
    """「今やるべきこと」AI生成キャッシュ — ステーション別"""
    __tablename__ = "tasks_now_cache"

    id = Column(Integer, primary_key=True, index=True)
    station = Column(String, nullable=False, unique=True, index=True)
    task_list = Column(Text, nullable=False, default="[]")  # JSON配列
    generated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ─── スタッフ速度プロファイル（AI学習用） ────────────────────
class StaffSpeedProfile(Base):
    """スタッフごと・ステーションごとの作業速度倍率をキャッシュ"""
    __tablename__ = "staff_speed_profiles"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String, nullable=False, index=True)
    station = Column(String, nullable=False)
    # speed_ratio: 1.0=平均, 0.8=20%速い, 1.2=20%遅い
    speed_ratio = Column(Float, default=1.0)
    sample_count = Column(Integer, default=0)
    avg_duration_seconds = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
