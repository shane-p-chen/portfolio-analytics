import type { PortfolioResult } from "../types";

type PortfolioMetricsProps = {
  result: PortfolioResult;
};

function PortfolioMetrics({ result }: PortfolioMetricsProps) {
  return (
    <>
      <p>Total Return: {(result.total_return * 100).toFixed(2)}%</p>
      <p>Annual Volatility: {(result.annual_volatility * 100).toFixed(2)}%</p>
      <p>Sharpe Ratio: {result.sharpe_ratio.toFixed(2)}</p>
      <p>Max Drawdown: {(result.max_drawdown * 100).toFixed(2)}%</p>
    </>
  );
}

export default PortfolioMetrics;
