# AI App Backend

FastAPI + Supabase を使用したAI開発向けバックエンドテンプレート

## 🚀 特徴

- **FastAPI**: 高速なWeb APIフレームワーク
- **Supabase**: 認証・データベース・リアルタイム機能
- **Rye + uv**: モダンなPythonパッケージ管理
- **型安全性**: Pydantic + MyPy
- **コード品質**: Black + isort + Ruff
- **テスト**: pytest + カバレッジ
- **開発効率**: 自動リロード、API ドキュメント

## 📁 ディレクトリ構成

```
backend/
├── app/                          # メインアプリケーション
│   ├── api/                      # API エンドポイント
│   │   ├── __init__.py
│   │   ├── auth.py               # 認証関連エンドポイント
│   │   ├── health.py             # ヘルスチェック
│   │   └── v1/                   # API v1
│   │       ├── __init__.py
│   │       └── endpoints/        # 各機能のエンドポイント
│   ├── core/                     # コア設定
│   │   ├── __init__.py
│   │   ├── config.py             # 環境設定
│   │   ├── security.py           # セキュリティ設定
│   │   └── logging.py            # ログ設定
│   ├── models/                   # データモデル
│   │   ├── __init__.py
│   │   └── user.py               # ユーザーモデル
│   ├── schemas/                  # Pydanticスキーマ
│   │   ├── __init__.py
│   │   ├── auth.py               # 認証スキーマ
│   │   └── user.py               # ユーザースキーマ
│   ├── services/                 # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── auth_service.py       # 認証サービス
│   │   └── supabase_service.py   # Supabase連携
│   ├── utils/                    # ユーティリティ
│   │   ├── __init__.py
│   │   └── helpers.py            # ヘルパー関数
│   ├── __init__.py
│   └── main.py                   # アプリケーションエントリーポイント
├── tests/                        # テストファイル
│   ├── api/                      # API テスト
│   ├── core/                     # コア機能テスト
│   ├── models/                   # モデルテスト
│   ├── schemas/                  # スキーマテスト
│   ├── services/                 # サービステスト
│   ├── utils/                    # ユーティリティテスト
│   ├── conftest.py               # pytest設定
│   └── fixtures/                 # テストフィクスチャ
├── .env.example                  # 環境変数テンプレート
├── .gitignore                    # Git除外設定
├── pyproject.toml                # プロジェクト設定
├── README.md                     # このファイル
└── .python-version               # Python バージョン
```

## 🛠️ セットアップ

### 前提条件

- Python 3.11+
- Rye
- uv

### 1. 依存関係のインストール

```bash
cd backend
rye sync
```

### 2. 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集してSupabaseの設定を追加
```

### 3. 開発サーバーの起動

```bash
# 開発サーバー（自動リロード）
rye run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 本番サーバー
rye run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

サーバーは http://localhost:8000 で起動します。

## 📚 API ドキュメント

- **Swagger UI**: http://localhost:8000/docs

## 🚀 Hello World API

Hello World APIが実装されており、以下のエンドポイントが利用可能です：

### エンドポイント

- `GET /` - ルートエンドポイント
- `GET /health` - ヘルスチェック
- `GET /api/hello` - Hello World API
- `GET /api/hello/{name}` - 名前付きHello World API

### 使用例

```bash
# ルートエンドポイント
curl http://localhost:8000/

# ヘルスチェック
curl http://localhost:8000/health

# Hello World API
curl http://localhost:8000/api/hello

# 名前付きHello World API
curl http://localhost:8000/api/hello/YourName
```

### テスト実行

```bash
# 全テスト実行
rye run pytest

# 特定のテスト実行
rye run pytest tests/test_hello.py

# カバレッジ付きテスト実行
rye run pytest --cov=app
```
- **ReDoc**: http://localhost:8000/redoc

## 🧪 テスト

```bash
# 全テスト実行
rye test

# カバレッジ付きテスト
rye test --cov=app --cov-report=html

# 特定のテストファイル
rye test tests/api/test_auth.py
```

## 🔧 開発ツール

```bash
# コードフォーマット
rye fmt

# リント
rye lint

# リントエラー自動修正
rye lint --fix

# 型チェック
rye run mypy .

# 全チェック実行
rye fmt && rye lint && rye run mypy .
```

## 🏗️ アーキテクチャ

### レイヤー構成

1. **API Layer** (`app/api/`)
   - FastAPI エンドポイント
   - リクエスト/レスポンス処理
   - バリデーション

2. **Service Layer** (`app/services/`)
   - ビジネスロジック
   - 外部サービス連携
   - データ処理

3. **Model Layer** (`app/models/`)
   - データモデル定義
   - Supabase連携

4. **Schema Layer** (`app/schemas/`)
   - Pydanticスキーマ
   - データバリデーション
   - API ドキュメント生成

### 設計原則

- **依存性注入**: サービス間の疎結合
- **型安全性**: 全関数に型ヒント
- **エラーハンドリング**: 統一されたエラー処理
- **テスト容易性**: モック可能な設計
- **スケーラビリティ**: モジュール化された構造

## 🔐 Supabase設定

### 必要な環境変数

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET_KEY=your_jwt_secret
```

### データベース設定

Supabaseダッシュボードで以下の設定を行ってください：

1. **認証設定**
   - メール認証の有効化
   - パスワードポリシーの設定

2. **データベース設定**
   - 必要なテーブルの作成
   - RLS (Row Level Security) の設定

3. **API設定**
   - CORS設定
   - レート制限の設定

## 🚀 デプロイ

### 本番環境

```bash
# 本番用ビルド
rye build

# 本番サーバー起動
rye run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Dockerイメージビルド
docker build -t ai-app-backend .

# コンテナ起動
docker run -p 8000:8000 ai-app-backend
```

## 📝 開発ガイドライン

### コード規約

- **Black**: コードフォーマット
- **isort**: import文の整理
- **Ruff**: リント
- **MyPy**: 型チェック

### コミット規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

## 🤝 コントリビューション

1. 機能ブランチを作成
2. 変更を実装
3. テストを追加・実行
4. コードレビューを依頼
5. マージ

## 📄 ライセンス

MIT License
