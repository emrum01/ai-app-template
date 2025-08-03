export const AspectRatio = {
  SQUARE: '1:1',
  LANDSCAPE: '16:9',
  PORTRAIT: '9:16',
  WIDE: '21:9',
  CUSTOM: 'custom',
} as const

export type AspectRatio = (typeof AspectRatio)[keyof typeof AspectRatio]

export const StylePreset = {
  NONE: 'none',
  ANIME: 'anime',
  PHOTOGRAPHIC: 'photographic',
  DIGITAL_ART: 'digital-art',
  COMIC_BOOK: 'comic-book',
  FANTASY_ART: 'fantasy-art',
  LINE_ART: 'line-art',
  ANALOG_FILM: 'analog-film',
  NEON_PUNK: 'neon-punk',
  ISOMETRIC: 'isometric',
  LOW_POLY: 'low-poly',
  ORIGAMI: 'origami',
  MODELING_COMPOUND: 'modeling-compound',
  CINEMATIC: 'cinematic',
  TILE_TEXTURE: 'tile-texture',
} as const

export type StylePreset = (typeof StylePreset)[keyof typeof StylePreset]

export interface ImageSize {
  width: number
  height: number
  label: string
}

export interface TextToImageRequest {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  aspectRatio?: AspectRatio
  stylePreset?: StylePreset
  seed?: number
  steps?: number
}

export interface ImageMetadata {
  prompt: string
  width: number
  height: number
  model: string
  timestamp: string
  stylePreset?: StylePreset
  seed?: number
}

export interface ImageGenerationResponse {
  imageUrl: string
  imageId: string
  metadata: ImageMetadata
}

export interface PromptValidationResult {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
}

export interface EnhancedPromptResult {
  original: string
  enhanced: string
  suggestedNegative: string
}
