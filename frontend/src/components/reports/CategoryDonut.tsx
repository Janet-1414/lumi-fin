"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#FAC775", "#1D9E75", "#D85A30", "#60A5FA", "#A78BFA", "#F472B6"];

export default function CategoryDonut({ data, currency }: { data: any[]; currency: string }) {
  if (!data?.length) return <p className="text-center text-[var(--text-muted)] py-8 text-sm">No data available</p>;
  const chart = data.slice(0, 6).map((d) => ({ name: d.category, value: d.amount, pct: d.percentage }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chart} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
          {chart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
