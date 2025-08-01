# /design - 基本設計フェーズ

## 概要
要件定義書から15分で実装可能な基本設計書を作成します。

## 使い方
```
/design
```
※ 事前に `/requirements` で要件定義書を作成している必要があります

## プロセス

### 1. 画面設計（5分）
各画面をASCIIアートで視覚化：

```
┌─────────────────┐
│     ヘッダー      │
├─────────────────┤
│                 │
│   メインエリア    │
│                 │
└─────────────────┘
```

**記載項目:**
- 目的
- ユーザーアクション
- 表示データ

### 2. データ設計（5分）
最小限のテーブル構造：

```markdown
### テーブル名: [table_name]
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | uuid | 主キー |
| user_id | uuid | ユーザーID |
| [データ] | [型] | [説明] |
| created_at | timestamp | 作成日時 |
```

**設計原則:**
- テーブル数は1-2個
- リレーションは最小限
- JSONBで柔軟性確保

### 3. 実装タスク（5分）
6時間のタイムボックス：

```markdown
| 時間 | タスク | 完了基準 |
|------|--------|---------|
| 0:00-0:30 | 環境構築 | ローカル起動 |
| 0:30-1:00 | DB構築 | テーブル作成 |
| 1:00-3:00 | コア機能 | 動作確認 |
| 3:00-5:00 | UI実装 | 全画面表示 |
| 5:00-5:30 | 最終調整 | スマホ対応 |
| 5:30-6:00 | デプロイ | URL発行 |
```

## 出力フォーマット

```markdown
# 基本設計書

## 📥 要件定義からの入力
- **アプリ名**: [転記]
- **体験定義**: [転記]
- **技術要件**: [転記]

## 🎨 画面設計
[画面レイアウト図]

## 💾 データ設計
[テーブル定義]

## 🛠 実装タスク
[6時間タイムボックス]

## 🎬 デモシナリオ
1. [開始]
2. [アクション]
3. [結果]
4. [価値実感]

## ✅ 完了条件
- [ ] 体験が実現
- [ ] 全画面動作
- [ ] スマホ対応
- [ ] URL公開
```

## 設計の鉄則
- **追加しない**: 要件にない機能は設計しない
- **複雑にしない**: 最もシンプルな方法を選ぶ
- **先を考えない**: 今日動くものだけ設計

## 次のステップ
設計書を見ながら6時間の実装スプリント開始！