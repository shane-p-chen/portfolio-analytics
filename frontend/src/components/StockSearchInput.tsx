import type { StockSearchResult } from "../types";

type StockSearchInputProps = {
  id: string;
  value: string;
  results: StockSearchResult[];
  isOpen: boolean;
  loading: boolean;
  error: string;
  onChange: (value: string) => void;
  onSelect: (symbol: string) => void;
};

function StockSearchInput({ id, value, results, isOpen, loading, error, onChange, onSelect }: StockSearchInputProps) {
  const showSearch = isOpen && value.trim().length > 0;
  return (
    <div className="stock-search">
      <input id={id} type="text" value={value} autoComplete="off" spellCheck={false}
        placeholder="e.g. AAPL"
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={showSearch ? `${id}-feedback` : undefined} />
      {showSearch && (
        <div className="search-dropdown">
          <p id={`${id}-feedback`} className={loading || error || results.length === 0 ? "search-feedback" : "sr-only"} role="status">
            {loading ? "Searching stocks…" : error || (results.length === 0 ? "No matches. Check the ticker or company name." : `${results.length} matching stocks`)}
          </p>
          {!loading && !error && results.map((stock) => (
            <button className="search-result" key={stock.symbol} type="button" onClick={() => onSelect(stock.symbol)}>
              <strong>{stock.symbol}</strong><span>{stock.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default StockSearchInput;
