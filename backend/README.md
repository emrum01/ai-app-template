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
│   │   └── hello.py              # Hello World API
│   ├── core/                     # コア設定（予定）
│   ├── models/                   # データモデル（予定）
│   ├── schemas/                  # Pydanticスキーマ（予定）
│   ├── services/                 # ビジネスロジック（予定）
│   ├── utils/                    # ユーティリティ（予定）
│   ├── __init__.py
│   └── main.py                   # アプリケーションエントリーポイント
├── scripts/                      # スクリプト
│   └── generate-types.sh         # TypeScript型生成スクリプト
├── src/                          # ソースコード（予定）
│   └── ai_app_backend/
├── tests/                        # テストファイル
│   ├── api/                      # API テスト（予定）
│   ├── core/                     # コア機能テスト（予定）
│   ├── models/                   # モデルテスト（予定）
│   ├── schemas/                  # スキーマテスト（予定）
│   ├── services/                 # サービステスト（予定）
│   ├── utils/                    # ユーティリティテスト（予定）
│   ├── __init__.py
│   └── test_hello.py             # Hello API テスト
├── .env.example                  # 環境変数テンプレート（予定）
├── .gitignore                    # Git除外設定
├── pyproject.toml                # プロジェクト設定
├── README.md                     # このファイル
├── run_dev.py                    # 開発サーバー起動スクリプト
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
# .envファイルを作成してSupabaseの設定を追加（予定）
# cp .env.example .env
```

### 3. 開発サーバーの起動

```bash
# 開発サーバー（自動リロード）
rye run python run_dev.py

# または直接uvicornを使用
rye run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 本番サーバー
rye run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

サーバーは http://localhost:8000 で起動します。

## 📚 API ドキュメント

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

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
rye test

# 特定のテスト実行
rye test tests/test_hello.py

# カバレッジ付きテスト実行
rye test --cov=app
```

## 🔄 TypeScript型生成フロー

FastAPIのOpenAPIスキーマからTypeScriptクライアントコードを自動生成するフローです。

### 前提条件

```bash
# フロントエンドディレクトリでopenapi-typescript-codegenをインストール
cd ../frontend
npm install -g openapi-typescript-codegen
```

### 1. バックエンドサーバー起動

```bash
# バックエンドディレクトリでサーバーを起動
cd backend
rye run python run_dev.py
```

### 2. TypeScriptクライアントコードの生成

```bash
# 自動化スクリプトを使用
cd backend
./scripts/generate-types.sh
```

または手動で実行：

```bash
# OpenAPIスキーマを取得
curl -s http://localhost:8000/openapi.json > openapi.json

# TypeScriptクライアントを生成
cd ../frontend
openapi --input ../backend/openapi.json --output src/api-client --client fetch
```

### 3. 生成されるファイル構造

```
frontend/src/api-client/
├── index.ts              # メインエクスポート
├── core/                 # コア機能
│   ├── ApiError.ts       # エラーハンドリング
│   ├── CancelablePromise.ts # キャンセル可能なPromise
│   ├── OpenAPI.ts        # 設定
│   └── request.ts        # リクエスト処理
├── models/               # 型定義
│   ├── HTTPValidationError.ts
│   └── ValidationError.ts
└── services/             # APIサービス
    ├── DefaultService.ts # 基本API（/, /health）
    └── HelloService.ts   # Hello API
```

### 4. 使用例

```typescript
// APIクライアントの設定
import { OpenAPI } from './api-client';
OpenAPI.BASE = 'http://localhost:8000';

// API呼び出し
import { HelloService, DefaultService } from './api-client';

// Hello World API
const helloResponse = await HelloService.helloWorldApiHelloGet();

// 名前付きHello API
const namedHello = await HelloService.helloNameApiHelloNameGet('TestUser');

// ヘルスチェック
const health = await DefaultService.healthCheckHealthGet();
```

### 5. 注意事項

- **型生成のタイミング**: APIエンドポイントを変更した後は必ず型生成を実行
- **バージョン管理**: 生成されたファイルは`.gitignore`に追加することを推奨
- **手動編集禁止**: 生成されたファイルは手動で編集しないでください

## 🧪 テスト

```bash
# 全テスト実行
rye test

# カバレッジ付きテスト
rye test --cov=app --cov-report=html

# 特定のテストファイル
rye test tests/test_hello.py
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

### 現在の実装

1. **API Layer** (`app/api/`)
   - FastAPI エンドポイント
   - Hello World API実装

2. **Main Application** (`app/main.py`)
   - FastAPI アプリケーション設定
   - CORS設定
   - ルーター登録

### 今後の拡張予定

1. **Service Layer** (`app/services/`)
   - ビジネスロジック
   - 外部サービス連携
   - データ処理

2. **Model Layer** (`app/models/`)
   - データモデル定義
   - Supabase連携

3. **Schema Layer** (`app/schemas/`)
   - Pydanticスキーマ
   - データバリデーション
   - API ドキュメント生成

4. **Core Layer** (`app/core/`)
   - 設定管理
   - セキュリティ設定
   - ログ設定

### 設計原則

- **依存性注入**: サービス間の疎結合
- **型安全性**: 全関数に型ヒント
- **エラーハンドリング**: 統一されたエラー処理
- **テスト容易性**: モック可能な設計
- **スケーラビリティ**: モジュール化された構造

## 🔐 Supabase設定（予定）

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
