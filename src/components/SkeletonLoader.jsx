const SkeletonLoader = ({ type = 'photo', count = 1 }) => {
  if (type === 'photo') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (type === 'album') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default SkeletonLoader
