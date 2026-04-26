/**
 * ResultView — side-by-side original vs processed image with detection overlays.
 * Presentational only; receives all data via props.
 */

import { motion } from "framer-motion";
import { Eye, Zap } from "lucide-react";
import type { Detection } from "../../types";

interface ResultViewProps {
  originalUrl: string;
  processedUrl: string;
  detections: Detection[];
}

const CONFIDENCE_COLOR = (conf: number) => {
  if (conf >= 0.85) return "text-red-400 border-red-500/40 bg-red-500/10";
  if (conf >= 0.70) return "text-orange-400 border-orange-500/40 bg-orange-500/10";
  return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
};

const TYPE_LABEL: Record<string, string> = {
  pothole: "Pothole",
  crack:   "Crack",
  rutting: "Rutting",
  erosion: "Erosion",
  patch:   "Patch",
  other:   "Other",
};

export default function ResultView({ originalUrl, processedUrl, detections }: ResultViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Image comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
            <Eye size={13} />
            <span>Original Image</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
            <img
              src={originalUrl}
              alt="Original road"
              className="w-full h-56 object-cover"
            />
          </div>
        </div>

        {/* Processed / annotated */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium uppercase tracking-wider">
            <Zap size={13} />
            <span>Processed — Detections Overlay</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 glow-cyan">
            <img
              src={processedUrl}
              alt="Processed road with detections"
              className="w-full h-56 object-cover"
            />
            {/* Simulated bounding boxes */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <rect x="10" y="35" width="25" height="20" rx="1"
                stroke="#EF4444" strokeWidth="0.8" fill="rgba(239,68,68,0.08)" />
              <text x="10.5" y="33.5" fontSize="4.5" fill="#EF4444" fontWeight="bold">Pothole 0.92</text>

              <rect x="50" y="20" width="30" height="15" rx="1"
                stroke="#F97316" strokeWidth="0.8" fill="rgba(249,115,22,0.08)" />
              <text x="50.5" y="18.5" fontSize="4.5" fill="#F97316" fontWeight="bold">Crack 0.79</text>

              <rect x="55" y="60" width="20" height="18" rx="1"
                stroke="#EF4444" strokeWidth="0.8" fill="rgba(239,68,68,0.08)" />
              <text x="55.5" y="58.5" fontSize="4.5" fill="#EF4444" fontWeight="bold">Pothole 0.88</text>
            </svg>

            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
              AI Annotated
            </div>
          </div>
        </div>
      </div>

      {/* Detection list */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
          Detections ({detections.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {detections.map((det, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${CONFIDENCE_COLOR(det.confidence)}`}
            >
              <span>{TYPE_LABEL[det.type] ?? det.type}</span>
              <span className="opacity-70">{(det.confidence * 100).toFixed(0)}%</span>
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
