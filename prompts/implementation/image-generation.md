# 画像生成機能実装プロンプトテンプレート

## 概要

このプロンプトテンプレートは、AIを活用した画像生成機能を効率的に実装するためのガイドラインです。

## 基本機能の実装

### 1. Text-to-Image生成

```typescript
interface TextToImageRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  aspectRatio?: AspectRatio;
  stylePreset?: StylePreset;
  seed?: number;
  steps?: number;
}

interface ImageGenerationResponse {
  imageUrl: string;
  imageId: string;
  metadata: {
    prompt: string;
    width: number;
    height: number;
    model: string;
    timestamp: Date;
  };
}
```

### 2. サイズとアスペクト比の選択

```typescript
enum AspectRatio {
  SQUARE = "1:1",
  LANDSCAPE = "16:9",
  PORTRAIT = "9:16",
  WIDE = "21:9",
  CUSTOM = "custom"
}

interface ImageSize {
  width: number;
  height: number;
  label: string;
}

const PRESET_SIZES: ImageSize[] = [
  { width: 512, height: 512, label: "Small (512x512)" },
  { width: 768, height: 768, label: "Medium (768x768)" },
  { width: 1024, height: 1024, label: "Large (1024x1024)" },
  { width: 1920, height: 1080, label: "HD (1920x1080)" },
  { width: 2048, height: 2048, label: "Ultra HD (2048x2048)" }
];
```

### 3. スタイルプリセット

```typescript
enum StylePreset {
  NONE = "none",
  ANIME = "anime",
  PHOTOGRAPHIC = "photographic",
  DIGITAL_ART = "digital-art",
  COMIC_BOOK = "comic-book",
  FANTASY_ART = "fantasy-art",
  LINE_ART = "line-art",
  ANALOG_FILM = "analog-film",
  NEON_PUNK = "neon-punk",
  ISOMETRIC = "isometric",
  LOW_POLY = "low-poly",
  ORIGAMI = "origami",
  MODELING_COMPOUND = "modeling-compound",
  CINEMATIC = "cinematic",
  TILE_TEXTURE = "tile-texture"
}

interface StylePromptEnhancement {
  style: StylePreset;
  prompts: {
    prefix?: string;
    suffix?: string;
    negativePrompt?: string;
  };
}
```

## 高度な機能の実装

### 1. Image-to-Image (img2img)

```typescript
interface ImageToImageRequest extends TextToImageRequest {
  sourceImage: File | Blob | string;
  strength: number; // 0.0 - 1.0
  preserveOriginal?: boolean;
}
```

### 2. インペインティング

```typescript
interface InpaintingRequest extends ImageToImageRequest {
  maskImage: File | Blob | string;
  maskBlur?: number;
  maskMode?: "black" | "white";
}
```

### 3. アップスケーリング

```typescript
interface UpscaleRequest {
  imageId: string;
  scaleFactor: 2 | 4;
  model?: "esrgan" | "real-esrgan" | "ldm";
}
```

### 4. プロンプト最適化

```typescript
interface PromptOptimizer {
  enhancePrompt(originalPrompt: string): Promise<string>;
  suggestNegativePrompt(prompt: string): Promise<string>;
  validatePrompt(prompt: string): PromptValidationResult;
}

interface PromptValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}
```

## API実装

### APIラッパーインターフェース

```typescript
interface ImageGenerationAPI {
  // 基本的な画像生成
  generateImage(request: TextToImageRequest): Promise<ImageGenerationResponse>;
  
  // img2img変換
  transformImage(request: ImageToImageRequest): Promise<ImageGenerationResponse>;
  
  // インペインティング
  inpaintImage(request: InpaintingRequest): Promise<ImageGenerationResponse>;
  
  // アップスケーリング
  upscaleImage(request: UpscaleRequest): Promise<ImageGenerationResponse>;
  
  // 生成履歴
  getGenerationHistory(userId: string, limit?: number): Promise<ImageGenerationResponse[]>;
  
  // 画像の削除
  deleteImage(imageId: string): Promise<void>;
}
```

### エラーハンドリング

```typescript
class ImageGenerationError extends Error {
  constructor(
    message: string,
    public code: ImageGenerationErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = "ImageGenerationError";
  }
}

enum ImageGenerationErrorCode {
  INVALID_PROMPT = "INVALID_PROMPT",
  NSFW_CONTENT = "NSFW_CONTENT",
  RATE_LIMIT = "RATE_LIMIT",
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  API_ERROR = "API_ERROR",
  INVALID_IMAGE = "INVALID_IMAGE",
  PROCESSING_ERROR = "PROCESSING_ERROR"
}
```

## UI/UXコンポーネント

### 1. プロンプト入力UI

```typescript
interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnhance?: () => void;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  suggestions?: string[];
}
```

### 2. ギャラリーコンポーネント

```typescript
interface ImageGalleryProps {
  images: ImageGenerationResponse[];
  onImageSelect?: (image: ImageGenerationResponse) => void;
  onImageDelete?: (imageId: string) => void;
  onImageDownload?: (imageId: string) => void;
  layout?: "grid" | "masonry" | "carousel";
  columns?: number;
}
```

### 3. 画像編集・調整UI

```typescript
interface ImageEditorProps {
  image: ImageGenerationResponse;
  onSave: (editedImage: Blob) => void;
  tools?: EditorTool[];
}

enum EditorTool {
  CROP = "crop",
  ROTATE = "rotate",
  FLIP = "flip",
  BRIGHTNESS = "brightness",
  CONTRAST = "contrast",
  SATURATION = "saturation",
  BLUR = "blur",
  SHARPEN = "sharpen"
}
```

## セキュリティとバリデーション

### 1. コンテンツフィルタリング

```typescript
interface ContentFilter {
  checkPrompt(prompt: string): Promise<ContentFilterResult>;
  checkImage(image: Blob): Promise<ContentFilterResult>;
}

interface ContentFilterResult {
  isAllowed: boolean;
  reason?: string;
  category?: "violence" | "adult" | "hate" | "illegal";
}
```

### 2. レート制限

```typescript
interface RateLimiter {
  checkLimit(userId: string, action: string): Promise<RateLimitResult>;
  recordUsage(userId: string, action: string): Promise<void>;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}
```

## パフォーマンス最適化

### 1. キャッシング戦略

```typescript
interface ImageCache {
  get(key: string): Promise<Blob | null>;
  set(key: string, image: Blob, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### 2. プログレッシブレンダリング

```typescript
interface ProgressiveImageLoader {
  loadThumbnail(imageId: string): Promise<string>;
  loadPreview(imageId: string): Promise<string>;
  loadFull(imageId: string): Promise<string>;
}
```

## テスト戦略

### 1. ユニットテスト

```typescript
describe('ImageGenerationAPI', () => {
  it('should generate image with valid prompt', async () => {
    const request: TextToImageRequest = {
      prompt: 'A beautiful sunset over mountains',
      width: 1024,
      height: 768
    };
    
    const response = await api.generateImage(request);
    
    expect(response).toBeDefined();
    expect(response.imageUrl).toMatch(/^https?:\/\//);
    expect(response.metadata.width).toBe(1024);
    expect(response.metadata.height).toBe(768);
  });
  
  it('should handle NSFW content appropriately', async () => {
    const request: TextToImageRequest = {
      prompt: 'inappropriate content'
    };
    
    await expect(api.generateImage(request))
      .rejects.toThrow(ImageGenerationError);
  });
});
```

### 2. 統合テスト

```typescript
describe('Image Generation Flow', () => {
  it('should complete full generation workflow', async () => {
    // 1. プロンプト最適化
    const enhancedPrompt = await optimizer.enhancePrompt('sunset');
    
    // 2. 画像生成
    const image = await api.generateImage({
      prompt: enhancedPrompt,
      stylePreset: StylePreset.PHOTOGRAPHIC
    });
    
    // 3. 画像の保存
    await storage.saveImage(image);
    
    // 4. ギャラリーへの追加
    await gallery.addImage(image);
    
    expect(image).toBeDefined();
  });
});
```

## 使用例

```typescript
// 基本的な使用例
const imageGenerator = new ImageGenerationAPI(config);

// シンプルな画像生成
const result = await imageGenerator.generateImage({
  prompt: "A serene Japanese garden with cherry blossoms",
  width: 1024,
  height: 1024,
  stylePreset: StylePreset.ANIME
});

// 画像の変換
const transformed = await imageGenerator.transformImage({
  sourceImage: originalImage,
  prompt: "Make it look like a watercolor painting",
  strength: 0.7
});

// バッチ生成
const batchResults = await Promise.all(
  prompts.map(prompt => 
    imageGenerator.generateImage({ prompt })
  )
);
```

## 実装チェックリスト

- [ ] 基本的なテキストから画像への生成機能
- [ ] プロンプトバリデーション
- [ ] エラーハンドリング
- [ ] 画像サイズオプション
- [ ] スタイルプリセット
- [ ] ネガティブプロンプトのサポート
- [ ] 画像履歴管理
- [ ] プログレス表示
- [ ] キャンセル機能
- [ ] 画像のダウンロード
- [ ] 共有機能
- [ ] モバイル対応UI
- [ ] アクセシビリティ対応
- [ ] パフォーマンス最適化
- [ ] セキュリティ対策