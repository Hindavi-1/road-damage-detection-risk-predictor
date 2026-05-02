/**
 * Loader — reusable loading spinner with optional label.
 * Used across all async operations.
 */

import { motion } from "framer-motion";

interface LoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-10 h-10 border-[3px]",
  lg: "w-14 h-14 border-4",
};

export default function Loader({ label, size = "md", fullScreen = false }: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-white/5`}
          style={{ borderStyle: "solid" }}
        />
        {/* Spinning arc */}
        <div
          className={`absolute inset-0 ${sizeMap[size]} rounded-full border-transparent border-t-blue-500 border-r-cyan-400 animate-spin`}
          style={{ borderStyle: "solid" }}
        />
      </div>
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold uppercase tracking-[0.2em] opacity-40"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#070c14]/90 backdrop-blur-md flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
