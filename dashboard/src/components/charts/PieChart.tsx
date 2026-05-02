/**
 * DamagePieChart — recharts-based pie chart for damage type distribution.
 * Wrapped in a glass card; purely presentational.
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DamageDistribution } from "../../types";

interface DamagePieChartProps {
  data: DamageDistribution[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: DamageDistribution }[] }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl px-4 py-3 text-sm shadow-2xl" style={{ background: "#0b1120", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="font-semibold text-white">{entry.name}</p>
      <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>Count: <span className="text-white font-bold font-mono">{entry.value}</span></p>
    </div>
  );
};

export default function DamagePieChart({ data }: DamagePieChartProps) {
  return (
    <div className="card rounded-2xl p-6 h-full">
      <p className="text-sm font-semibold text-slate-200 mb-1">Damage Distribution</p>
      <p className="label mb-5">Breakdown by damage type</p>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
