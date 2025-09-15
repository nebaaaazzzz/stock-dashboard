import { RefreshCw } from "lucide-react";
export default function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Loading Stock Data
          </h2>
          <p className="text-gray-500">
            Fetching the latest market information...
          </p>
        </div>
      </div>
    </div>
  );
}
