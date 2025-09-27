export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse h-16"></div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-96 bg-gray-100 animate-pulse"></div>
      </div>
    </div>
  );
}
