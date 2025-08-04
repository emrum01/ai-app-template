# 音楽生成機能実装プロンプト

## 🎵 概要

Suno APIを使用した音楽生成機能を効率的に実装するためのプロンプトテンプレートです。テキストから高品質な音楽を生成し、ジャンル・長さ・音質を指定できる包括的な音楽プラットフォームを構築します。

## 🎯 実装目標

### 基本機能
- [ ] テキストから音楽生成
- [ ] ジャンル・長さの指定
- [ ] 音質設定（V3.5/V4/V4.5）
- [ ] オーディオプレイヤーの実装
- [ ] 楽曲のダウンロード機能

### 高度な機能
- [ ] メロディの継続生成
- [ ] 歌詞の自動生成
- [ ] ボーカル・楽器分離
- [ ] 音楽スタイルの変更
- [ ] ミュージックビデオ生成

## 🏗️ アーキテクチャ設計

### フロントエンド構成
```
frontend/src/components/MusicGeneration/
├── MusicGenerator.tsx        # メイン生成コンポーネント
├── AudioPlayer.tsx          # オーディオプレイヤー
├── PromptInput.tsx          # プロンプト入力
├── GenreSelector.tsx        # ジャンル選択
├── StyleSelector.tsx        # スタイル選択
├── DurationSelector.tsx     # 長さ選択
├── ModelSelector.tsx        # モデル選択
├── LyricsEditor.tsx         # 歌詞編集
├── MusicHistory.tsx         # 生成履歴
├── DownloadManager.tsx      # ダウンロード管理
├── api.ts                   # API通信
├── config.ts               # 設定
├── types.ts                # 型定義
└── providers/
    ├── suno.ts             # Suno API統合
    └── types.ts            # プロバイダー型定義
```

### バックエンド構成
```
backend/app/api/music/
├── __init__.py
├── routes.py               # 音楽生成API
├── suno_client.py         # Suno APIクライアント
├── models.py              # データモデル
└── utils.py               # ユーティリティ
```

## 📝 実装プロンプト

### 1. 基本セットアップ

**プロンプト:**
```
音楽生成機能のセットアップを行います。以下の要件で実装してください：

1. **依存関係の追加**
   - フロントエンド: audio処理ライブラリ（howler.js等）
   - バックエンド: HTTP クライアント（aiohttp/requests）
   - 音楽ファイル処理ライブラリ

2. **環境変数設定**
   ```env
   SUNO_API_KEY=your_api_key_here
   SUNO_API_BASE_URL=https://api.acedata.cloud/suno
   MUSIC_STORAGE_PATH=/app/music_files
   ```

3. **設定ファイル作成**
   - Suno APIエンドポイント設定
   - サポートするファイル形式定義
   - 音質・長さ制限設定
```

### 2. Suno API統合クライアント

**プロンプト:**
```
Suno API統合のためのクライアントクラスを実装してください：

**要件:**
1. **基本音楽生成**
   - テキストプロンプトからの生成
   - ジャンル・スタイル指定
   - 楽器音楽/ボーカル音楽選択

2. **カスタム歌詞生成**
   - 歌詞テキストの指定
   - セクションタグ対応（[Verse], [Chorus], [Bridge]等）
   - 音楽スタイル指定

3. **高度な機能**
   - 音楽継続生成（extend）
   - 音楽カバー生成（cover）
   - ボーカル・楽器分離（stems）

4. **エラーハンドリング**
   - API制限対応
   - 生成失敗時の再試行
   - 適切なエラーメッセージ

5. **レスポンス管理**
   - 非同期処理対応
   - 生成状況の監視
   - 結果の取得とキャッシング

**実装例参考:**
```python
class SunoClient:
    async def generate_music(
        self, 
        prompt: str, 
        style: str = None,
        model: str = "chirp-v4"
    ) -> Dict
    
    async def generate_custom_lyrics(
        self,
        lyrics: str,
        style: str,
        title: str = None
    ) -> Dict
    
    async def extend_music(
        self,
        audio_id: str,
        continue_at: float,
        lyrics: str = None
    ) -> Dict
```
```

### 3. オーディオプレイヤーコンポーネント

**プロンプト:**
```
高機能なオーディオプレイヤーコンポーネントを実装してください：

**機能要件:**
1. **基本再生機能**
   - 再生/一時停止/停止
   - シークバー操作
   - 音量調整
   - 再生速度変更

2. **UI機能**
   - 現在時間/総時間表示
   - 波形表示（オプション）
   - ループ再生機能
   - プレイリスト管理

3. **ダウンロード機能**
   - MP3形式でのダウンロード
   - MP4（動画）形式ダウンロード
   - ファイル名のカスタマイズ

4. **レスポンシブデザイン**
   - モバイル対応
   - タッチ操作サポート
   - アクセシビリティ配慮

**TypeScript型定義も含めて実装してください。**
```

### 4. 音楽生成フォーム

**プロンプト:**
```
直感的な音楽生成フォームを実装してください：

**コンポーネント構成:**
1. **プロンプト入力エリア**
   - 複数行テキスト入力
   - プレースホルダーでの使用例表示
   - 文字数カウンター

2. **ジャンル選択**
   - ポピュラーなジャンルのプリセット
   - カスタムジャンル入力
   - 複数ジャンル組み合わせ対応

3. **スタイル設定**
   - ムード選択（エネルギッシュ、リラックス等）
   - テンポ指定（BPM）
   - 楽器編成選択

4. **詳細設定**
   - モデル選択（V3.5/V4/V4.5）
   - 長さ設定（30秒〜8分）
   - 楽器音楽/ボーカル切り替え

5. **歌詞エディター**
   - セクション構造エディター
   - リアルタイムプレビュー
   - Suno記法ヘルプ

**フォームバリデーションとプログレス表示も実装してください。**
```

### 5. 生成管理システム

**プロンプト:**
```
音楽生成の管理システムを実装してください：

**機能要件:**
1. **生成履歴管理**
   - 生成された音楽の一覧表示
   - タイトル・ジャンル・作成日時での検索
   - お気に入り機能

2. **非同期処理管理**
   - 生成状況のリアルタイム表示
   - キューイングシステム
   - 複数同時生成の管理

3. **ファイル管理**
   - 生成ファイルの自動保存
   - ストレージ使用量表示
   - 古いファイルの自動削除

4. **共有機能**
   - 生成音楽のURL共有
   - ソーシャルメディア連携
   - 埋め込みプレイヤー生成

**状態管理にはZustandまたはRedux Toolkitを使用してください。**
```

## 🎨 UI/UXガイドライン

### デザインシステム
```css
/* 音楽テーマのカラーパレット */
:root {
  --music-primary: #6366f1;      /* インディゴ */
  --music-secondary: #ec4899;     /* ピンク */
  --music-accent: #f59e0b;        /* アンバー */
  --music-background: #0f0f23;    /* ダークブルー */
  --music-surface: #1e1e3a;       /* グレーブルー */
  --music-text: #f8fafc;          /* ライトグレー */
  --music-muted: #64748b;         /* グレー */
}

/* アニメーション */
.music-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.waveform-animation {
  animation: waveform 1.5s ease-in-out infinite alternate;
}
```

### レスポンシブブレークポイント
```css
/* モバイル: 320px - 767px */
/* タブレット: 768px - 1023px */
/* デスクトップ: 1024px+ */
```

## 🧪 テスト戦略

### 1. ユニットテスト
```typescript
// Suno APIクライアントのテスト
describe('SunoClient', () => {
  test('音楽生成APIの正常系', async () => {
    // モックレスポンスを使用したテスト
  });
  
  test('API制限エラーのハンドリング', async () => {
    // エラーケースのテスト
  });
});

// オーディオプレイヤーのテスト
describe('AudioPlayer', () => {
  test('再生・一時停止機能', () => {
    // プレイヤー操作のテスト
  });
});
```

### 2. 統合テスト
```typescript
// E2Eテスト
describe('音楽生成フロー', () => {
  test('プロンプト入力から音楽生成まで', async () => {
    // 完全なユーザーフローのテスト
  });
});
```

## 📊 パフォーマンス最適化

### 1. フロントエンド最適化
```typescript
// 音声ファイルの遅延読み込み
const AudioPlayer = lazy(() => import('./AudioPlayer'));

// 音楽データのキャッシング
const useMusicCache = () => {
  return useQuery({
    queryKey: ['music', id],
    queryFn: () => fetchMusic(id),
    staleTime: 1000 * 60 * 10, // 10分
  });
};
```

### 2. バックエンド最適化
```python
# 音楽ファイルのストリーミング配信
async def stream_audio(request):
    # 部分コンテンツ配信対応
    range_header = request.headers.get('range')
    # ...ストリーミング実装
```

## 🔒 セキュリティ考慮事項

1. **API キー管理**
   - 環境変数での管理
   - キーローテーション対応

2. **ファイルアップロード制限**
   - ファイルサイズ制限
   - ファイル形式チェック

3. **レート制限**
   - ユーザー毎の生成制限
   - IP ベース制限

## 📱 モバイル対応

1. **タッチ操作最適化**
   - 大きなタップターゲット
   - スワイプジェスチャー対応

2. **オフライン機能**
   - 生成済み音楽のローカル保存
   - オフライン再生機能

## 🚀 デプロイメント

### 1. 環境構築
```bash
# 開発環境
npm run dev        # フロントエンド
python run_dev.py  # バックエンド

# 本番環境
docker-compose up -d
```

### 2. 環境変数
```env
# 必須設定
SUNO_API_KEY=your_api_key
MUSIC_STORAGE_BUCKET=your_s3_bucket

# オプション設定
MAX_GENERATION_QUEUE=10
MUSIC_CACHE_TTL=3600
```

## 📈 成功指標

1. **機能指標**
   - 音楽生成成功率 > 95%
   - 平均生成時間 < 2分
   - API応答時間 < 500ms

2. **ユーザー体験指標**
   - ユーザー満足度 > 4.5/5
   - 音楽品質評価 > 4.0/5
   - 継続利用率 > 60%

## 🔄 今後の拡張計画

1. **AI機能強化**
   - 楽曲アレンジ自動生成
   - ユーザー好み学習機能

2. **コラボレーション機能**
   - 共同編集機能
   - コメント・フィードバック

3. **商用機能**
   - ライセンス管理
   - 収益分配システム

---

## 🎵 参考リソース

- [Suno API Documentation](https://docs.sunoapi.org/)
- [Advanced Suno AI User Guide](https://www.linkedin.com/pulse/advanced-suno-ai-user-guide-louis-guillaume-carrier-b%C3%A9dard-j3yie)
- [音楽理論基礎知識](https://en.wikipedia.org/wiki/Music_theory)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

このプロンプトテンプレートを使用して、効率的に音楽生成機能を実装してください。各セクションは独立して実装可能で、段階的な開発が可能です。