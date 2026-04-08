export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-3 border-yellow-200 border-t-yellow-500 rounded-full animate-spin`}
        style={{ borderTopColor: '#C9A227' }}
      />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="product-card animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-t-2xl" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-14 h-14 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" style={{ borderTopColor: '#C9A227' }} />
      <p className="text-gray-500 text-sm animate-pulse">Loading Himaya Jewels...</p>
    </div>
  )
}
