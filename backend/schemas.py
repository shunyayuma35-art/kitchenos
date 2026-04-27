from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ─── Menu ────────────────────────────────────────────────
class MenuStepCreate(BaseModel):
    step: int
    task_type: str
    description: str
    image_url: Optional[str] = None
    estimated_time_seconds: Optional[int] = None
    auto_next: bool = False
    required_checklist: Optional[str] = None  # JSON array string


class MenuStepOut(BaseModel):
    id: int
    menu_id: int
    step: int
    task_type: str
    description: str
    image_url: Optional[str]
    estimated_time_seconds: Optional[int]
    auto_next: bool
    required_checklist: Optional[str]

    model_config = {"from_attributes": True}


class MenuCreate(BaseModel):
    name: str
    category: Optional[str] = None
    steps: List[MenuStepCreate] = []


class MenuUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    steps: Optional[List[MenuStepCreate]] = None


class MenuOut(BaseModel):
    id: int
    name: str
    category: Optional[str]
    is_active: bool
    created_at: datetime
    steps: List[MenuStepOut] = []

    model_config = {"from_attributes": True}


# ─── Task ────────────────────────────────────────────────
class TaskCreate(BaseModel):
    step: int
    task_type: str


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    assigned_staff: Optional[str] = None
    completed_by: Optional[str] = None
    photo_url: Optional[str] = None
    note: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    order_item_id: int
    step: int
    task_type: str
    description: Optional[str]
    status: str
    assigned_station: Optional[str]
    assigned_staff: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    completed_by: Optional[str]
    created_at: datetime
    estimated_time_seconds: Optional[int] = None
    auto_next: bool = False
    required_checklist: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── OrderItem ───────────────────────────────────────────
class OrderItemCreate(BaseModel):
    menu_name: str
    quantity: int = 1
    note: Optional[str] = None
    tasks: List[TaskCreate] = []


class OrderItemOut(BaseModel):
    id: int
    order_id: int
    menu_name: str
    quantity: int
    note: Optional[str]
    tasks: List[TaskOut] = []

    model_config = {"from_attributes": True}


# ─── Order ───────────────────────────────────────────────
class OrderCreate(BaseModel):
    table_number: str
    items: List[OrderItemCreate]


class OrderOut(BaseModel):
    id: int
    table_number: str
    status: str
    priority: int
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


# ─── PrepTask ────────────────────────────────────────────
class PrepTaskCreate(BaseModel):
    step: int
    description: str


class PrepTaskUpdate(BaseModel):
    status: Optional[str] = None
    assigned_staff: Optional[str] = None
    completed_by: Optional[str] = None


class PrepTaskOut(BaseModel):
    id: int
    prep_work_id: int
    step: int
    description: str
    status: str
    assigned_staff: Optional[str]
    completed_at: Optional[datetime]
    completed_by: Optional[str]

    model_config = {"from_attributes": True}


# ─── PrepWork ────────────────────────────────────────────
class PrepWorkCreate(BaseModel):
    name: str
    date: str
    priority: int = 0
    tasks: List[PrepTaskCreate] = []


class PrepWorkOut(BaseModel):
    id: int
    name: str
    date: str
    status: str
    priority: int
    created_at: datetime
    tasks: List[PrepTaskOut] = []

    model_config = {"from_attributes": True}


# ─── CompletionLog ───────────────────────────────────────
class CompletionLogOut(BaseModel):
    id: int
    staff_name: str
    task_type: str
    description: str
    start_time: Optional[datetime]
    end_time: datetime
    duration_seconds: Optional[int]
    photo_url: Optional[str]
    note: Optional[str]

    model_config = {"from_attributes": True}


# ─── Inventory ───────────────────────────────────────────
class IngredientCreate(BaseModel):
    name: str
    unit: str = "g"
    current_stock: float = 0.0
    min_stock_alert: float = 0.0


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[float] = None
    min_stock_alert: Optional[float] = None


class IngredientOut(BaseModel):
    id: int
    name: str
    unit: str
    current_stock: float
    min_stock_alert: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MenuIngredientCreate(BaseModel):
    ingredient_id: int
    quantity_per_serving: float


class MenuIngredientOut(BaseModel):
    id: int
    menu_id: int
    ingredient_id: int
    quantity_per_serving: float
    ingredient: IngredientOut

    model_config = {"from_attributes": True}


class InventoryLogOut(BaseModel):
    id: int
    ingredient_id: int
    change_amount: float
    reason: str
    order_id: Optional[int]
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StockAdjust(BaseModel):
    amount: float        # 追加量（正: 入荷, 負: 廃棄）
    reason: str = "入荷"
    note: Optional[str] = None


# ─── CookingHistory ─────────────────────────────────────
class StepCompletePayload(BaseModel):
    """POST /api/steps/complete のリクエストボディ"""
    order_id: Optional[int] = None
    item_id: Optional[str] = None     # order_item_id (文字列でも受け付け)
    step_id: Optional[str] = None     # ステップ番号
    station: str
    staff_id: str
    completed_at: str                 # ISO8601形式


class CookingHistoryOut(BaseModel):
    id: int
    order_id: Optional[int]
    order_item_id: Optional[int]
    step: Optional[int]
    task_type: str
    station: str
    staff_id: str
    menu_name: Optional[str]
    table_number: Optional[str]
    completed_at: datetime
    duration_seconds: Optional[int]
    status: str
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StaffReportItem(BaseModel):
    staff_id: str
    task_count: int
    avg_duration_seconds: Optional[float]
    total_duration_seconds: int
    station_breakdown: dict           # station -> count
    task_type_breakdown: dict         # task_type -> count


class StationReportItem(BaseModel):
    station: str
    task_count: int
    avg_duration_seconds: Optional[float]


class DailyReportOut(BaseModel):
    date: str
    total_tasks: int
    staff_reports: List[StaffReportItem]
    station_reports: List[StationReportItem]
    avg_duration_seconds: Optional[float]


class MonthlyReportOut(BaseModel):
    year: int
    month: int
    total_tasks: int
    staff_reports: List[StaffReportItem]
    station_reports: List[StationReportItem]
    avg_duration_seconds: Optional[float]
    daily_summary: List[dict]         # [{date, count}]


# ─── AI Timing Prediction ────────────────────────────────
class SideDishTiming(BaseModel):
    """サイドメニューの最適開始タイミング"""
    item_type: str          # rice / soup / side / drink
    start_in_seconds: int   # 今から何秒後に開始すべきか
    reason: str             # 理由（例: "メイン完成の5分前"）


class TaskTimingInfo(BaseModel):
    """注文内の1タスクの予測情報"""
    task_id: int
    order_item_id: int
    menu_name: str
    step: int
    task_type: str
    station: str
    status: str
    predicted_finish_at: Optional[str]    # ISO datetime
    estimated_remaining_seconds: int
    delay_risk: bool                       # 遅延リスクあり
    temperature_risk: bool                 # 冷める危険あり
    assigned_staff: Optional[str]
    recommended_staff: Optional[str]       # AI推奨スタッフ


class TimingPredictionResponse(BaseModel):
    """POST /api/predict/timing のレスポンス"""
    order_id: int
    table_number: str
    predicted_completion_at: str           # 全品完成予測時刻 (ISO)
    estimated_total_seconds: int
    delay_risk: bool
    station_load: dict                     # station -> load_level
    tasks: List[TaskTimingInfo]
    side_dish_timings: List[SideDishTiming]
    generated_at: str


class TimingPredictRequest(BaseModel):
    order_id: int
    staff_id: Optional[str] = None        # 担当スタッフID（省略可）


# ─── Tasks Now (今やるべきこと) ────────────────────────────
class TaskNowItem(BaseModel):
    """「今やるべきこと」1件"""
    task_id: int
    order_id: int
    order_item_id: int
    table_number: str
    menu_name: str
    step: int
    task_type: str
    station: str
    status: str
    priority_score: float                  # 高いほど緊急
    priority_label: str                    # "🔴 緊急" / "🟠 要注意" / "🟢 通常"
    estimated_remaining_seconds: int
    elapsed_seconds: int
    is_delayed: bool
    delay_seconds: int
    temperature_danger: bool               # 10分以上前に調理完了した場合
    assigned_staff: Optional[str]
    recommended_staff: Optional[str]
    action: str                            # "今すぐ開始" / "間もなく" / "準備"
    side_dish_alert: bool                  # メイン完成でサイドを今すぐ作るべき


class TasksNowResponse(BaseModel):
    """GET /api/tasks/now のレスポンス"""
    generated_at: str
    total_urgent: int
    total_warning: int
    total_normal: int
    by_station: dict                       # station -> List[TaskNowItem]
    all_tasks: List[TaskNowItem]
    alerts: List[str]                      # 全体アラートメッセージ


# ─── Station Alert ───────────────────────────────────────
class StationAlertPayload(BaseModel):
    """ステーション間アラートのWebSocketペイロード"""
    type: str = "station_alert"
    order_id: int
    table_number: str
    message: str
    targets: List[str]                     # ["rice","soup","side","drink"]
    urgency: str = "normal"               # normal / warning / critical


# ─── WebSocket ───────────────────────────────────────────
class WSMessage(BaseModel):
    type: str
    data: dict
