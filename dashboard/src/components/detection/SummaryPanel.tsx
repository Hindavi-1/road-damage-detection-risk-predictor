/**
 * SummaryPanel — compact stat cards for detection counts.
 * Part of the Feature Extraction stage display.
 */

import { motion } from "framer-motion";
import type { ExtractedFeatures } from "../../types";

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;       // Tailwind colour classes for the accent
  delay?: number;
}

function StatCard({ label, value, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-4 flex flex-col gap-2 border border-white/[0.07] hover:border-white/10 transition-all hover:scale-[1.02]"
    >
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}

interface SummaryPanelProps {
  features: ExtractedFeatures;
}

export default function SummaryPanel({ features }: SummaryPanelProps) {
  const stats: StatCardProps[] = [
    { label: "Potholes",     value: features.pothole_count,                 color: "text-red-400",    delay: 0.0 },
    { label: "Cracks",       value: features.crack_count,                   color: "text-orange-400", delay: 0.08 },
    { label: "Damage Area",  value: `${(features.damage_area * 100).toFixed(0)}%`, color: "text-cyan-400", delay: 0.16 },
    { label: "Rutting",      value: features.rutting_count ?? 0,            color: "text-yellow-400", delay: 0.24 },
    { label: "Erosion",      value: features.erosion_count ?? 0,            color: "text-purple-400", delay: 0.32 },
    {
      label: "Total Defects",
      value: features.pothole_count + features.crack_count + (features.rutting_count ?? 0) + (features.erosion_count ?? 0),
      color: "text-blue-400",
      delay: 0.40,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
