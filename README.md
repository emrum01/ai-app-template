# AI App Template

AI-powered rapid app generation template with React, TypeScript, Tailwind CSS, and FastAPI.

## ✨ 新機能: 画像生成機能

AIを活用した画像生成機能が追加されました！詳細は[画像生成機能の実装プロンプト](prompts/implementation/image-generation.md)を参照してください。

### 主な機能
- **Text-to-Image生成**: プロンプトから画像を生成
- **スタイルプリセット**: アニメ、写真、デジタルアートなど15種類のスタイル
- **サイズとアスペクト比の選択**: カスタマイズ可能な画像サイズ
- **プロンプト最適化**: AIによるプロンプトの強化と提案
- **画像ギャラリー**: 生成した画像の管理と表示

## 🚀 クイックスタート

### 環境構築の自動化

プロジェクトには環境構築を自動化するスクリプトが含まれています：

#### macOS/Linux
```bash
# 環境構築スクリプトを実行
./scripts/setup.sh

# 開発サーバーを起動
./scripts/dev.sh
```

~~~~### 手動セットアップ

#### 前提条件
- **Node.js** (v18以上推奨)
- **Python** (v3.11以上)
- **Git**
- **Bun** (推奨、高速なJavaScriptランタイム)

#### フロントエンド
```bash
cd frontend
bun install  # または npm install
bun run dev  # または npm run dev
```

#### バックエンド
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

## 📁 プロジェクト構造

```
ai-app-template/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Reactコンポーネント
│   │   ├── api-client/      # APIクライアント
│   │   └── store/          # Zustandストア
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI + Python
│   ├── app/
│   │   ├── api/            # APIエンドポイント
│   │   ├── models/         # データモデル
│   │   ├── schemas/        # Pydanticスキーマ
│   │   └── services/       # ビジネスロジック
│   ├── pyproject.toml
│   └── requirements.lock
├── scripts/                  # 環境構築スクリプト
│   ├── setup.sh            # macOS/Linux環境構築
│   ├── dev.sh              # macOS/Linux開発サーバー
│   └── README.md           # スクリプト詳細説明
└── shared/                  # 共有リソース
```

## 🛠️ 技術スタック

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全なJavaScript
- **Vite** - 高速なビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **Zustand** - 軽量な状態管理
- **Bun** - 高速なJavaScriptランタイム
- **Biome** - 高速なリンター・フォーマッター
- **Playwright** - E2Eテスト

### バックエンド
- **FastAPI** - 高速なPython Webフレームワーク
- **Pydantic** - データバリデーション
- **Uvicorn** - ASGIサーバー
- **Supabase** - バックエンドサービス
- **Python 3.11+** - プログラミング言語

### 開発ツール
- **VS Code** - 推奨エディタ
- **Black** - Pythonコードフォーマッター
- **Ruff** - 高速なPythonリンター
- **MyPy** - Python型チェッカー
- **Pre-commit** - Gitフック

## 🔧 開発コマンド

### フロントエンド
```bash
cd frontend

# 開発サーバー起動
bun run dev

# ビルド
bun run build

# リンター
bun run lint

# フォーマット
bun run format

# テスト
bun run test

# E2Eテスト
bun run test:e2e
```

### バックエンド
```bash
cd backend

# 開発サーバー起動
uvicorn app.main:app --reload

# テスト
pytest

# リンター
ruff check .

# フォーマット
black .
isort .

# 型チェック
mypy .
```

## 🌐 API ドキュメント

開発サーバー起動後、以下のURLでAPIドキュメントにアクセスできます：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔒 環境変数

### フロントエンド (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=AI App Template
```

### バックエンド (.env)
```env
APP_NAME=AI App Template
DEBUG=true
LOG_LEVEL=INFO

# Database (Supabase)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## 📝 環境構築スクリプトの詳細

環境構築スクリプトは以下の機能を提供します：

### 自動化される処理
1. **Node.js/Bunのインストール確認**
2. **Pythonのインストール確認**
3. **Git設定の確認と設定支援**
4. **フロントエンド・バックエンド依存関係のインストール**
5. **環境変数ファイルの作成**
6. **VS Code拡張機能の推奨設定**
7. **開発用スクリプトの作成**

### 推奨VS Code拡張機能
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Python
- Black Formatter
- Ruff
- MyPy Type Checker
- ESLint
- Biome
- Git Graph
- GitLens
- Docker
- Remote Containers

詳細は [`scripts/README.md`](scripts/README.md) を参照してください。

## 🧪 テスト

### フロントエンド
```bash
cd frontend

# ユニットテスト
bun run test

# E2Eテスト
bun run test:e2e

# カバレッジ
bun run test --coverage
```

### バックエンド
```bash
cd backend

# テスト実行
pytest

# カバレッジ付きテスト
pytest --cov=app --cov-report=html

# 特定のテストファイル
pytest tests/test_hello.py
```

## 🚀 デプロイ

### フロントエンド
```bash
cd frontend
bun run build
```

### バックエンド
```bash
cd backend
pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミットメッセージ規約
[Conventional Commits](https://www.conventionalcommits.org/) に従ってください：

- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメントのみの変更
- `style:` - コードの意味に影響しない変更
- `refactor:` - バグ修正や機能追加ではないコードの変更
- `test:` - テストの追加や修正
- `chore:` - ビルドプロセスや補助ツールの変更

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. [環境構築スクリプトのREADME](scripts/README.md)
2. [トラブルシューティングガイド](scripts/README.md#トラブルシューティング)
3. [Issuesページ](https://github.com/your-username/ai-app-template/issues)

## 🔗 リンク

- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Bun Documentation](https://bun.sh/) 