import { API_BASE_URL } from "../config";
import type { AnalyzeRequest, PortfolioResult, StockSearchResult } from "../types";

export async function analyzePortfolio(payload: AnalyzeRequest): Promise<PortfolioResult> {
  const response = await fetch(`${API_BASE_URL}/portfolio/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail);
  }

  return data;
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/stocks/search?query=${encodeURIComponent(query)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Unable to search stocks");
  }

  return data;
}
