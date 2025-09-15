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

export type { StockData, SortField, SortDirection };
