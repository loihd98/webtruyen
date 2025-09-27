export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-4 w-96 bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Search and Filter Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Stories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
