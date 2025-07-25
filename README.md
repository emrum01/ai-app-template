# AI App Template

🚀 **AIを使って高速にアプリを生成するためのテンプレート**

このテンプレートは、AIアシスタント（Claude、ChatGPT等）と連携して、高品質なWebアプリケーションを迅速に開発するために最適化されています。

## 🎯 特徴

- **AI最適化**: AIが理解しやすい構造とコメント
- **モダンスタック**: React + TypeScript + Tailwind CSS
- **高速開発**: Vite による高速な開発環境
- **型安全**: TypeScript による型チェック
- **状態管理**: Zustand によるシンプルな状態管理
- **テスト環境**: Vitest + Testing Library + Playwright
- **コード品質**: Biome による統一されたフォーマット

## 🛠️ セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/emrum01/ai-app-template.git
cd ai-app-template

# 依存関係をインストール
bun install

# 開発サーバーを起動
bun run dev
```

## 📁 プロジェクト構造

```
├── src/
│   ├── components/     # Reactコンポーネント
│   ├── store/         # 状態管理（Zustand）
│   ├── hooks/         # カスタムフック
│   ├── utils/         # ユーティリティ関数
│   └── types/         # TypeScript型定義
├── e2e/               # E2Eテスト
└── public/            # 静的ファイル
```

## 🤖 AIとの連携方法

### 1. プロンプト例

```
このテンプレートを使って、[アプリの説明]を作成してください。
必要な機能：
- [機能1]
- [機能2]
- [機能3]
```

### 2. AIが理解しやすい構造

- 明確なファイル名とフォルダ構造
- TypeScriptによる型定義
- コンポーネントの責務分離
- テスト可能な設計

## 📝 利用可能なコマンド

```bash
# 開発
bun run dev          # 開発サーバー起動
bun run build        # プロダクションビルド
bun run preview      # ビルドのプレビュー

# テスト
bun test            # ユニットテスト
bun run test:e2e    # E2Eテスト

# コード品質
bun run lint        # Lintとフォーマット
bun run check       # コードチェック
```

## 🎨 カスタマイズ

### テーマ変更
`tailwind.config.js` でカラーパレットやテーマを変更

### 状態管理
`src/store/` に新しいストアを追加

### コンポーネント
`src/components/` に新しいコンポーネントを追加

## 📦 技術スタック

- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **Vite** - 高速ビルドツール
- **Zustand** - 軽量状態管理
- **Biome** - 高速なLinter/Formatter
- **Vitest** - ユニットテスト
- **Playwright** - E2Eテスト

## 🚀 デプロイ

このテンプレートは以下のプラットフォームに簡単にデプロイできます：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

## 📄 ライセンス

MIT License

---

**AIと一緒に、より速く、より良いアプリを作りましょう！** 🎉