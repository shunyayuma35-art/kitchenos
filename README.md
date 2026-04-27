# Kitchen AI App

多言語対応・厨房オペレーション自動化アプリ

## 機能

- **オーダー連動** — 注文と同時に調理/盛付/仕込みへリアルタイム配信（WebSocket）
- **仕込み管理** — 仕込み作業の登録・進捗管理・担当者割当
- **完了保存** — 誰が・いつ・何を完了したか自動記録
- **多言語対応** — 日本語 / Tiếng Việt / नेपाली / Bahasa Indonesia / မြန်မာဘာသာ
- **音声通知** — 作業完了・新規注文をブラウザ音声で通知

## 事前準備（初回のみ）

- **Python 3.10+** — venv 環境にインストール済み
- **Node.js 18+** — https://nodejs.org からインストール（まだの場合）

## 起動方法

### バックエンド（FastAPI）

```bash
# プロジェクトルートから
cd backend
pip install -r requirements.txt   # 初回のみ
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

→ http://localhost:8000/docs でAPIドキュメント確認可能

### フロントエンド（React + Vite）

```bash
cd frontend
npm install   # 初回のみ
npm run dev
```

→ http://localhost:5173 で画面を開く

> **注意**: バックエンドを先に起動してからフロントエンドを起動してください

## 使い方

1. ブラウザで `http://localhost:5173` を開く
2. **言語**・**スタッフ名**・**ステーション**を選択して「作業開始」
3. ステーションごとの画面:
   - `調理` → 調理タスクのみ表示
   - `盛付` → 盛付タスクのみ表示
   - `仕込み` → 仕込み作業リスト
   - `管理` → 全タスク + 注文登録 + 完了ログ

## ディレクトリ構成

```
kitchen_ai_app/
├── backend/
│   ├── main.py              # FastAPI アプリ本体・WebSocket
│   ├── models.py            # DB モデル（Order / Task / PrepWork / Log）
│   ├── schemas.py           # Pydantic スキーマ
│   ├── database.py          # SQLite 接続設定
│   ├── websocket_manager.py # WebSocket 接続管理
│   ├── requirements.txt
│   └── routers/
│       ├── orders.py        # 注文・タスク API
│       └── prep.py          # 仕込み API
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── SetupScreen.tsx   # 初期設定画面
    │   │   ├── StationView.tsx   # メイン画面（タブ切替）
    │   │   ├── OrderBoard.tsx    # 注文ボード
    │   │   ├── PrepBoard.tsx     # 仕込みボード
    │   │   ├── TaskCard.tsx      # タスクカード
    │   │   ├── CompletionLog.tsx # 完了ログ
    │   │   ├── NewOrderForm.tsx  # 注文登録フォーム
    │   │   └── LanguageSelector.tsx
    │   ├── hooks/
    │   │   ├── useWebSocket.ts   # WebSocket 接続・自動再接続
    │   │   └── useVoice.ts       # 音声通知
    │   ├── i18n/
    │   │   └── translations.ts   # 5言語翻訳テーブル
    │   └── types/
    │       └── index.ts
    └── package.json
```

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| POST | /api/orders/ | 注文登録 |
| GET | /api/orders/ | 注文一覧 |
| PATCH | /api/orders/tasks/{id}/start | タスク開始 |
| PATCH | /api/orders/tasks/{id}/complete | タスク完了 |
| GET | /api/orders/logs/ | 完了ログ |
| POST | /api/prep/ | 仕込み登録 |
| GET | /api/prep/ | 仕込み一覧 |
| PATCH | /api/prep/tasks/{id}/start | 仕込み開始 |
| PATCH | /api/prep/tasks/{id}/complete | 仕込み完了 |
| WS | /ws/{station} | WebSocket接続 |

## WebSocket ステーション

- `/ws/cooking` — 調理担当
- `/ws/plating` — 盛付担当
- `/ws/prep` — 仕込み担当
- `/ws/admin` — 管理・全体表示
