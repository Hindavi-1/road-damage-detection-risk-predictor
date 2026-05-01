/**
 * FeatureSummary — horizontal bar-style feature visualisation.
 * Bridges the Detection and Prediction pipeline stages.
 */

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { ExtractedFeatures } from "../../types";

interface FeatureRowProps {
  label: string;
  value: number;    // raw value
  max: number;      // normalisation max for bar width
  unit?: string;
  color: string;    // tailwind bg class
  delay?: number;
}

function FeatureRow({ label, value, max, unit = "", color, delay = 0 }: FeatureRowProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-slate-200 font-semibold">{value}{unit}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

interface FeatureSummaryProps {
  features: ExtractedFeatures;
}

export default function FeatureSummary({ features }: FeatureSummaryProps) {
  const rows: FeatureRowProps[] = [
    { label: "Pothole Count",   value: features.pothole_count,                    max: 10,  unit: "",   color: "bg-red-500",    delay: 0.1  },
    { label: "Crack Count",     value: features.crack_count,                      max: 15,  unit: "",   color: "bg-orange-500", delay: 0.2  },
    { label: "Damaged Area",    value: parseFloat((features.damage_area * 100).toFixed(1)), max: 100, unit: "%", color: "bg-cyan-500", delay: 0.3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 border border-white/[0.07] space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Layers size={16} className="text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Stage 2</p>
          <p className="text-sm font-bold text-slate-200">Extracted Features</p>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <FeatureRow key={r.label} {...r} />
        ))}
      </div>
    </motion.div>
  );
}
