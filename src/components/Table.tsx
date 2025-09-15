import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import type { SortField } from "../interfaces";

export default function Table({
  handleSort,
  getSortIcon,
  filteredAndSortedStocks,
  formatNumber,
  formatVolume,
}: {
  handleSort: (key: SortField) => void;
  getSortIcon: (key: SortField) => React.ReactNode;
  filteredAndSortedStocks: any[];
  formatNumber: (num: number) => string;
  formatVolume: (num: number) => string;
}) {
  return (
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
            {filteredAndSortedStocks.map((stock) => (
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
  );
}
