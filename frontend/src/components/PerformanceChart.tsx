import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PerformancePoint } from "../types";

const benchmarkNames: Record<string, string> = { "^GSPC": "S&P 500", "^NDX": "NASDAQ-100", "^DJI": "Dow Jones" };
type PerformanceChartProps = { data: PerformancePoint[]; benchmark: string };
function PerformanceChart({ data, benchmark }: PerformanceChartProps) {
  return (
    <section className="panel chart-panel" aria-labelledby="performance-title">
      <div className="chart-heading">
        <h3 id="performance-title">Portfolio performance</h3>
        <p>Cumulative return over the analysis period.</p>
        <div className="chart-legend"><span><i className="legend-line" />Portfolio</span><span><i className="legend-line benchmark" />{benchmarkNames[benchmark] ?? benchmark}</span></div>
      </div>
      {data.length === 0 ? <p className="form-note">No performance data is available for this period.</p> :
      <div className="performance-chart">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={48} tickLine={false} axisLine={false} tickMargin={12}
              tickFormatter={(value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })} />
            <YAxis width={48} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
              labelStyle={{ color: "var(--muted)", marginBottom: 6 }}
              formatter={(value, name) => [`${(Number(value) * 100).toFixed(2)}%`, name]} />
            <Line type="monotone" dataKey="return" name="Portfolio" stroke="var(--accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="benchmark_return" name={benchmarkNames[benchmark] ?? benchmark} stroke="var(--benchmark)" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>}
    </section>
  );
}
export default PerformanceChart;
