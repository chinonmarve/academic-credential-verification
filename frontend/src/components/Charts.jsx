import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#2DD4BF", "#F87171", "#FBBF24", "#38BDF8"];

const tooltipStyle = {
  background: "#0D1730",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#E2E8F0"
};

export function MonthlyBarChart({ data, dataKey = "count", xKey = "month", label = "Credentials" }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 py-8 text-center">No data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={dataKey} name={label} fill="#2DD4BF" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OutcomeDonut({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total) return <p className="text-sm text-slate-500 py-8 text-center">No verification activity yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
