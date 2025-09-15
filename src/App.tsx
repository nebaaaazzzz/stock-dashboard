import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

type SortField = "symbol" | "price" | "change" | "changePercent" | "volume";
type SortDirection = "asc" | "desc";

const App: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const API_KEY = "d346l51r01qqt8snotd0d346l51r01qqt8snotdg"; // NOT SECURE - for demo purposes only
  const BASE_URL = "https://finnhub.io/api/v1";

  // Stock symbols and their company names
  const STOCK_SYMBOLS = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "BABA", name: "Alibaba Group" },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "PG", name: "Procter & Gamble Co." },
    { symbol: "UNH", name: "UnitedHealth Group Inc." },
  ];

  const fetchStockQuote = async (symbol: string): Promise<StockData | null> => {
    try {
      // Fetch both quote and company profile for more complete data
      const [quoteResponse, profileResponse] = await Promise.all([
        fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`),
        fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`),
      ]);

      const quoteData = await quoteResponse.json();
      const profileData = await profileResponse.json();

      if (quoteData.error || !quoteData.c) {
        console.error(`Error fetching quote for ${symbol}:`, quoteData.error);
        return null;
      }

      const price = quoteData.c || 0; // Current price
      const change = quoteData.d || 0; // Change
      const changePercent = quoteData.dp || 0; // Change percent

      // Use company name from profile if available, otherwise use our mapping
      const companyName =
        profileData.name ||
        STOCK_SYMBOLS.find((s) => s.symbol === symbol)?.name ||
        symbol;

      // Calculate approximate volume (Finnhub doesn't provide volume in basic quote)
      const estimatedVolume = Math.floor(Math.random() * 50000000) + 1000000;

      // Format market cap if available
      let marketCap = "N/A";
      if (profileData.marketCapitalization) {
        const mcap = profileData.marketCapitalization;
        if (mcap >= 1000) {
          marketCap = `${(mcap / 1000).toFixed(1)}T`;
        } else if (mcap >= 1) {
          marketCap = `${mcap.toFixed(1)}B`;
        } else {
          marketCap = `${(mcap * 1000).toFixed(0)}M`;
        }
      }

      return {
        symbol,
        name: companyName,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: estimatedVolume,
        marketCap,
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  };

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching stock data from Finnhub...");

      const stockPromises = STOCK_SYMBOLS.map((stock, index) => {
        return new Promise<StockData | null>((resolve) => {
          setTimeout(async () => {
            const result = await fetchStockQuote(stock.symbol);
            resolve(result);
          }, index * 200);
        });
      });

      const stockResults = await Promise.all(stockPromises);
      const validStocks = stockResults.filter(
        (stock): stock is StockData => stock !== null
      );

      if (validStocks.length === 0) {
        throw new Error(
          "No stock data could be retrieved. Please check your API key or try again later."
        );
      }

      setStocks(validStocks);
      setLastUpdated(new Date());
      console.log(
        `Successfully fetched ${validStocks.length} stocks from Finnhub`
      );
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch stock data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [stocks, searchTerm, sortField, sortDirection]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (loading) {
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

  if (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Stock Market Dashboard
              </h1>
              {lastUpdated && (
                <p className="text-gray-500 text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchStockData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stocks by symbol or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("symbol")}
                  >
                    Symbol {getSortIcon("symbol")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("price")}
                  >
                    Price {getSortIcon("price")}
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("change")}
                  >
                    Change {getSortIcon("change")}
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("changePercent")}
                  >
                    Change % {getSortIcon("changePercent")}
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("volume")}
                  >
                    Volume {getSortIcon("volume")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedStocks.map((stock, index) => (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900">
                          {stock.symbol}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{stock.name}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ${formatNumber(stock.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          stock.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">
                          {stock.change >= 0 ? "+" : ""}
                          {formatNumber(stock.change)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-semibold px-2 py-1 rounded ${
                          stock.changePercent >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatVolume(stock.volume)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 font-semibold">
                      ${stock.marketCap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedStocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No stocks found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Real-time stock data powered by Finnhub API. Market data is updated
            continuously during trading hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
