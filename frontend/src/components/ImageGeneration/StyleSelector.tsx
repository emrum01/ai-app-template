import type React from 'react'
import { useEffect, useState } from 'react'
import { imageGenerationAPI } from './api'
import { StylePreset } from './types'

interface StyleSelectorProps {
  value: StylePreset
  onChange: (value: StylePreset) => void
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange }) => {
  const [styles, setStyles] = useState<Array<{ value: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const fetchedStyles = await imageGenerationAPI.getStylePresets()
        setStyles(fetchedStyles)
      } catch (error) {
        console.error('Failed to fetch style presets:', error)
        // Fallback to default styles
        setStyles(
          Object.values(StylePreset).map((style) => ({
            value: style,
            name: style
              .replace(/-/g, ' ')
              .replace(/_/g, ' ')
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' '),
          })),
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchStyles()
  }, [])

  const getStylePreview = (style: string): string => {
    const previews: Record<string, string> = {
      none: '🎨',
      anime: '🎌',
      photographic: '📷',
      'digital-art': '🖼️',
      'comic-book': '💥',
      'fantasy-art': '🐉',
      'line-art': '✏️',
      'analog-film': '🎞️',
      'neon-punk': '🌃',
      isometric: '📐',
      'low-poly': '🔺',
      origami: '🗞️',
      'modeling-compound': '🎭',
      cinematic: '🎬',
      'tile-texture': '🔲',
    }
    return previews[style] || '🎨'
  }

  if (isLoading) {
    return (
      <div className="style-selector">
        <label className="block text-sm font-medium text-gray-700 mb-2">Style Preset</label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="style-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">Style Preset</label>

      <div className="grid grid-cols-3 gap-2">
        {styles.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onChange(style.value as StylePreset)}
            className={`
              flex items-center justify-center p-2 rounded-lg border-2 transition-all
              ${
                value === style.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            title={style.name}
          >
            <span className="text-xl mr-1">{getStylePreview(style.value)}</span>
            <span className="text-xs truncate">{style.name}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-gray-600">
        Selected: <strong>{styles.find((s) => s.value === value)?.name || value}</strong>
      </p>
    </div>
  )
}

export default StyleSelector
