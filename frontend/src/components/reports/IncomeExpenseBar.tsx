"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface IncomeExpenseBarProps {
  data: Array<{ month: string; income: number; expenses: number }>;
  currency: string;
}

export default function IncomeExpenseBar({ data, currency }: IncomeExpenseBarProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip
          formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
          contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="income" name="Income" fill="#1D9E75" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#D85A30" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
