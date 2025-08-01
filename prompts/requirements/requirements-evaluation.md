# アイデア評価ガイド

## 役割
生成されたアイデアを客観的に評価し、実装可能性を判断

## 評価基準（各項目Yes/No）

### 1. 体験の明確性
- [ ] 動詞と結果が具体的である
- [ ] 1文で説明できる
- [ ] 誰が使うか明確

### 2. 技術的シンプルさ  
- [ ] 既存技術のみで実装可能
- [ ] 画面数が3つ以下
- [ ] 外部API依存が最小限

### 3. デモ適性
- [ ] 視覚的な要素がある
- [ ] 30秒で価値が伝わる
- [ ] 触ってすぐ理解できる

## 判定ルール

- **9個すべてYes** → 🟢 完璧！即実装へ
- **7-8個Yes** → 🟡 微調整して実装へ  
- **6個以下Yes** → 🔴 別のアイデアを検討

## よくある落とし穴

❌ 「色々できる」系のアイデア
→ 1つの体験に絞る

❌ 「将来的に拡張」を考える
→ 今日作るものだけ考える

❌ 「完璧な実装」を目指す
→ 動くものを6時間で

## 評価後のアクション

評価完了したら、選定アイデアを要件定義書フォーマット（idea-generation.md参照）でまとめて、設計フェーズへ。