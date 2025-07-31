#!/bin/bash

# 開発サーバー起動スクリプト

print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# バックエンドサーバーを起動
start_backend() {
    print_info "バックエンドサーバーを起動中..."
    cd backend
    if command -v rye &> /dev/null; then
        rye run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    else
        source .venv/bin/activate
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    fi
    BACKEND_PID=$!
    cd ..
    print_success "バックエンドサーバーが起動しました (PID: $BACKEND_PID)"
}

# フロントエンドサーバーを起動
start_frontend() {
    print_info "フロントエンドサーバーを起動中..."
    cd frontend
    if command -v bun &> /dev/null; then
        bun run dev &
    else
        npm run dev &
    fi
    FRONTEND_PID=$!
    cd ..
    print_success "フロントエンドサーバーが起動しました (PID: $FRONTEND_PID)"
}

# クリーンアップ関数
cleanup() {
    print_info "サーバーを停止中..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    print_success "サーバーを停止しました"
    exit 0
}

# シグナルハンドラーを設定
trap cleanup SIGINT SIGTERM

# サーバーを起動
start_backend
sleep 2
start_frontend

print_success "開発サーバーが起動しました"
print_info "フロントエンド: http://localhost:5173"
print_info "バックエンド: http://localhost:8000"
print_info "API ドキュメント: http://localhost:8000/docs"
print_info "停止するには Ctrl+C を押してください"

# プロセスを待機
wait
