import { useEffect, useState } from "react";
import { searchStocks } from "../api/portfolio";
import type { StockSearchResult } from "../types";

type SearchState = {
  query: string;
  results: StockSearchResult[];
  error: string;
};

export function useStockSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState<SearchState | null>(null);
  const [activeHoldingIndex, setActiveHoldingIndex] = useState<number | null>(null);
  const query = searchQuery.trim();

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const results = await searchStocks(query);
        if (!cancelled) setSearch({ query, results, error: "" });
      } catch {
        if (!cancelled) setSearch({ query, results: [], error: "Search unavailable. You can still enter a ticker manually." });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function clearSearch() {
    setSearchQuery("");
    setSearch(null);
    setActiveHoldingIndex(null);
  }

  const current = query && search?.query === query ? search : null;
  return {
    setSearchQuery,
    searchResults: current?.results ?? [],
    searchLoading: Boolean(query && !current),
    searchError: current?.error ?? "",
    activeHoldingIndex,
    setActiveHoldingIndex,
    clearSearch,
  };
}
