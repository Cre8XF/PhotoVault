import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

/**
 * Sortable Photo Card with drag handle
 */
function SortablePhotoCard({ photo, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Drag Handle - Touch-friendly 44x44px minimum */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 bg-black/50 p-2.5 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-target"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <GripVertical className="w-6 h-6 text-white" />
      </div>

      {/* Photo Card */}
      <div
        onClick={() => onClick(photo)}
        className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
      >
        <img
          src={photo.url}
          alt={photo.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  )
}

/**
 * Draggable Photo Grid Component
 */
export default function DraggablePhotoGrid({ photos, onReorder, onPhotoClick }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex(p => p.id === active.id)
    const newIndex = photos.findIndex(p => p.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={photos.map(p => p.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <SortablePhotoCard
              key={photo.id}
              photo={photo}
              onClick={onPhotoClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
