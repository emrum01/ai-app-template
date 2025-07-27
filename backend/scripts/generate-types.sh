#!/bin/bash

echo "🚀 Starting TypeScript type generation..."

# バックエンドサーバーが起動しているか確認
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend server is not running. Please start it first."
    echo "💡 Run: PYTHONPATH=. rye run python run_dev.py"
    exit 1
fi

# OpenAPIスキーマを取得
echo "📥 Fetching OpenAPI schema..."
curl -s http://localhost:8000/openapi.json > openapi.json

if [ ! -f "openapi.json" ]; then
    echo "❌ Failed to fetch OpenAPI schema"
    exit 1
fi

echo "✅ OpenAPI schema saved to openapi.json"

# TypeScriptクライアントを生成
echo "🔧 Generating TypeScript client..."
cd ../frontend

# openapi-typescript-codegenがインストールされているか確認
if ! command -v openapi &> /dev/null; then
    echo "❌ openapi-typescript-codegen is not installed"
    echo "💡 Run: npm install -g openapi-typescript-codegen"
    exit 1
fi

# 既存のapi-clientディレクトリを削除
if [ -d "src/api-client" ]; then
    echo "🗑️ Removing existing api-client directory..."
    rm -rf src/api-client
fi

# 新しいクライアントを生成
openapi --input ../backend/openapi.json --output src/api-client --client fetch

if [ $? -eq 0 ]; then
    echo "✅ TypeScript client generated successfully!"
    echo "📁 Generated files: src/api-client/"
    echo "🔗 You can now import and use the generated API client"
else
    echo "❌ Failed to generate TypeScript client"
    exit 1
fi 