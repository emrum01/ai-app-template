#!/bin/bash

# AI App Template 環境構築スクリプト
# このスクリプトは開発環境のセットアップを自動化します

set -e  # エラー時にスクリプトを停止

# 色付きの出力用関数
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# ヘッダー表示
echo "=========================================="
echo "  AI App Template 環境構築スクリプト"
echo "=========================================="
echo ""

# 1. Node.js/Bunのインストール確認
print_info "Node.js/Bunのインストール状況を確認中..."

# Node.jsの確認
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js がインストールされています: $NODE_VERSION"
else
    print_error "Node.js がインストールされていません"
    print_info "Node.js のインストール方法:"
    echo "  - macOS: https://nodejs.org/ からダウンロード"
    echo "  - Homebrew: brew install node"
    echo "  - nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Bunの確認
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    print_success "Bun がインストールされています: $BUN_VERSION"
else
    print_warning "Bun がインストールされていません"
    print_info "Bun のインストール方法:"
    echo "  - curl -fsSL https://bun.sh/install | bash"
    echo "  - Homebrew: brew tap oven-sh/bun && brew install bun"
    read -p "Bun をインストールしますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://bun.sh/install | bash
        source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
    fi
fi

# 2. Ryeの確認
print_info "Ryeのインストール状況を確認中..."

if command -v rye &> /dev/null; then
    RYE_VERSION=$(rye --version)
    print_success "Rye がインストールされています: $RYE_VERSION"
else
    print_warning "Rye がインストールされていません"
    print_info "Rye のインストール方法:"
    echo "  - curl -sSf https://rye-up.com/get | bash"
    echo "  - Homebrew: brew install rye"
    read -p "Rye をインストールしますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -sSf https://rye.astral.sh/get | bash
        source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
    fi
fi

# 3. フロントエンド依存関係のインストール
print_info "フロントエンド依存関係をインストール中..."

cd frontend
if [ -f "package.json" ]; then
    if command -v bun &> /dev/null; then
        print_info "Bun を使用して依存関係をインストール中..."
        bun install
    else
        print_info "npm を使用して依存関係をインストール中..."
        npm install
    fi
    print_success "フロントエンド依存関係のインストールが完了しました"
else
    print_error "frontend/package.json が見つかりません"
    exit 1
fi
cd ..

# 4. バックエンド依存関係のインストール
print_info "バックエンド依存関係をインストール中..."

cd backend
if [ -f "pyproject.toml" ]; then
    if command -v rye &> /dev/null; then
        print_info "Rye を使用して依存関係をインストール中..."
        rye sync
        print_success "バックエンド依存関係のインストールが完了しました"
    else
        print_warning "Rye がインストールされていないため、従来の方法を使用します"
        # Python仮想環境の確認と作成
        if [ ! -d ".venv" ]; then
            print_info "Python仮想環境を作成中..."
            python3 -m venv .venv
        fi
        
        # 仮想環境のアクティベート
        print_info "仮想環境をアクティベート中..."
        source .venv/bin/activate
        
        # 依存関係のインストール
        print_info "Python依存関係をインストール中..."
        pip install --upgrade pip
        pip install -e ".[dev]"
        
        print_success "バックエンド依存関係のインストールが完了しました"
    fi
else
    print_error "backend/pyproject.toml が見つかりません"
    exit 1
fi
cd ..

# 6. 環境変数ファイルの作成
print_info "環境変数ファイルをセットアップ中..."

# フロントエンド用の.envファイル
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=AI App Template
EOF
    print_success "frontend/.env ファイルを作成しました"
else
    print_info "frontend/.env ファイルは既に存在します"
fi

# バックエンド用の.envファイル
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Backend Environment Variables
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
EOF
    print_success "backend/.env ファイルを作成しました"
    print_warning "backend/.env ファイルの設定値を実際の値に更新してください"
else
    print_info "backend/.env ファイルは既に存在します"
fi

# 7. VS Code拡張機能の推奨設定
print_info "VS Code拡張機能の推奨設定を作成中..."

mkdir -p .vscode

# extensions.jsonの作成
cat > .vscode/extensions.json << EOF
{
    "recommendations": [
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-python.python",
        "ms-python.black-formatter",
        "ms-python.isort",
        "charliermarsh.ruff",
        "ms-python.mypy-type-checker",
        "ms-vscode.vscode-json",
        "redhat.vscode-yaml",
        "ms-vscode.vscode-eslint",
        "biomejs.biome",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-git-graph",
        "eamodio.gitlens",
        "ms-vscode.vscode-docker",
        "ms-vscode-remote.remote-containers"
    ]
}
EOF

# settings.jsonの作成
cat > .vscode/settings.json << EOF
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
        "source.organizeImports": "explicit"
    },
    "typescript.preferences.importModuleSpecifier": "relative",
    "python.defaultInterpreterPath": "./backend/.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.ruffEnabled": true,
    "python.linting.mypyEnabled": true,
    "files.exclude": {
        "**/node_modules": true,
        "**/.venv": true,
        "**/__pycache__": true,
        "**/*.pyc": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/.venv": true,
        "**/dist": true,
        "**/build": true
    }
}
EOF

print_success "VS Code設定ファイルを作成しました"

# 最終確認
echo ""
echo "=========================================="
echo "  環境構築が完了しました！"
echo "=========================================="
echo ""
print_success "以下のコマンドで開発サーバーを起動できます:"
echo "  ./scripts/dev.sh"
echo ""
print_info "次のステップ:"
echo "  1. backend/.env ファイルの設定値を更新"
echo "  2. frontend/.env ファイルの設定値を更新"
echo "  3. VS Code拡張機能をインストール"
echo "  4. ./scripts/dev.sh で開発サーバーを起動"
echo ""
print_info "推奨VS Code拡張機能:"
echo "  - TypeScript and JavaScript Language Features"
echo "  - Tailwind CSS IntelliSense"
echo "  - Python"
echo "  - Black Formatter"
echo "  - Ruff"
echo "  - MyPy Type Checker"
echo "  - ESLint"
echo "  - Biome"
echo ""
print_success "環境構築が正常に完了しました！" 