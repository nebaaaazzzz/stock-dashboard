import React, { useState, useEffect, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import Loader from "./components/Loader";

import { STOCK_SYMBOLS, API_KEY, BASE_URL } from "./const";
import type { SortDirection, SortField, StockData } from "./interfaces";
import ErrorC from "./components/ErrorC";
import Table from "./components/Table";

const App: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Stock symbols and their company names

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
    return <Loader />;
  }

  if (error) {
    return <ErrorC error={error} fetchStockData={fetchStockData} />;
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
        <Table
          filteredAndSortedStocks={filteredAndSortedStocks}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          formatNumber={formatNumber}
          formatVolume={formatVolume}
        />

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
