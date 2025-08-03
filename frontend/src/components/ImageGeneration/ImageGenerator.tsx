import type React from 'react'
import { useCallback, useState } from 'react'
import { imageGenerationAPI } from './api'
import ImageGallery from './ImageGallery'
import PromptInput from './PromptInput'
import SizeSelector from './SizeSelector'
import StyleSelector from './StyleSelector'
import type { ImageGenerationResponse, TextToImageRequest } from './types'
import { AspectRatio, StylePreset } from './types'

interface ImageGeneratorProps {
  userId?: string
}

const ImageGenerator: React.FC<ImageGeneratorProps> = () => {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [stylePreset, setStylePreset] = useState<StylePreset>(StylePreset.NONE)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE)
  const [customSize, setCustomSize] = useState({ width: 1024, height: 1024 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<ImageGenerationResponse[]>([])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const request: TextToImageRequest = {
        prompt,
        negativePrompt: negativePrompt || undefined,
        stylePreset,
        aspectRatio,
        width: customSize.width,
        height: customSize.height,
      }

      const response = await imageGenerationAPI.generateImage(request)
      setGeneratedImages((prev) => [response, ...prev])
      setPrompt('') // Clear prompt after successful generation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, negativePrompt, stylePreset, aspectRatio, customSize])

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) return

    try {
      const enhanced = await imageGenerationAPI.enhancePrompt(prompt, stylePreset)
      setPrompt(enhanced.enhanced)
      if (!negativePrompt && enhanced.suggestedNegative) {
        setNegativePrompt(enhanced.suggestedNegative)
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err)
    }
  }, [prompt, stylePreset, negativePrompt])

  const handleImageSelect = useCallback((image: ImageGenerationResponse) => {
    // Handle image selection (e.g., show details, allow editing)
    console.log('Selected image:', image)
  }, [])

  const handleImageDelete = useCallback(async (imageId: string) => {
    try {
      await imageGenerationAPI.deleteImage(imageId)
      setGeneratedImages((prev) => prev.filter((img) => img.imageId !== imageId))
    } catch (err) {
      console.error('Failed to delete image:', err)
    }
  }, [])

  return (
    <div className="image-generator container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">AI Image Generator</h1>

      <div className="generation-form bg-white rounded-lg shadow-md p-6 mb-8">
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onEnhance={handleEnhancePrompt}
          placeholder="Describe the image you want to create..."
          className="mb-4"
        />

        <PromptInput
          value={negativePrompt}
          onChange={setNegativePrompt}
          placeholder="What to avoid in the image (optional)"
          label="Negative Prompt"
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StyleSelector value={stylePreset} onChange={setStylePreset} />

          <SizeSelector
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            customSize={customSize}
            onCustomSizeChange={setCustomSize}
          />
        </div>

        {error && (
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`
            generate-button w-full py-3 px-6 rounded-lg font-semibold text-white
            ${
              isGenerating || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
            transition-colors duration-200
          `}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Image'
          )}
        </button>
      </div>

      {generatedImages.length > 0 && (
        <div className="generated-images">
          <h2 className="text-2xl font-semibold mb-4">Generated Images</h2>
          <ImageGallery
            images={generatedImages}
            onImageSelect={handleImageSelect}
            onImageDelete={handleImageDelete}
          />
        </div>
      )}
    </div>
  )
}

export default ImageGenerator
