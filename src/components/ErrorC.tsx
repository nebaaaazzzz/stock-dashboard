import { AlertCircle } from "lucide-react";
export default function ErrorC({
  error,
  fetchStockData,
}: {
  error: string;
  fetchStockData: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchStockData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
