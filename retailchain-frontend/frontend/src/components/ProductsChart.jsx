// src/components/ProductsChart.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6EE7B7", "#7DD3FC", "#FCA5A5", "#FDE68A", "#C7B3FF", "#FFD6A5", "#9EE6C1"];

export default function ProductsChart({ data }) {
  // data: [{ name: 'Dairy', value: 4 }, ...]
  if (!data || data.length === 0) {
    return <div style={{ color: "var(--muted)" }}>No category data</div>;
  }

  return (
    <div style={{ width: "100%", height: 120 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={28} outerRadius={50} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [v, "Count"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
