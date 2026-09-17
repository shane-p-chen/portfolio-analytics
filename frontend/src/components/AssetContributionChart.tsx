import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AssetContributionChartProps = {
  contributions: Record<string, number>;
};

function AssetContributionChart({ contributions }: AssetContributionChartProps) {
  const contributionData = Object.entries(contributions).map(([ticker, contribution]) => ({
    ticker,
    contribution,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={contributionData}>
          <XAxis dataKey="ticker" />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            formatter={(value) =>
              `${(Number(value) * 100).toFixed(2)}%`
            }
          />
          <Bar
            dataKey="contribution"
            name="Contribution"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AssetContributionChart;
