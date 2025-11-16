// ============================================================================
// EXAMPLE: LayoutSelector Usage Examples
// Demonstrates different use cases for LayoutSelector component
// ============================================================================
import React, { useState } from 'react'
import LayoutSelector from '../LayoutSelector'
import { LAYOUTS_V3 } from '../../layouts/layouts_v3'

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================
export function BasicExample() {
  const [selectedLayout, setSelectedLayout] = useState(null)
  const photoCount = 4

  return (
    <div className="h-screen">
      <LayoutSelector
        photoCount={photoCount}
        selectedLayout={selectedLayout}
        onSelect={(layout) => {
          setSelectedLayout(layout)
          console.log('Selected layout:', layout)
        }}
      />

      {/* Result display */}
      {selectedLayout && (
        <div className="fixed bottom-4 right-4 p-4 bg-white/10 backdrop-blur rounded-xl max-w-xs">
          <p className="text-sm font-medium mb-2">Selected Layout</p>
          <pre className="text-xs opacity-70">{JSON.stringify(selectedLayout, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: With Different Photo Counts
// ============================================================================
export function DifferentPhotoCountsExample() {
  const [photoCount, setPhotoCount] = useState(3)
  const [selectedLayout, setSelectedLayout] = useState(null)

  return (
    <div className="h-screen flex flex-col">
      {/* Photo count selector */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <label className="flex items-center gap-3">
          <span className="text-sm font-medium">Photo Count:</span>
          <input
            type="range"
            min={1}
            max={6}
            value={photoCount}
            onChange={(e) => {
              setPhotoCount(parseInt(e.target.value))
              setSelectedLayout(null) // Reset selection
            }}
            className="flex-1 max-w-xs accent-blue-500"
          />
          <span className="text-sm font-mono">{photoCount}</span>
        </label>
      </div>

      {/* Layout selector */}
      <div className="flex-1 overflow-hidden">
        <LayoutSelector
          photoCount={photoCount}
          selectedLayout={selectedLayout}
          onSelect={setSelectedLayout}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: With Back Button
// ============================================================================
export function WithBackButtonExample() {
  const [step, setStep] = useState(2) // On layout selection step
  const [photoCount] = useState(4)
  const [selectedLayout, setSelectedLayout] = useState(null)

  return (
    <div className="h-screen">
      {step === 1 && (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 bg-blue-600 rounded-lg"
          >
            Go to Layout Selection
          </button>
        </div>
      )}

      {step === 2 && (
        <LayoutSelector
          photoCount={photoCount}
          selectedLayout={selectedLayout}
          onSelect={(layout) => {
            setSelectedLayout(layout)
            console.log('Selected:', layout)
            setStep(3) // Move to next step
          }}
          onBack={() => setStep(1)}
          showBack={true}
        />
      )}

      {step === 3 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-xl mb-4">Layout selected! Moving to customization...</p>
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
// EXAMPLE 4: With Initial Selection
// ============================================================================
export function WithInitialSelectionExample() {
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS_V3.classic_grid)
  const photoCount = 4

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-blue-500/10 border-b border-blue-500/30">
        <p className="text-sm">Editing existing collage with "Classic Grid" layout</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <LayoutSelector
          photoCount={photoCount}
          selectedLayout={selectedLayout}
          onSelect={(layout) => {
            setSelectedLayout(layout)
            console.log('Changed layout to:', layout)
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Show Incompatible Layouts
// ============================================================================
export function ShowIncompatibleExample() {
  const [photoCount] = useState(2)
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [showAll, setShowAll] = useState(false)

  return (
    <div className="h-screen flex flex-col">
      {/* Toggle */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Show incompatible layouts (grayed out)</span>
        </label>
      </div>

      {/* Selector */}
      <div className="flex-1 overflow-hidden">
        <LayoutSelector
          photoCount={photoCount}
          selectedLayout={selectedLayout}
          onSelect={setSelectedLayout}
          showIncompatible={showAll}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Auto-Fill Demo
// ============================================================================
export function AutoFillExample() {
  const [photoCount, setPhotoCount] = useState(3)
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  return (
    <div className="h-screen flex">
      {/* Selector */}
      <div className="flex-1 overflow-hidden">
        <LayoutSelector
          photoCount={photoCount}
          selectedLayout={selectedLayout}
          onSelect={(layout) => {
            setSelectedLayout(layout)
            addLog(`Selected ${layout.name}`)
          }}
        />
      </div>

      {/* Log panel */}
      <div className="w-80 bg-white/5 border-l border-white/10 p-4">
        <h3 className="font-semibold mb-3">Auto-Fill Test</h3>

        {/* Photo count control */}
        <div className="mb-4">
          <label className="text-sm opacity-70 mb-2 block">Photos: {photoCount}</label>
          <input
            type="range"
            min={1}
            max={6}
            value={photoCount}
            onChange={(e) => {
              const count = parseInt(e.target.value)
              setPhotoCount(count)
              setSelectedLayout(null)
              addLog(`Changed photo count to ${count}`)
            }}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Clear button */}
        <button
          onClick={() => {
            setSelectedLayout(null)
            addLog('Cleared selection')
          }}
          className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm mb-4"
        >
          Clear Selection
        </button>

        {/* Event log */}
        <h3 className="font-semibold mb-2 text-sm">Event Log:</h3>
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
// EXAMPLE 7: Grouped by Category
// ============================================================================
export function GroupedCategoryExample() {
  const [photoCount] = useState(6) // All layouts available
  const [selectedLayout, setSelectedLayout] = useState(null)

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-white/5 border-b border-white/10">
        <h3 className="font-semibold mb-2">All 12 Layouts Grouped</h3>
        <p className="text-xs opacity-70">
          With 6 photos, all layouts are available and grouped by photo count
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <LayoutSelector
          photoCount={photoCount}
          selectedLayout={selectedLayout}
          onSelect={(layout) => {
            setSelectedLayout(layout)
            console.log('Selected:', layout)
          }}
          showIncompatible={false}
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
  DifferentPhotoCountsExample,
  WithBackButtonExample,
  WithInitialSelectionExample,
  ShowIncompatibleExample,
  AutoFillExample,
  GroupedCategoryExample
}
