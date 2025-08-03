import type React from 'react'
import { useEffect, useState } from 'react'
import { imageGenerationAPI } from './api'
import type { ImageSize } from './types'
import { AspectRatio } from './types'

interface SizeSelectorProps {
  aspectRatio: AspectRatio
  onAspectRatioChange: (ratio: AspectRatio) => void
  customSize: { width: number; height: number }
  onCustomSizeChange: (size: { width: number; height: number }) => void
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  aspectRatio,
  onAspectRatioChange,
  customSize,
  onCustomSizeChange,
}) => {
  const [presetSizes, setPresetSizes] = useState<ImageSize[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizes = await imageGenerationAPI.getPresetSizes()
        setPresetSizes(sizes)
      } catch (error) {
        console.error('Failed to fetch preset sizes:', error)
        // Fallback sizes
        setPresetSizes([
          { width: 512, height: 512, label: 'Small (512x512)' },
          { width: 1024, height: 1024, label: 'Large (1024x1024)' },
          { width: 1920, height: 1080, label: 'HD (1920x1080)' },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSizes()
  }, [])

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    onAspectRatioChange(ratio)

    // Update dimensions based on aspect ratio
    const baseSize = 1024
    switch (ratio) {
      case AspectRatio.SQUARE:
        onCustomSizeChange({ width: baseSize, height: baseSize })
        break
      case AspectRatio.LANDSCAPE:
        onCustomSizeChange({ width: Math.round((baseSize * 16) / 9), height: baseSize })
        break
      case AspectRatio.PORTRAIT:
        onCustomSizeChange({ width: baseSize, height: Math.round((baseSize * 16) / 9) })
        break
      case AspectRatio.WIDE:
        onCustomSizeChange({ width: Math.round((baseSize * 21) / 9), height: baseSize })
        break
    }
  }

  const handlePresetSelect = (preset: ImageSize) => {
    onCustomSizeChange({ width: preset.width, height: preset.height })
    onAspectRatioChange(AspectRatio.CUSTOM)
  }

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0
    const roundedValue = Math.round(numValue / 64) * 64 // Round to nearest 64
    const clampedValue = Math.max(64, Math.min(2048, roundedValue))

    onCustomSizeChange({
      ...customSize,
      [dimension]: clampedValue,
    })
  }

  if (isLoading) {
    return (
      <div className="size-selector">
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Size</label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="size-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">Image Size</label>

      {/* Aspect Ratio Buttons */}
      <div className="flex gap-2 mb-3">
        {Object.values(AspectRatio).map((ratio) => (
          <button
            key={ratio}
            type="button"
            onClick={() => handleAspectRatioChange(ratio)}
            className={`
              px-3 py-1 text-sm rounded-md transition-colors
              ${
                aspectRatio === ratio
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* Preset Sizes */}
      <select
        onChange={(e) => {
          const preset = presetSizes[parseInt(e.target.value)]
          if (preset) handlePresetSelect(preset)
        }}
        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value=""
      >
        <option value="">Select preset size...</option>
        {presetSizes.map((preset, index) => (
          <option key={index} value={index}>
            {preset.label}
          </option>
        ))}
      </select>

      {/* Custom Dimensions */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Width</label>
          <input
            type="number"
            value={customSize.width}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
            min="64"
            max="2048"
            step="64"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Height</label>
          <input
            type="number"
            value={customSize.height}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
            min="64"
            max="2048"
            step="64"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">Dimensions must be multiples of 64</p>
    </div>
  )
}

export default SizeSelector
