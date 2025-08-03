import type React from 'react'
import { useState } from 'react'
import type { ImageGenerationResponse } from './types'

interface ImageGalleryProps {
  images: ImageGenerationResponse[]
  onImageSelect?: (image: ImageGenerationResponse) => void
  onImageDelete?: (imageId: string) => void
  onImageDownload?: (imageId: string) => void
  layout?: 'grid' | 'masonry' | 'carousel'
  columns?: number
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageSelect,
  onImageDelete,
  onImageDownload,
  layout = 'grid',
  columns = 3,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageGenerationResponse | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleImageClick = (image: ImageGenerationResponse) => {
    setSelectedImage(image)
    setShowModal(true)
    onImageSelect?.(image)
  }

  const handleDownload = async (image: ImageGenerationResponse) => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-${image.imageId}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      onImageDownload?.(image.imageId)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  const gridClassName =
    layout === 'grid'
      ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`
      : 'flex flex-wrap gap-4'

  return (
    <>
      <div className={`image-gallery ${gridClassName}`}>
        {images.map((image) => (
          <div
            key={image.imageId}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200"
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image.imageUrl}
              alt={image.metadata.prompt}
              className="w-full h-auto object-cover"
              loading="lazy"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-end">
              <div className="w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-white text-sm truncate mb-2">{image.metadata.prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(image)
                    }}
                    className="flex-1 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 py-1 px-3 rounded text-sm font-medium transition-colors"
                  >
                    Download
                  </button>
                  {onImageDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this image?')) {
                          onImageDelete(image.imageId)
                        }
                      }}
                      className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size view */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.metadata.prompt}
              className="max-w-full max-h-[90vh] object-contain"
            />

            <div className="mt-4 bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Image Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Prompt:</strong>
                  <p className="text-gray-600">{selectedImage.metadata.prompt}</p>
                </div>
                <div>
                  <strong>Size:</strong>
                  <p className="text-gray-600">
                    {selectedImage.metadata.width} × {selectedImage.metadata.height}
                  </p>
                </div>
                <div>
                  <strong>Style:</strong>
                  <p className="text-gray-600">{selectedImage.metadata.stylePreset || 'None'}</p>
                </div>
                <div>
                  <strong>Created:</strong>
                  <p className="text-gray-600">
                    {new Date(selectedImage.metadata.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
                >
                  Download Image
                </button>
                {onImageDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this image?')) {
                        onImageDelete(selectedImage.imageId)
                        setShowModal(false)
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery
