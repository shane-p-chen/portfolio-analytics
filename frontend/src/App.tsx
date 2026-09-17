import { useState } from 'react';
import "./App.css";
import type { AnalyzeRequest, Holding, PortfolioResult } from "./types";
import { analyzePortfolio as analyzePortfolioApi } from "./api/portfolio";
import { useStockSearch } from "./hooks/useStockSearch";
import PortfolioForm from "./components/PortfolioForm";
import PortfolioMetrics from "./components/PortfolioMetrics";
import AssetContributionChart from "./components/AssetContributionChart";
import PerformanceChart from "./components/PerformanceChart";

function App() {

  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2026-01-01");
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: "AAPL", weight: 50 },
    { ticker: "MSFT", weight: 30 },
    { ticker: "GOOGL", weight: 20},
  ]);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [loading, setloading] = useState(false);
  const [error, setError] = useState("");
  const [benchmark, setBenchmark] = useState("^GSPC");

  const {
    setSearchQuery,
    searchResults,
    activeHoldingIndex,
    setActiveHoldingIndex,
    clearSearch,
  } = useStockSearch();

  function updateTicker(index: number, ticker: string){
    const updatedHoldings = [...holdings];
    updatedHoldings[index].ticker = ticker;
    setHoldings(updatedHoldings);
  }
  function updateWeight(index: number, weight: number | ""){
    const updatedHoldings = [...holdings];
    updatedHoldings[index].weight = weight;
    setHoldings(updatedHoldings);
  }
  function addHolding(){
    setHoldings([
      ...holdings,
      { ticker: "", weight: ""}
    ]);
  }
  function removeHolding(index: number){
    const updatedHoldings = holdings.filter(
      (_, holdingIndex) => holdingIndex !== index
    );
    setHoldings(updatedHoldings);
  }

  function handleTickerFieldChange(index: number, value: string) {
    updateTicker(index, value);
    setSearchQuery(value);
    setActiveHoldingIndex(index);
  }

  function handleSearchResultSelect(index: number, symbol: string) {
    updateTicker(index, symbol);
    clearSearch();
  }

  async function analyzePortfolio(){
    const tickers = holdings.map((holding) => holding.ticker);
    const weights: Record<string, number> = {};

    for(const holding of holdings) {
      if(holding.weight === ""){
        return;
      }
      weights[holding.ticker] = holding.weight/100;
    }
    const portfolioData: AnalyzeRequest = {
      tickers: tickers,
      weights: weights,
      start_date: startDate,
      end_date: endDate,
      risk_free_rate: 0.04,
      benchmark: benchmark
    };

    setloading(true);
    setError("");
    setResult(null);
    try{
      const data = await analyzePortfolioApi(portfolioData);
      setResult(data);
    } catch (error){
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setloading(false);
    }
  }

  return (
    <div>
      <h1>Portfolio Analytics</h1>
      <PortfolioForm
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        benchmark={benchmark}
        onBenchmarkChange={setBenchmark}
        holdings={holdings}
        searchResults={searchResults}
        activeHoldingIndex={activeHoldingIndex}
        onTickerFieldChange={handleTickerFieldChange}
        onWeightChange={updateWeight}
        onSearchResultSelect={handleSearchResultSelect}
        onAddHolding={addHolding}
        onRemoveHolding={removeHolding}
        onAnalyze={analyzePortfolio}
        loading={loading}
      />

      {error && <p>{error}</p>}

      {result && (
        <div>
          <h2>Portfolio Analysis</h2>
          <PortfolioMetrics result={result} />
          <h3>Asset Contributions</h3>
          <AssetContributionChart contributions={result.asset_contributions} />
          <h3>Portfolio Performance</h3>
          <PerformanceChart data={result.performance_history} benchmark={benchmark} />
        </div>
      )}
    </div>
  )
}

export default App
