"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#FAC775", "#1D9E75", "#D85A30", "#60A5FA", "#A78BFA", "#F472B6", "#34D399"];

interface SpendingDonutProps {
  data: Array<{ category: string; amount: number; percentage: number }>;
  currency: string;
}

export default function SpendingDonut({ data, currency }: SpendingDonutProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--text-muted)] text-sm">
        No expense data yet
      </div>
    );
  }

  const chartData = data.slice(0, 7).map((d) => ({
    name: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    value: d.amount,
    percentage: d.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, ""]}
          contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
