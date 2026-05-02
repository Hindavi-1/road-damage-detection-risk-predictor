/**
 * PriorityBadge — colour-coded pill indicating priority level.
 * Supports multiple size variants.
 */

import { motion } from "framer-motion";
import type { PriorityLevel } from "../../types";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const CONFIG: Record<PriorityLevel, { bg: string; border: string; text: string; dot: string }> = {
  "Very High": { bg: "bg-rose-500/10",   border: "border-rose-500/30",   text: "text-rose-400",   dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" },
  "High":      { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]" },
  "Medium":    { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  dot: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" },
  "Low":       { bg: "bg-emerald-500/10",border: "border-emerald-500/30",text: "text-emerald-400",dot: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" },
};

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2.5 py-0.5 text-xs gap-1.5",
  md: "px-3 py-1 text-sm gap-2",
  lg: "px-5 py-2 text-base gap-2.5",
};

export default function PriorityBadge({ priority, size = "md", pulse = false }: PriorityBadgeProps) {
  const cfg = CONFIG[priority];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full border font-semibold ${cfg.bg} ${cfg.border} ${cfg.text} ${SIZE[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot} ${pulse ? "animate-pulse" : ""}`} />
      {priority}
    </motion.span>
  );
}
