/**
 * FrequencyBarChart — recharts bar chart for detection frequency over time.
 * Presentational; receives data via props.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FrequencyDataPoint } from "../../types";

interface FrequencyBarChartProps {
  data: FrequencyDataPoint[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 border border-white/10 text-sm shadow-xl">
      <p className="text-slate-400 font-medium">{label}</p>
      <p className="text-white font-bold mt-0.5">{payload[0].value} detections</p>
    </div>
  );
};

export default function FrequencyBarChart({ data }: FrequencyBarChartProps) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/[0.07] h-full">
      <p className="text-sm font-semibold text-slate-300 mb-1">Detection Frequency</p>
      <p className="text-xs text-slate-600 mb-5">Monthly detections over the past year</p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={22}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
          <Bar
            dataKey="count"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
