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
  "Very High": { bg: "bg-red-500/15",    border: "border-red-500/40",    text: "text-red-400",    dot: "bg-red-400" },
  "High":      { bg: "bg-orange-500/15", border: "border-orange-500/40", text: "text-orange-400", dot: "bg-orange-400" },
  "Medium":    { bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400", dot: "bg-yellow-400" },
  "Low":       { bg: "bg-green-500/15",  border: "border-green-500/40",  text: "text-green-400",  dot: "bg-green-400"  },
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
