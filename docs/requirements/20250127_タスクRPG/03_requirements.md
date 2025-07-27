# 📋 要件定義書

## 選定アイデア
- **アプリ名**: タスクRPG
- **体験定義**: ユーザーはタスクを完了してレベルアップし、仕事の達成感を可視化する

## 利用シーン
- **誰が**: デスクワーカー、リモートワーカー
- **いつ**: 日常業務中、タスク完了時
- **なぜ**: 単調な作業をゲーム化して楽しみたい

## 技術要件
- **画面数**: 2（タスク管理画面、プロフィール画面）
- **必要技術**: React, TypeScript, Tailwind CSS, Supabase
- **外部API**: なし

## 機能詳細

### 1. タスク管理画面
- タスクの追加・編集・削除
- タスクに難易度設定（Easy: 10XP, Normal: 25XP, Hard: 50XP）
- 完了チェックで即座に経験値獲得アニメーション
- 今日のタスク一覧表示
- 現在のレベルと経験値バー表示

### 2. プロフィール画面
- キャラクターアバター（レベルに応じて成長）
- 累計統計（完了タスク数、獲得経験値、連続達成日数）
- レベルアップ履歴
- 獲得バッジ表示（初回達成、連続達成など）

## データモデル

### users テーブル
- id (UUID)
- email (string)
- username (string)
- level (integer)
- experience_points (integer)
- avatar_stage (integer)
- created_at (timestamp)

### tasks テーブル
- id (UUID)
- user_id (UUID, FK)
- title (string)
- difficulty (enum: easy, normal, hard)
- experience_value (integer)
- completed (boolean)
- completed_at (timestamp)
- created_at (timestamp)

## 制約確認
- 6時間でAI実装可能: ✅
- 画面数3つ以下: ✅（2画面）
- テーブル1-2個: ✅（users, tasks）
- 1つのコア体験: ✅（タスク完了→レベルアップ）

## 次のステップ
```
/design
```