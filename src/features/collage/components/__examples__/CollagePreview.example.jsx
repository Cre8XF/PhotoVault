// ============================================================================
// EXAMPLE: CollagePreview Usage Examples
// Demonstrates different use cases for CollagePreview component
// ============================================================================
import React, { useState } from 'react'
import CollagePreview from '../CollagePreview'
import CollagePreviewSkeleton from '../CollagePreviewSkeleton'
import { LAYOUTS_V3 } from '../../layouts/layouts_v3'

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================
export function BasicExample() {
  const photos = [
    {
      id: 'photo1',
      url: 'https://example.com/photo1.jpg',
      thumbnailUrl: 'https://example.com/photo1_thumb.jpg',
      filename: 'Summer Beach.jpg'
    },
    {
      id: 'photo2',
      url: 'https://example.com/photo2.jpg',
      thumbnailUrl: 'https://example.com/photo2_thumb.jpg',
      filename: 'Mountain View.jpg'
    }
  ]

  const layout = LAYOUTS_V3.side_by_side

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Basic Collage Preview</h2>
      <CollagePreview photos={photos} layout={layout} />
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: With Transforms
// ============================================================================
export function WithTransformsExample() {
  const photos = [
    { id: 'photo1', url: '/img1.jpg', thumbnailUrl: '/img1_thumb.jpg' },
    { id: 'photo2', url: '/img2.jpg', thumbnailUrl: '/img2_thumb.jpg' },
    { id: 'photo3', url: '/img3.jpg', thumbnailUrl: '/img3_thumb.jpg' }
  ]

  const layout = LAYOUTS_V3.triple_row

  const transforms = {
    photo1: { scale: 1.2, translateX: 10, translateY: -5 },
    photo2: { scale: 1.0, translateX: 0, translateY: 0 },
    photo3: { scale: 1.5, translateX: -20, translateY: 15 }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Collage with Custom Transforms</h2>
      <CollagePreview photos={photos} layout={layout} transforms={transforms} />
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Interactive (Click to Edit)
// ============================================================================
export function InteractiveExample() {
  const [selectedPhotoId, setSelectedPhotoId] = useState(null)

  const photos = [
    { id: 'photo1', url: '/img1.jpg', thumbnailUrl: '/img1_thumb.jpg' },
    { id: 'photo2', url: '/img2.jpg', thumbnailUrl: '/img2_thumb.jpg' },
    { id: 'photo3', url: '/img3.jpg', thumbnailUrl: '/img3_thumb.jpg' },
    { id: 'photo4', url: '/img4.jpg', thumbnailUrl: '/img4_thumb.jpg' }
  ]

  const layout = LAYOUTS_V3.classic_grid

  const handleImageClick = (photoId) => {
    setSelectedPhotoId(photoId)
    console.log('Photo clicked:', photoId)
    // Open RepositionModal here
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Interactive Collage (Click Photos)</h2>
      <CollagePreview
        photos={photos}
        layout={layout}
        onImageClick={handleImageClick}
      />
      {selectedPhotoId && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p>Selected photo: {selectedPhotoId}</p>
          <p className="text-sm opacity-70">RepositionModal would open here</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Loading State
// ============================================================================
export function LoadingExample() {
  const [isLoading, setIsLoading] = useState(true)

  const photos = [
    { id: 'photo1', url: '/img1.jpg', thumbnailUrl: '/img1_thumb.jpg' },
    { id: 'photo2', url: '/img2.jpg', thumbnailUrl: '/img2_thumb.jpg' }
  ]

  const layout = LAYOUTS_V3.stacked

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Loading State</h2>
      {isLoading ? (
        <CollagePreviewSkeleton layout={layout} />
      ) : (
        <CollagePreview photos={photos} layout={layout} />
      )}
      <button
        onClick={() => setIsLoading(true)}
        className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
      >
        Reload
      </button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Responsive Grid Demo
// ============================================================================
export function ResponsiveExample() {
  const photos = Array.from({ length: 6 }, (_, i) => ({
    id: `photo${i + 1}`,
    url: `/img${i + 1}.jpg`,
    thumbnail: `/img${i + 1}_thumb.jpg`,
    filename: `Photo ${i + 1}.jpg`
  }))

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Responsive Layout Demo</h2>
      <p className="text-sm opacity-70 mb-6">
        Resize your browser to see mobile/desktop grid changes
      </p>

      <div className="space-y-8">
        {/* Desktop: 3 columns, Mobile: 2 columns */}
        <div>
          <h3 className="font-medium mb-2">Polaroid (3×2 grid)</h3>
          <CollagePreview photos={photos} layout={LAYOUTS_V3.polaroid} />
        </div>

        {/* Desktop: 4 columns, Mobile: 2×2 grid */}
        <div>
          <h3 className="font-medium mb-2">Timeline (4 columns)</h3>
          <CollagePreview
            photos={photos.slice(0, 4)}
            layout={LAYOUTS_V3.timeline}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Error States
// ============================================================================
export function ErrorStatesExample() {
  const validPhotos = [
    { id: 'photo1', url: '/img1.jpg', thumbnailUrl: '/img1_thumb.jpg' }
  ]

  const photosWithError = [
    {
      id: 'photo1',
      url: 'https://invalid-url.com/broken.jpg',
      thumbnailUrl: 'https://invalid-url.com/broken_thumb.jpg'
    },
    { id: 'photo2', url: '/img2.jpg', thumbnailUrl: '/img2_thumb.jpg' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h3 className="font-medium mb-2">Empty Slots</h3>
        <CollagePreview photos={validPhotos} layout={LAYOUTS_V3.side_by_side} />
        <p className="text-xs opacity-60 mt-2">
          Second slot shows placeholder (only 1 photo for 2-photo layout)
        </p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Broken Image URL</h3>
        <CollagePreview
          photos={photosWithError}
          layout={LAYOUTS_V3.side_by_side}
        />
        <p className="text-xs opacity-60 mt-2">
          First photo has invalid URL, shows error state
        </p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Invalid Photo Count</h3>
        <CollagePreview
          photos={validPhotos}
          layout={LAYOUTS_V3.classic_grid}
        />
        <p className="text-xs opacity-60 mt-2">
          1 photo provided but classic_grid requires 4 photos
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 7: Full Workflow Integration
// ============================================================================
export function FullWorkflowExample() {
  const [photos, setPhotos] = useState([])
  const [layout, setLayout] = useState(LAYOUTS_V3.side_by_side)
  const [transforms, setTransforms] = useState({})

  // Simulate photo selection
  const addPhoto = () => {
    const newPhoto = {
      id: `photo${photos.length + 1}`,
      url: `/img${photos.length + 1}.jpg`,
      thumbnail: `/img${photos.length + 1}_thumb.jpg`,
      filename: `Photo ${photos.length + 1}.jpg`
    }
    setPhotos([...photos, newPhoto])
  }

  // Simulate transform update
  const updateTransform = (photoId) => {
    setTransforms({
      ...transforms,
      [photoId]: {
        scale: 1 + Math.random() * 0.5,
        translateX: Math.random() * 20 - 10,
        translateY: Math.random() * 20 - 10
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Full Workflow Example</h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={addPhoto}
            disabled={photos.length >= layout.maxPhotos}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            Add Photo ({photos.length}/{layout.maxPhotos})
          </button>
          <button
            onClick={() => setPhotos([])}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Clear All
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setLayout(LAYOUTS_V3.side_by_side)}
            className="px-3 py-1 bg-white/10 rounded"
          >
            Side by Side
          </button>
          <button
            onClick={() => setLayout(LAYOUTS_V3.classic_grid)}
            className="px-3 py-1 bg-white/10 rounded"
          >
            Classic Grid
          </button>
          <button
            onClick={() => setLayout(LAYOUTS_V3.polaroid)}
            className="px-3 py-1 bg-white/10 rounded"
          >
            Polaroid
          </button>
        </div>
      </div>

      {/* Preview */}
      {photos.length > 0 ? (
        <CollagePreview
          photos={photos}
          layout={layout}
          transforms={transforms}
          onImageClick={updateTransform}
        />
      ) : (
        <div className="p-12 border-2 border-dashed border-white/20 rounded-xl text-center">
          <p className="opacity-60">Add photos to start building your collage</p>
        </div>
      )}

      {/* Transform display */}
      {Object.keys(transforms).length > 0 && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-sm font-medium mb-2">Transforms:</p>
          <pre className="text-xs opacity-70">
            {JSON.stringify(transforms, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================
export default {
  BasicExample,
  WithTransformsExample,
  InteractiveExample,
  LoadingExample,
  ResponsiveExample,
  ErrorStatesExample,
  FullWorkflowExample
}
