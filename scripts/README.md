# 環境構築スクリプト

このディレクトリには、AI App Templateプロジェクトの環境構築を自動化するスクリプトが含まれています。

## スクリプト一覧

### 1. `setup.sh` (macOS/Linux用)
- Node.js/Bunのインストール確認
- Pythonのインストール確認
- Git設定の確認と設定支援
- フロントエンド・バックエンド依存関係のインストール
- 環境変数ファイルの作成
- VS Code拡張機能の推奨設定
- 開発用スクリプトの作成

### 3. `dev.sh` (macOS/Linux用)
- フロントエンド・バックエンドサーバーの同時起動
- プロセス管理とクリーンアップ機能

## 使用方法

### macOS/Linux環境

```bash
# 環境構築スクリプトを実行
./scripts/setup.sh

# 開発サーバーを起動
./scripts/dev.sh
```

## 前提条件

### 必須ソフトウェア
- **Node.js** (v18以上推奨)
- **Python** (v3.11以上)
- **Git**

### 推奨ソフトウェア
- **Bun** (高速なJavaScriptランタイム)
- **VS Code** (推奨エディタ)

## インストール方法

### Node.js
```bash
# macOS (Homebrew)
brew install node

# macOS (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows (Chocolatey)
choco install nodejs

# Windows (Scoop)
scoop install nodejs
```

### Python
```bash
# macOS (Homebrew)
brew install python
```

### Bun
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

## スクリプトの動作

### 環境構築スクリプト (`setup.sh`)

1. **環境確認**
   - Node.js/Bunのインストール状況を確認
   - Pythonのインストール状況を確認
   - Gitの設定状況を確認

2. **依存関係インストール**
   - フロントエンド: `bun install` または `npm install`
   - バックエンド: Python仮想環境作成 + `pip install -e ".[dev]"`

3. **環境変数設定**
   - `frontend/.env` ファイルの作成
   - `backend/.env` ファイルの作成

4. **VS Code設定**
   - `.vscode/extensions.json` の作成
   - `.vscode/settings.json` の作成

5. **開発用スクリプト作成**
   - `scripts/dev.sh` または `scripts/dev.ps1` の作成

### 開発サーバー起動スクリプト (`dev.sh` / `dev.ps1`)

1. **バックエンドサーバー起動**
   - Python仮想環境をアクティベート
   - uvicornでFastAPIサーバーを起動 (ポート8000)

2. **フロントエンドサーバー起動**
   - Vite開発サーバーを起動 (ポート5173)

3. **プロセス管理**
   - 両サーバーのプロセスIDを記録
   - Ctrl+Cで両サーバーを適切に停止

## トラブルシューティング

### よくある問題

#### 1. 権限エラー
```bash
# スクリプトに実行権限を付与
chmod +x scripts/*.sh
```

#### 2. Python仮想環境の問題
```bash
# 仮想環境を再作成
cd backend
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

#### 3. Node.js/Bunの問題
```bash
# 依存関係を再インストール
cd frontend
rm -rf node_modules
bun install  # または npm install
```

#### 4. ポートが使用中
```bash
# 使用中のポートを確認
lsof -i :8000  # バックエンド
lsof -i :5173  # フロントエンド

# プロセスを停止
kill -9 <PID>
```

### ログの確認

- **フロントエンド**: `frontend/` ディレクトリで `bun run dev` または `npm run dev`
- **バックエンド**: `backend/` ディレクトリで `uvicorn app.main:app --reload`

## カスタマイズ

### 環境変数の追加

`backend/.env` または `frontend/.env` ファイルを編集して、必要な環境変数を追加してください。

### VS Code拡張機能の追加

`.vscode/extensions.json` ファイルを編集して、推奨拡張機能を追加・削除できます。

### 開発サーバーの設定変更

`scripts/dev.sh` または `scripts/dev.ps1` を編集して、ポート番号やその他の設定を変更できます。

## サポート

問題が発生した場合は、以下を確認してください：

1. 前提条件のソフトウェアが正しくインストールされているか
2. スクリプトの実行権限が設定されているか
3. 必要なファイルが存在するか
4. エラーメッセージの詳細を確認

追加のサポートが必要な場合は、プロジェクトのIssuesページで報告してください。 