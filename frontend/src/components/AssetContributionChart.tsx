import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
type AssetContributionChartProps = { contributions: Record<string, number> };
function AssetContributionChart({ contributions }: AssetContributionChartProps) {
  const data = Object.entries(contributions).map(([ticker, contribution]) => ({ ticker, contribution }));
  return (
    <section className="panel chart-panel" aria-labelledby="contributions-title">
      <div className="chart-heading"><h3 id="contributions-title">Asset contributions</h3><p>Each holding’s contribution to total portfolio return, in percentage points.</p></div>
      {data.length === 0 ? <p className="form-note">No contribution data is available.</p> :
      <div style={{ width: "100%", height: Math.max(180, data.length * 42 + 40) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 8, left: 0 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(value: number) => `${(value * 100).toFixed(0)}`} />
            <YAxis type="category" dataKey="ticker" width={65} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "var(--surface-subtle)" }} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
              itemStyle={{ color: "var(--text)" }} formatter={(value) => [`${(Number(value) * 100).toFixed(2)} pp`, "Contribution"]} />
            <ReferenceLine x={0} stroke="var(--muted)" />
            <Bar dataKey="contribution" name="Contribution" maxBarSize={20} radius={3} isAnimationActive={false}>
              {data.map((entry) => <Cell key={entry.ticker} fill={entry.contribution < 0 ? "var(--negative)" : "var(--positive)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </section>
  );
}
export default AssetContributionChart;
