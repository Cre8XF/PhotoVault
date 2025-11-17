// ============================================================================
// EXAMPLE: ImagePickerV3 Usage Examples
// Demonstrates different use cases for ImagePickerV3 component
// ============================================================================
import React, { useState } from 'react'
import ImagePickerV3 from '../ImagePickerV3'

// Mock photo data
const mockPhotos = Array.from({ length: 50 }, (_, i) => ({
  id: `photo${i + 1}`,
  url: `https://picsum.photos/800/600?random=${i + 1}`,
  thumbnailUrl: `https://picsum.photos/400/300?random=${i + 1}`,
  filename: `Photo ${i + 1}.jpg`,
  uploadedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
  isFavorite: Math.random() > 0.7,
  isScreenshot: Math.random() > 0.8,
  aiTags: Math.random() > 0.6 ? ['nature', 'landscape', 'sunset'].slice(0, Math.floor(Math.random() * 3) + 1) : []
}))

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================
export function BasicExample() {
  const [selectedPhotos, setSelectedPhotos] = useState([])

  const handleSelect = (photos) => {
    setSelectedPhotos(photos)
    console.log('Selected photos:', photos)
  }

  return (
    <div className="h-screen">
      <ImagePickerV3
        photos={mockPhotos}
        onSelect={handleSelect}
        maxPhotos={6}
      />

      {/* Result display */}
      {selectedPhotos.length > 0 && (
        <div className="fixed bottom-4 right-4 p-4 bg-white/10 backdrop-blur rounded-xl max-w-xs">
          <p className="text-sm font-medium mb-2">
            Selected {selectedPhotos.length} photos
          </p>
          <div className="grid grid-cols-3 gap-2">
            {selectedPhotos.map(photo => (
              <img
                key={photo.id}
                src={photo.thumbnailUrl || photo.url}
                alt={photo.filename}
                className="w-full aspect-square object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: With Initial Selection (Editing)
// ============================================================================
export function WithInitialSelectionExample() {
  const initialPhotos = mockPhotos.slice(0, 4)
  const [selectedPhotos, setSelectedPhotos] = useState(initialPhotos)

  return (
    <div className="h-screen">
      <div className="p-4 bg-blue-500/10 border-b border-blue-500/30">
        <p className="text-sm">
          Editing existing collage with {initialPhotos.length} pre-selected photos
        </p>
      </div>

      <ImagePickerV3
        photos={mockPhotos}
        onSelect={(photos) => {
          setSelectedPhotos(photos)
          console.log('Updated selection:', photos)
        }}
        maxPhotos={6}
        initialSelection={initialPhotos}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: With Back Button
// ============================================================================
export function WithBackButtonExample() {
  const [step, setStep] = useState(2) // Simulating step 2 (photo selection)

  return (
    <div className="h-screen">
      {step === 1 && (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 bg-blue-600 rounded-lg"
          >
            Go to Photo Selection
          </button>
        </div>
      )}

      {step === 2 && (
        <ImagePickerV3
          photos={mockPhotos}
          onSelect={(photos) => {
            console.log('Selected:', photos)
            setStep(3)
          }}
          onBack={() => setStep(1)}
          showBack={true}
          maxPhotos={6}
        />
      )}

      {step === 3 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-xl mb-4">Photos selected! Moving to next step...</p>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-600 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Custom Max Photos
// ============================================================================
export function CustomMaxPhotosExample() {
  const [maxPhotos, setMaxPhotos] = useState(3)
  const [selectedPhotos, setSelectedPhotos] = useState([])

  return (
    <div className="h-screen flex flex-col">
      {/* Controls */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <label className="flex items-center gap-3">
          <span className="text-sm font-medium">Max Photos:</span>
          <input
            type="range"
            min={1}
            max={9}
            value={maxPhotos}
            onChange={(e) => {
              setMaxPhotos(parseInt(e.target.value))
              setSelectedPhotos([]) // Reset selection
            }}
            className="flex-1 max-w-xs accent-blue-500"
          />
          <span className="text-sm font-mono">{maxPhotos}</span>
        </label>
      </div>

      {/* Picker */}
      <div className="flex-1">
        <ImagePickerV3
          photos={mockPhotos}
          onSelect={setSelectedPhotos}
          maxPhotos={maxPhotos}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Filter Testing
// ============================================================================
export function FilterTestingExample() {
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Photos with specific attributes for testing
  const testPhotos = [
    ...mockPhotos.slice(0, 10).map(p => ({ ...p, isFavorite: true })),
    ...mockPhotos.slice(10, 20).map(p => ({ ...p, isScreenshot: true })),
    ...mockPhotos.slice(20, 30).map(p => ({
      ...p,
      aiTags: ['mountain', 'landscape', 'nature']
    })),
    ...mockPhotos.slice(30, 40).map(p => ({
      ...p,
      uploadedAt: new Date() // Recent
    })),
    ...mockPhotos.slice(40, 50)
  ]

  return (
    <div className="h-screen flex">
      {/* Picker */}
      <div className="flex-1">
        <ImagePickerV3
          photos={testPhotos}
          onSelect={(photos) => {
            addLog(`Selected ${photos.length} photos`)
          }}
          maxPhotos={6}
        />
      </div>

      {/* Log panel */}
      <div className="w-80 bg-white/5 border-l border-white/10 p-4">
        <h3 className="font-semibold mb-3">Test Data:</h3>
        <ul className="text-xs space-y-1 opacity-70 mb-4">
          <li>• 10 favorites (photo1-10)</li>
          <li>• 10 screenshots (photo11-20)</li>
          <li>• 10 AI tagged (photo21-30)</li>
          <li>• 10 recent (photo31-40)</li>
          <li>• 10 regular (photo41-50)</li>
        </ul>

        <h3 className="font-semibold mb-2">Event Log:</h3>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <p key={i} className="text-xs opacity-60">{log}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Search Testing
// ============================================================================
export function SearchTestingExample() {
  const searchablePhotos = mockPhotos.map((photo, i) => ({
    ...photo,
    filename: [
      'beach',
      'mountain',
      'city',
      'forest',
      'ocean',
      'sunset',
      'sunrise',
      'landscape'
    ][i % 8] + ` photo ${i + 1}.jpg`,
    aiTags: [
      ['nature', 'outdoor'],
      ['urban', 'architecture'],
      ['water', 'blue'],
      ['green', 'forest']
    ][i % 4]
  }))

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-white/5 border-b border-white/10">
        <h3 className="font-semibold mb-2">Search Test</h3>
        <p className="text-xs opacity-70">
          Try searching: "beach", "mountain", "nature", "urban", "water", etc.
        </p>
      </div>

      <div className="flex-1">
        <ImagePickerV3
          photos={searchablePhotos}
          onSelect={(photos) => console.log('Selected:', photos)}
          maxPhotos={6}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 7: Empty States
// ============================================================================
export function EmptyStatesExample() {
  const [scenario, setScenario] = useState('empty')

  const scenarios = {
    empty: {
      photos: [],
      label: 'No Photos'
    },
    noFavorites: {
      photos: mockPhotos.map(p => ({ ...p, isFavorite: false })),
      label: 'No Favorites (switch to Favorites tab)'
    },
    noSearchResults: {
      photos: mockPhotos,
      label: 'Search for "zzz" (no results)'
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Scenario selector */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <div className="flex gap-2">
          {Object.entries(scenarios).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`px-3 py-2 rounded-lg text-sm ${
                scenario === key
                  ? 'bg-blue-600'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Picker */}
      <div className="flex-1">
        <ImagePickerV3
          photos={scenarios[scenario].photos}
          onSelect={(photos) => console.log('Selected:', photos)}
          maxPhotos={6}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================
export default {
  BasicExample,
  WithInitialSelectionExample,
  WithBackButtonExample,
  CustomMaxPhotosExample,
  FilterTestingExample,
  SearchTestingExample,
  EmptyStatesExample
}
