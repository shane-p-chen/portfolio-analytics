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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [benchmark, setBenchmark] = useState("^GSPC");
  // Keep result labels tied to submitted inputs while the form remains editable.
  const [analysisContext, setAnalysisContext] = useState<{ benchmark: string; startDate: string; endDate: string } | null>(null);

  const {
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
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
        setError("Enter a weight for every holding before analyzing.");
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

    setLoading(true);
    setError("");
    setResult(null);
    try{
      const data = await analyzePortfolioApi(portfolioData);
      setResult(data);
      setAnalysisContext({ benchmark: portfolioData.benchmark, startDate: portfolioData.start_date, endDate: portfolioData.end_date });
    } catch (error){
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Portfolio insights</p>
        <h1>Portfolio Analytics</h1>
        <p>Understand your returns, measure risk, and see what drives performance.</p>
      </header>
      <div className="dashboard">
        <PortfolioForm
          startDate={startDate} endDate={endDate}
          onStartDateChange={setStartDate} onEndDateChange={setEndDate}
          benchmark={benchmark} onBenchmarkChange={setBenchmark}
          holdings={holdings} searchResults={searchResults}
          searchLoading={searchLoading} searchError={searchError}
          activeHoldingIndex={activeHoldingIndex}
          onTickerFieldChange={handleTickerFieldChange}
          onWeightChange={updateWeight}
          onSearchResultSelect={handleSearchResultSelect}
          onAddHolding={addHolding} onRemoveHolding={removeHolding}
          onAnalyze={analyzePortfolio} loading={loading} error={error}
        />
        <div className="results">
          {loading ? (
            <section className="panel state-panel" role="status">
              <div className="state-mark" aria-hidden="true">···</div>
              <h2>Analyzing your portfolio</h2>
              <p>Fetching market data and calculating returns and risk. This may take a moment.</p>
            </section>
          ) : result && analysisContext ? (
            <>
              <div className="results-heading">
                <p className="eyebrow">Analysis results</p>
                <h2>Your portfolio at a glance</h2>
                <p>{analysisContext.startDate} – {analysisContext.endDate} · Results from your last analysis</p>
              </div>
              <PortfolioMetrics result={result} />
              <PerformanceChart data={result.performance_history} benchmark={analysisContext.benchmark} />
              <AssetContributionChart contributions={result.asset_contributions} />
            </>
          ) : (
            <section className="panel state-panel">
              <div className="state-mark" aria-hidden="true">↗</div>
              <h2>{error ? "Your analysis is not ready" : "See the bigger picture"}</h2>
              <p>{error ? "Review the message in the portfolio form, then analyze again." : "Set your holdings, choose a benchmark, and analyze your portfolio to explore performance and risk."}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;