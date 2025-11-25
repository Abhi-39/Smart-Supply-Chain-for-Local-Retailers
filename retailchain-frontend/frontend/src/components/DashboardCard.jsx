// src/components/DashboardCard.jsx
export default function DashboardCard({ title, value, sub, children }) {
  return (
    <div className="kpi-card" role="region" aria-label={title}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {children}
    </div>
  );
}
