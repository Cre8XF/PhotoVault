// ============================================================================
// EXAMPLE: RepositionModal Usage Examples
// Demonstrates different use cases for RepositionModal component
// ============================================================================
import React, { useState } from 'react'
import RepositionModal from '../RepositionModal'

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================
export function BasicExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [transform, setTransform] = useState({ scale: 1, translateX: 0, translateY: 0 })

  const photo = {
    id: 'photo1',
    url: 'https://picsum.photos/800/600',
    thumbnailUrl: 'https://picsum.photos/400/300',
    filename: 'Beach Sunset.jpg'
  }

  const handleSave = (newTransform) => {
    setTransform(newTransform)
    console.log('Transform saved:', newTransform)
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Basic RepositionModal</h2>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Open Reposition Modal
      </button>

      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <p className="text-sm font-medium mb-2">Current Transform:</p>
        <pre className="text-xs opacity-70">
          {JSON.stringify(transform, null, 2)}
        </pre>
      </div>

      {isOpen && (
        <RepositionModal
          photo={photo}
          currentTransform={transform}
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: With Existing Transform
// ============================================================================
export function WithExistingTransformExample() {
  const [isOpen, setIsOpen] = useState(false)

  const photo = {
    id: 'photo2',
    url: 'https://picsum.photos/800/600?random=2',
    filename: 'Mountain View.jpg'
  }

  // Photo already has some adjustments
  const existingTransform = {
    scale: 1.5,
    translateX: 20,
    translateY: -10
  }

  const [transform, setTransform] = useState(existingTransform)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Existing Transform</h2>

      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm">Photo already adjusted (150% zoom, shifted)</p>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Edit Adjustment
      </button>

      {isOpen && (
        <RepositionModal
          photo={photo}
          currentTransform={transform}
          onSave={(newTransform) => {
            setTransform(newTransform)
            console.log('Updated transform:', newTransform)
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Integration with CollagePreview
// ============================================================================
export function CollageIntegrationExample() {
  const [repositionTarget, setRepositionTarget] = useState(null)
  const [transforms, setTransforms] = useState({})

  const photos = [
    {
      id: 'photo1',
      url: 'https://picsum.photos/800/600?random=3',
      filename: 'Photo 1.jpg'
    },
    {
      id: 'photo2',
      url: 'https://picsum.photos/800/600?random=4',
      filename: 'Photo 2.jpg'
    },
    {
      id: 'photo3',
      url: 'https://picsum.photos/800/600?random=5',
      filename: 'Photo 3.jpg'
    }
  ]

  const handlePhotoClick = (photoId) => {
    setRepositionTarget(photoId)
  }

  const handleSave = (newTransform) => {
    setTransforms({
      ...transforms,
      [repositionTarget]: newTransform
    })
    setRepositionTarget(null)
  }

  const currentPhoto = photos.find(p => p.id === repositionTarget)
  const currentTransform = transforms[repositionTarget] || { scale: 1, translateX: 0, translateY: 0 }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">CollagePreview Integration</h2>

      {/* Simulated photo grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {photos.map(photo => {
          const photoTransform = transforms[photo.id]
          const isAdjusted = photoTransform && (
            photoTransform.scale !== 1 ||
            photoTransform.translateX !== 0 ||
            photoTransform.translateY !== 0
          )

          return (
            <div
              key={photo.id}
              onClick={() => handlePhotoClick(photo.id)}
              className="relative aspect-square bg-black/20 rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500"
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <p className="text-sm">Click to adjust</p>
              </div>
              {isAdjusted && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {Math.round(photoTransform.scale * 100)}%
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Transform display */}
      <div className="p-4 bg-white/5 rounded-lg">
        <p className="text-sm font-medium mb-2">Transforms:</p>
        <pre className="text-xs opacity-70">
          {JSON.stringify(transforms, null, 2)}
        </pre>
      </div>

      {/* Modal */}
      {repositionTarget && currentPhoto && (
        <RepositionModal
          photo={currentPhoto}
          currentTransform={currentTransform}
          onSave={handleSave}
          onClose={() => setRepositionTarget(null)}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Keyboard Shortcuts Demo
// ============================================================================
export function KeyboardShortcutsExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastAction, setLastAction] = useState('')

  const photo = {
    id: 'photo3',
    url: 'https://picsum.photos/800/600?random=6',
    filename: 'Test Photo.jpg'
  }

  const handleSave = (transform) => {
    setLastAction(`Saved: ${JSON.stringify(transform)}`)
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts Test</h2>

      <div className="mb-4 p-4 bg-white/5 rounded-lg">
        <p className="text-sm font-medium mb-2">Available Shortcuts:</p>
        <ul className="text-sm space-y-1 opacity-70">
          <li><kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> - Close modal</li>
          <li><kbd className="px-2 py-1 bg-white/10 rounded">ENTER</kbd> - Save changes</li>
          <li><kbd className="px-2 py-1 bg-white/10 rounded">+</kbd> / <kbd className="px-2 py-1 bg-white/10 rounded">-</kbd> - Zoom in/out</li>
          <li><kbd className="px-2 py-1 bg-white/10 rounded">R</kbd> - Reset transform</li>
        </ul>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Open Modal (Try Keyboard Shortcuts)
      </button>

      {lastAction && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm">{lastAction}</p>
        </div>
      )}

      {isOpen && (
        <RepositionModal
          photo={photo}
          onSave={handleSave}
          onClose={() => {
            setIsOpen(false)
            setLastAction('Closed without saving')
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Touch Gestures (Mobile)
// ============================================================================
export function TouchGesturesExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [info, setInfo] = useState('')

  const photo = {
    id: 'photo4',
    url: 'https://picsum.photos/800/600?random=7',
    filename: 'Mobile Test.jpg'
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Touch Gestures Test</h2>

      <div className="mb-4 p-4 bg-white/5 rounded-lg">
        <p className="text-sm font-medium mb-2">Touch Interactions:</p>
        <ul className="text-sm space-y-1 opacity-70">
          <li>• Drag to reposition</li>
          <li>• Pinch to zoom (native browser gesture)</li>
          <li>• Tap outside to close</li>
          <li>• Min 44px tap targets for buttons</li>
        </ul>
      </div>

      <button
        onClick={() => {
          setIsOpen(true)
          setInfo('Try dragging and pinching on mobile')
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Open on Mobile
      </button>

      {info && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm">{info}</p>
        </div>
      )}

      {isOpen && (
        <RepositionModal
          photo={photo}
          onSave={(transform) => {
            setInfo(`Saved: Scale ${Math.round(transform.scale * 100)}%`)
          }}
          onClose={() => {
            setIsOpen(false)
            setInfo('Modal closed')
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Unsaved Changes Warning
// ============================================================================
export function UnsavedChangesExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState([])

  const photo = {
    id: 'photo5',
    url: 'https://picsum.photos/800/600?random=8',
    filename: 'Unsaved Test.jpg'
  }

  const addLog = (message) => {
    setLogs([...logs, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Unsaved Changes Confirmation</h2>

      <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm">Make changes, then try closing without saving</p>
      </div>

      <button
        onClick={() => {
          setIsOpen(true)
          addLog('Modal opened')
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Open Modal
      </button>

      {/* Event log */}
      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg max-h-40 overflow-y-auto">
          <p className="text-sm font-medium mb-2">Event Log:</p>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <p key={index} className="text-xs opacity-70">{log}</p>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <RepositionModal
          photo={photo}
          onSave={(transform) => {
            addLog(`Saved transform: ${JSON.stringify(transform)}`)
          }}
          onClose={() => {
            setIsOpen(false)
            addLog('Modal closed')
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 7: Zoom Limits Test
// ============================================================================
export function ZoomLimitsExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(100)

  const photo = {
    id: 'photo6',
    url: 'https://picsum.photos/800/600?random=9',
    filename: 'Zoom Test.jpg'
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Zoom Limits (100% - 300%)</h2>

      <div className="mb-4 p-4 bg-white/5 rounded-lg">
        <p className="text-sm font-medium mb-2">Zoom Constraints:</p>
        <ul className="text-sm space-y-1 opacity-70">
          <li>• Minimum: 100% (original size)</li>
          <li>• Maximum: 300% (3x zoom)</li>
          <li>• Step: 0.1 (10% increments for buttons)</li>
          <li>• Slider: Continuous (0.01 precision)</li>
        </ul>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Test Zoom Limits
      </button>

      <div className="mt-4 text-lg font-mono">
        Current Zoom: {currentZoom}%
      </div>

      {isOpen && (
        <RepositionModal
          photo={photo}
          currentTransform={{ scale: currentZoom / 100, translateX: 0, translateY: 0 }}
          onSave={(transform) => {
            setCurrentZoom(Math.round(transform.scale * 100))
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================
export default {
  BasicExample,
  WithExistingTransformExample,
  CollageIntegrationExample,
  KeyboardShortcutsExample,
  TouchGesturesExample,
  UnsavedChangesExample,
  ZoomLimitsExample
}
