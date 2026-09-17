import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerformancePoint } from "../types";

const benchmarkNames: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^NDX": "NASDAQ-100",
  "^DJI": "Dow Jones",
};

type PerformanceChartProps = {
  data: PerformancePoint[];
  benchmark: string;
};

function PerformanceChart({ data, benchmark }: PerformanceChartProps) {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            formatter={(value, name) => [
              `${(Number(value) * 100).toFixed(2)}%`,
              name
            ]}
          />
          <Line
            type="monotone"
            dataKey="return"
            name="Portfolio"
            stroke='#2563eb'
          />
          <Line
            type="monotone"
            dataKey="benchmark_return"
            name={benchmarkNames[benchmark]}
            stroke='#f97316'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceChart;
