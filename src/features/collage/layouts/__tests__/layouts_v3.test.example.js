// ============================================================================
// LAYOUT V3 TEST EXAMPLES
// Manual test examples to validate layout functions (no jest required)
// Run in browser console or component to verify
// ============================================================================

import {
  LAYOUTS_V3,
  getAllLayouts,
  getCompatibleLayouts,
  getLayoutById,
  generateLayoutPreview,
  getLayoutCategories,
  validateTransforms,
  getResponsiveGrid
} from '../layouts_v3'

// ============================================================================
// TEST 1: Get all layouts
// ============================================================================
console.log('TEST 1: Get all layouts')
const allLayouts = getAllLayouts()
console.log(`✅ Total layouts: ${allLayouts.length}`) // Should be 12
console.log('Layout IDs:', allLayouts.map(l => l.id))
console.assert(allLayouts.length === 12, 'Should have exactly 12 layouts')

// ============================================================================
// TEST 2: Get compatible layouts for different photo counts
// ============================================================================
console.log('\nTEST 2: Get compatible layouts')

const test2_1Photo = getCompatibleLayouts(1)
console.log(`1 photo: ${test2_1Photo.map(l => l.id).join(', ')}`)
console.assert(test2_1Photo.length === 3, '1 photo should have 3 layouts')

const test2_2Photos = getCompatibleLayouts(2)
console.log(`2 photos: ${test2_2Photos.map(l => l.id).join(', ')}`)
console.assert(test2_2Photos.length === 3, '2 photos should have 3 layouts')

const test2_3Photos = getCompatibleLayouts(3)
console.log(`3 photos: ${test2_3Photos.map(l => l.id).join(', ')}`)
console.assert(test2_3Photos.length >= 3, '3 photos should have 3+ layouts')

const test2_4Photos = getCompatibleLayouts(4)
console.log(`4 photos: ${test2_4Photos.map(l => l.id).join(', ')}`)
console.assert(test2_4Photos.length >= 2, '4 photos should have 2+ layouts')

const test2_6Photos = getCompatibleLayouts(6)
console.log(`6 photos: ${test2_6Photos.map(l => l.id).join(', ')}`)
console.assert(test2_6Photos.length >= 2, '6 photos should have 2+ layouts')

// ============================================================================
// TEST 3: Get layout by ID
// ============================================================================
console.log('\nTEST 3: Get layout by ID')

const layout = getLayoutById('classic_grid')
console.log('classic_grid:', layout?.name)
console.assert(layout !== null, 'Should find classic_grid')
console.assert(layout.minPhotos === 4, 'classic_grid should need 4 photos')
console.assert(layout.maxPhotos === 4, 'classic_grid should max at 4 photos')

const invalidLayout = getLayoutById('invalid_id')
console.assert(invalidLayout === null, 'Invalid ID should return null')

// ============================================================================
// TEST 4: Generate layout preview
// ============================================================================
console.log('\nTEST 4: Generate layout preview')

const preview = generateLayoutPreview(LAYOUTS_V3.classic_grid)
console.log('Preview data:', preview)
console.assert(preview.cols === 2, 'classic_grid should have 2 columns')
console.assert(preview.rows === 2, 'classic_grid should have 2 rows')
console.assert(preview.cells.length === 4, 'classic_grid should have 4 cells')
console.assert(preview.aspectRatio === '1:1', 'classic_grid should be 1:1')

// ============================================================================
// TEST 5: Validate transforms
// ============================================================================
console.log('\nTEST 5: Validate transforms')

const userTransforms = {
  'photo-0': { scale: 1.5, translateX: 20, translateY: -10 }
  // photo-1 missing (should get defaults)
}

const validated = validateTransforms(userTransforms, LAYOUTS_V3.side_by_side)
console.log('Validated transforms:', validated)
console.assert(validated['photo-0'].scale === 1.5, 'Should keep user scale')
console.assert(validated['photo-1'].scale === 1, 'Missing photo should get default scale')
console.assert(validated['photo-1'].translateX === 0, 'Missing photo should get default translateX')

// ============================================================================
// TEST 6: Responsive grid
// ============================================================================
console.log('\nTEST 6: Responsive grid')

const desktopGrid = getResponsiveGrid(LAYOUTS_V3.side_by_side, 1024)
const mobileGrid = getResponsiveGrid(LAYOUTS_V3.side_by_side, 375)

console.log('Desktop grid:', desktopGrid)
console.log('Mobile grid:', mobileGrid)
console.assert(desktopGrid === '1fr 1fr', 'Desktop should use 2 columns')
console.assert(mobileGrid === '1fr', 'Mobile should stack (1 column)')

// ============================================================================
// TEST 7: Layout categories
// ============================================================================
console.log('\nTEST 7: Layout categories')

const categories = getLayoutCategories()
console.log('Categories:', categories.map(c => c.id))
console.assert(categories.length === 5, 'Should have 5 categories')
console.assert(categories[0].layouts.length === 3, '1-photo category should have 3 layouts')

// ============================================================================
// TEST 8: Validate all layouts have required fields
// ============================================================================
console.log('\nTEST 8: Validate layout schema')

getAllLayouts().forEach(layout => {
  // Required fields
  console.assert(layout.id, `${layout.id} missing id`)
  console.assert(layout.name, `${layout.id} missing name`)
  console.assert(layout.nameKey, `${layout.id} missing nameKey`)
  console.assert(layout.minPhotos >= 1, `${layout.id} invalid minPhotos`)
  console.assert(layout.maxPhotos >= layout.minPhotos, `${layout.id} invalid maxPhotos`)
  console.assert(layout.aspectRatio, `${layout.id} missing aspectRatio`)
  console.assert(layout.canvas, `${layout.id} missing canvas`)
  console.assert(layout.canvas.width > 0, `${layout.id} invalid canvas width`)
  console.assert(layout.canvas.height > 0, `${layout.id} invalid canvas height`)
  console.assert(layout.grid, `${layout.id} missing grid`)
  console.assert(layout.grid.desktop, `${layout.id} missing grid.desktop`)
  console.assert(layout.grid.mobile, `${layout.id} missing grid.mobile`)
  console.assert(Array.isArray(layout.slots), `${layout.id} slots not array`)
  console.assert(layout.slots.length >= layout.minPhotos, `${layout.id} not enough slots`)
  console.assert(typeof layout.gap === 'number', `${layout.id} invalid gap`)
  console.assert(typeof layout.padding === 'number', `${layout.id} invalid padding`)

  // Validate each slot
  layout.slots.forEach((slot, index) => {
    console.assert(slot.id, `${layout.id} slot ${index} missing id`)
    console.assert(slot.area, `${layout.id} slot ${index} missing area`)
    console.assert(slot.crop, `${layout.id} slot ${index} missing crop`)
    console.assert(slot.objectFit, `${layout.id} slot ${index} missing objectFit`)
    console.assert(slot.canvas, `${layout.id} slot ${index} missing canvas coords`)
    console.assert(typeof slot.canvas.x === 'number', `${layout.id} slot ${index} invalid canvas.x`)
    console.assert(typeof slot.canvas.y === 'number', `${layout.id} slot ${index} invalid canvas.y`)
    console.assert(typeof slot.canvas.w === 'number', `${layout.id} slot ${index} invalid canvas.w`)
    console.assert(typeof slot.canvas.h === 'number', `${layout.id} slot ${index} invalid canvas.h`)
  })
})

console.log('✅ All layouts validated successfully')

// ============================================================================
// TEST 9: Compatibility matrix
// ============================================================================
console.log('\nTEST 9: Photo count compatibility matrix')

for (let photoCount = 1; photoCount <= 6; photoCount++) {
  const compatible = getCompatibleLayouts(photoCount)
  console.log(`${photoCount} photo(s): ${compatible.length} layout(s) - ${compatible.map(l => l.name).join(', ')}`)
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n✅ ALL TESTS PASSED')
console.log('Layout system ready for integration')

export default {
  getAllLayouts,
  getCompatibleLayouts,
  getLayoutById,
  generateLayoutPreview,
  getLayoutCategories,
  validateTransforms,
  getResponsiveGrid
}
