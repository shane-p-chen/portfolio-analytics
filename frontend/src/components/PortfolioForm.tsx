import type { Holding, StockSearchResult } from "../types";
import HoldingRow from "./HoldingRow";

type PortfolioFormProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  benchmark: string;
  onBenchmarkChange: (value: string) => void;
  holdings: Holding[];
  searchResults: StockSearchResult[];
  activeHoldingIndex: number | null;
  onTickerFieldChange: (index: number, value: string) => void;
  onWeightChange: (index: number, weight: number | "") => void;
  onSearchResultSelect: (index: number, symbol: string) => void;
  onAddHolding: () => void;
  onRemoveHolding: (index: number) => void;
  onAnalyze: () => void;
  loading: boolean;
};

function PortfolioForm({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  benchmark,
  onBenchmarkChange,
  holdings,
  searchResults,
  activeHoldingIndex,
  onTickerFieldChange,
  onWeightChange,
  onSearchResultSelect,
  onAddHolding,
  onRemoveHolding,
  onAnalyze,
  loading,
}: PortfolioFormProps) {
  return (
    <>
      <label>Start Date</label>
      <input
        type='date'
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
      />

      <label>End Date</label>
      <input
        type='date'
        value={endDate}
        onChange={(event) => onEndDateChange(event.target.value)}
      />

      <label>Benchmark</label>
      <select
        value={benchmark}
        onChange={(event) => onBenchmarkChange(event.target.value)}
      >
        <option value="^GSPC">S&P 500</option>
        <option value="^NDX">NASDAQ-100</option>
        <option value="^DJI">Dow Jones</option>
      </select>
      <h2>Holdings</h2>
      {holdings.map((holding, index) => (
        <HoldingRow
          key={index}
          holding={holding}
          index={index}
          isSearchActive={activeHoldingIndex === index}
          searchResults={searchResults}
          onTickerFieldChange={onTickerFieldChange}
          onWeightChange={onWeightChange}
          onRemove={onRemoveHolding}
          onSearchResultSelect={onSearchResultSelect}
        />
      ))}

      <button onClick={onAddHolding}>
        Add Holding
      </button>

      <button
        onClick={onAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Portfolio"}
      </button>
    </>
  );
}

export default PortfolioForm;
