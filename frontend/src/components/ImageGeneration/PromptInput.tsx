import type React from 'react'
import { useCallback, useState } from 'react'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onEnhance?: () => void
  placeholder?: string
  label?: string
  maxLength?: number
  showCharCount?: boolean
  suggestions?: string[]
  className?: string
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onEnhance,
  placeholder = 'Enter your prompt...',
  label,
  maxLength = 1000,
  showCharCount = true,
  suggestions = [],
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (newValue.length <= maxLength) {
        onChange(newValue)
      }
    },
    [onChange, maxLength],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && e.ctrlKey && onEnhance) {
        e.preventDefault()
        onEnhance()
      }
    },
    [onEnhance],
  )

  const remainingChars = maxLength - value.length
  const charCountColor =
    remainingChars < 100
      ? 'text-orange-500'
      : remainingChars < 50
        ? 'text-red-500'
        : 'text-gray-500'

  return (
    <div className={`prompt-input ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${isFocused ? 'border-blue-500' : 'border-gray-300'}
          `}
          rows={3}
        />

        {onEnhance && (
          <button
            type="button"
            onClick={onEnhance}
            className="absolute right-2 top-2 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            title="Enhance prompt (Ctrl+Enter)"
          >
            <svg
              className="w-4 h-4 inline-block mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Enhance
          </button>
        )}
      </div>

      {showCharCount && (
        <div className={`text-xs mt-1 text-right ${charCountColor}`}>
          {value.length} / {maxLength}
        </div>
      )}

      {suggestions.length > 0 && isFocused && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(value + (value ? ' ' : '') + suggestion)}
                className="text-xs px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptInput
