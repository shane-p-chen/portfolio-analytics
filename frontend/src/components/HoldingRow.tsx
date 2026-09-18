import type { Holding, StockSearchResult } from "../types";
import StockSearchInput from "./StockSearchInput";

type HoldingRowProps = {
  holding: Holding;
  index: number;
  isSearchActive: boolean;
  searchResults: StockSearchResult[];
  searchLoading: boolean;
  searchError: string;
  onTickerFieldChange: (index: number, value: string) => void;
  onWeightChange: (index: number, weight: number | "") => void;
  onRemove: (index: number) => void;
  onSearchResultSelect: (index: number, symbol: string) => void;
};
function HoldingRow({ holding, index, isSearchActive, searchResults, searchLoading, searchError, onTickerFieldChange, onWeightChange, onRemove, onSearchResultSelect }: HoldingRowProps) {
  return (
    <div className="holding-row">
      <div className="field">
        <label htmlFor={`ticker-${index}`}>Asset <span className="sr-only">{index + 1} ticker</span></label>
        <StockSearchInput id={`ticker-${index}`} value={holding.ticker} results={searchResults}
          isOpen={isSearchActive} loading={searchLoading} error={searchError}
          onChange={(value) => onTickerFieldChange(index, value)}
          onSelect={(symbol) => onSearchResultSelect(index, symbol)} />
      </div>
      <div className="field">
        <label htmlFor={`weight-${index}`}>Weight <span className="sr-only">for asset {index + 1}, percent</span></label>
        <div className="weight-input">
          <input id={`weight-${index}`} type="number" step="any" value={holding.weight}
            onChange={(event) => onWeightChange(index, event.target.value === "" ? "" : Number(event.target.value))} />
          <span aria-hidden="true">%</span>
        </div>
      </div>
      <button className="remove-button" type="button" onClick={() => onRemove(index)}
        aria-label={`Remove holding ${index + 1}${holding.ticker ? `: ${holding.ticker}` : ""}`} title="Remove holding">×</button>
    </div>
  );
}
export default HoldingRow;
