import type { PortfolioResult } from "../types";
type PortfolioMetricsProps = { result: PortfolioResult };
function PortfolioMetrics({ result }: PortfolioMetricsProps) {
  const metrics = [
    { label: "Total return", value: `${result.total_return > 0 ? "+" : ""}${(result.total_return * 100).toFixed(2)}%`, tone: result.total_return > 0 ? "positive" : result.total_return < 0 ? "negative" : "" },
    { label: "Annual volatility", value: `${(result.annual_volatility * 100).toFixed(2)}%` },
    { label: "Sharpe ratio", value: result.sharpe_ratio.toFixed(2) },
    { label: "Max drawdown", value: `${(result.max_drawdown * 100).toFixed(2)}%` },
  ];
  return <dl className="metrics-grid">{metrics.map((metric) => (
    <div className="panel metric" key={metric.label}><dt>{metric.label}</dt><dd className={metric.tone}>{metric.value}</dd></div>
  ))}</dl>;
}
export default PortfolioMetrics;
