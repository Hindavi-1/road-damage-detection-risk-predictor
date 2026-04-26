/**
 * RiskCard — displays the ML risk prediction with animated score gauge.
 */

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import type { RiskPrediction } from "../../types";

interface RiskCardProps {
  prediction: RiskPrediction;
}

/** Maps risk score (0–1) to a colour gradient */
function scoreToColor(score: number) {
  if (score >= 0.85) return "#EF4444";
  if (score >= 0.65) return "#F97316";
  if (score >= 0.40) return "#EAB308";
  return "#22C55E";
}

/** Animated circular gauge */
function RiskGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score);
  const color = scoreToColor(score);

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        {/* Progress */}
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold"
          style={{ color }}
        >
          {(score * 100).toFixed(0)}
        </motion.span>
        <span className="text-xs text-slate-500 font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function RiskCard({ prediction }: RiskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 border border-white/[0.07] space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert size={20} className="text-red-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Risk Assessment</p>
          <p className="text-sm font-bold text-slate-200 mt-0.5">ML Priority Classification</p>
        </div>
      </div>

      {/* Gauge + badge */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <RiskGauge score={prediction.risk_score} />
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Priority Level</p>
            <PriorityBadge priority={prediction.priority} size="lg" pulse />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Risk Score</p>
            <p className="text-2xl font-bold text-white">
              {prediction.risk_score.toFixed(2)}
              <span className="text-sm text-slate-500 font-normal ml-1">/ 1.00</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
