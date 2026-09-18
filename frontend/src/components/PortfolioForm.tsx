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
  searchLoading: boolean;
  searchError: string;
  activeHoldingIndex: number | null;
  onTickerFieldChange: (index: number, value: string) => void;
  onWeightChange: (index: number, weight: number | "") => void;
  onSearchResultSelect: (index: number, symbol: string) => void;
  onAddHolding: () => void;
  onRemoveHolding: (index: number) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string;
};

function PortfolioForm({ startDate, endDate, onStartDateChange, onEndDateChange, benchmark, onBenchmarkChange, holdings, searchResults, searchLoading, searchError, activeHoldingIndex, onTickerFieldChange, onWeightChange, onSearchResultSelect, onAddHolding, onRemoveHolding, onAnalyze, loading, error }: PortfolioFormProps) {
  const totalWeight = holdings.reduce((total, holding) => total + (holding.weight || 0), 0);
  return (
    <form className="panel configuration" aria-labelledby="configuration-title" onSubmit={(event) => { event.preventDefault(); if (!loading) onAnalyze(); }}>
      <div className="section-heading">
        <h2 id="configuration-title">Build your portfolio</h2>
        <p>Set your allocation and analysis period.</p>
      </div>
      <div className="form-fields">
        <div className="date-fields">
          <div className="field"><label htmlFor="start-date">Start date</label>
            <input id="start-date" type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} />
          </div>
          <div className="field"><label htmlFor="end-date">End date</label>
            <input id="end-date" type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} />
          </div>
        </div>
        <div className="field"><label htmlFor="benchmark">Compare against</label>
          <select id="benchmark" value={benchmark} onChange={(event) => onBenchmarkChange(event.target.value)}>
            <option value="^GSPC">S&P 500</option><option value="^NDX">NASDAQ-100</option><option value="^DJI">Dow Jones</option>
          </select>
        </div>
      </div>
      <section className="holdings-section" aria-labelledby="holdings-title">
        <div className="holdings-heading">
          <h3 id="holdings-title">Holdings</h3>
          <span className={`allocation ${Math.abs(totalWeight - 100) < 0.001 ? "complete" : ""}`}>{totalWeight.toFixed(1)}% allocated</span>
        </div>
        <div className="holdings-list">
          {holdings.map((holding, index) => (
            <HoldingRow key={index} holding={holding} index={index} isSearchActive={activeHoldingIndex === index}
              searchResults={searchResults} searchLoading={searchLoading} searchError={searchError}
              onTickerFieldChange={onTickerFieldChange} onWeightChange={onWeightChange}
              onRemove={onRemoveHolding} onSearchResultSelect={onSearchResultSelect} />
          ))}
        </div>
        {holdings.length === 0 && <p className="form-note">Add a holding to start building your portfolio.</p>}
        <button className="secondary-button" type="button" onClick={onAddHolding}>+ Add holding</button>
        <p className="form-note">Search by ticker or company. Weights should total 100%.</p>
      </section>
      {error && <div className="alert" role="alert"><strong>Unable to analyze portfolio</strong><p>{error}</p></div>}
      <button className="primary-button" type="submit" disabled={loading}>{loading ? "Analyzing…" : "Analyze portfolio"}</button>
      <p className="form-note">Change your inputs and analyze again to update results.</p>
    </form>
  );
}
export default PortfolioForm;
