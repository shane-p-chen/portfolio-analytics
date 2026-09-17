export type Holding = {
  ticker: string;
  weight: number | "";
};

export type PerformancePoint = {
  date: string;
  return: number;
  benchmark_return: number | null;
};

export type PortfolioResult = {
  total_return: number;
  annual_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  performance_history: PerformancePoint[];
  asset_contributions: Record<string, number>;
};

export type StockSearchResult = {
  symbol: string;
  name: string;
};

export type AnalyzeRequest = {
  tickers: string[];
  weights: Record<string, number>;
  start_date: string;
  end_date: string;
  risk_free_rate: number;
  benchmark: string;
};
