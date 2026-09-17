import type { Holding, StockSearchResult } from "../types";
import StockSearchInput from "./StockSearchInput";

type HoldingRowProps = {
  holding: Holding;
  index: number;
  isSearchActive: boolean;
  searchResults: StockSearchResult[];
  onTickerFieldChange: (index: number, value: string) => void;
  onWeightChange: (index: number, weight: number | "") => void;
  onRemove: (index: number) => void;
  onSearchResultSelect: (index: number, symbol: string) => void;
};

function HoldingRow({
  holding,
  index,
  isSearchActive,
  searchResults,
  onTickerFieldChange,
  onWeightChange,
  onRemove,
  onSearchResultSelect,
}: HoldingRowProps) {
  return (
    <div>
      <StockSearchInput
        value={holding.ticker}
        results={searchResults}
        isOpen={isSearchActive}
        onChange={(value) => onTickerFieldChange(index, value)}
        onSelect={(symbol) => onSearchResultSelect(index, symbol)}
      />

      <input
        type='number'
        value={holding.weight}
        onChange={(event) =>
          onWeightChange(
            index,
            event.target.value === "" ? "" : Number(event.target.value)
          )
        }
      />
      <span>%</span>
      <button onClick={() => onRemove(index)}>
        Remove
      </button>
    </div>
  );
}

export default HoldingRow;
