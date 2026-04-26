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
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-[3px]",
  lg: "w-16 h-16 border-4",
};

export default function Loader({ label, size = "md", fullScreen = false }: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeMap[size]} rounded-full border-transparent border-t-blue-500 border-r-cyan-400 animate-spin`}
        style={{ borderStyle: "solid" }}
      />
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-slate-400 tracking-wide"
        >
          {label}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0B0F1A]/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
