import type {
  EnhancedPromptResult,
  ImageGenerationResponse,
  ImageSize,
  PromptValidationResult,
  StylePreset,
  TextToImageRequest,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ImageGenerationAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async generateImage(request: TextToImageRequest): Promise<ImageGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail?.message || 'Failed to generate image')
    }

    return response.json()
  }

  async transformImage(
    prompt: string,
    sourceImage: File,
    options: {
      negativePrompt?: string
      strength?: number
      stylePreset?: StylePreset
    } = {},
  ): Promise<ImageGenerationResponse> {
    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('source_image', sourceImage)

    if (options.negativePrompt) {
      formData.append('negative_prompt', options.negativePrompt)
    }
    if (options.strength !== undefined) {
      formData.append('strength', options.strength.toString())
    }
    if (options.stylePreset) {
      formData.append('style_preset', options.stylePreset)
    }

    const response = await fetch(`${this.baseUrl}/api/v1/images/transform`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail?.message || 'Failed to transform image')
    }

    return response.json()
  }

  async validatePrompt(prompt: string): Promise<PromptValidationResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/images/validate-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error('Failed to validate prompt')
    }

    const data = await response.json()
    return data.validation
  }

  async enhancePrompt(prompt: string, stylePreset?: StylePreset): Promise<EnhancedPromptResult> {
    const params = new URLSearchParams({ prompt })
    if (stylePreset) {
      params.append('style_preset', stylePreset)
    }

    const response = await fetch(`${this.baseUrl}/api/v1/images/enhance-prompt?${params}`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to enhance prompt')
    }

    return response.json()
  }

  async getPresetSizes(): Promise<ImageSize[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/images/sizes`)

    if (!response.ok) {
      throw new Error('Failed to fetch preset sizes')
    }

    return response.json()
  }

  async getStylePresets(): Promise<Array<{ value: string; name: string }>> {
    const response = await fetch(`${this.baseUrl}/api/v1/images/styles`)

    if (!response.ok) {
      throw new Error('Failed to fetch style presets')
    }

    return response.json()
  }

  async getGenerationHistory(
    userId: string,
    limit: number = 10,
  ): Promise<ImageGenerationResponse[]> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
    })

    const response = await fetch(`${this.baseUrl}/api/v1/images/history?${params}`)

    if (!response.ok) {
      throw new Error('Failed to fetch generation history')
    }

    return response.json()
  }

  async deleteImage(imageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/images/${imageId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  }
}

export const imageGenerationAPI = new ImageGenerationAPI()
