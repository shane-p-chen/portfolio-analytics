import { useEffect, useState } from "react";
import { searchStocks } from "../api/portfolio";
import type { StockSearchResult } from "../types";

export function useStockSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedResults, setFetchedResults] = useState<StockSearchResult[]>([]);
  const [activeHoldingIndex, setActiveHoldingIndex] = useState<number | null>(null);

  async function runSearch(query: string) {
    const normalizedQuery = query.trim();

    if (normalizedQuery === "") {
      setFetchedResults([]);
      return;
    }

    try {
      const results = await searchStocks(normalizedQuery);
      setFetchedResults(results);
    } catch (error) {
      console.error(error);
      setFetchedResults([]);
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      return;
    }
    const timer = setTimeout(() => {
      runSearch(searchQuery);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  function clearSearch() {
    setFetchedResults([]);
    setActiveHoldingIndex(null);
  }

  const searchResults = searchQuery.trim() === "" ? [] : fetchedResults;

  return {
    setSearchQuery,
    searchResults,
    activeHoldingIndex,
    setActiveHoldingIndex,
    clearSearch,
  };
}
