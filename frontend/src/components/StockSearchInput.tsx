import type { StockSearchResult } from "../types";

type StockSearchInputProps = {
  value: string;
  results: StockSearchResult[];
  isOpen: boolean;
  onChange: (value: string) => void;
  onSelect: (symbol: string) => void;
};

function StockSearchInput({ value, results, isOpen, onChange, onSelect }: StockSearchInputProps) {
  return (
    <div className='stock-search'>
      <input
        type='text'
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {isOpen && results.length > 0 && (
        <div className='search-dropdown'>
          {results.map((stock) => (
            <button
              className='search-result'
              key={stock.symbol}
              type='button'
              onClick={() => onSelect(stock.symbol)}
            >
              <strong>{stock.symbol}</strong>
              <span>{stock.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StockSearchInput;
