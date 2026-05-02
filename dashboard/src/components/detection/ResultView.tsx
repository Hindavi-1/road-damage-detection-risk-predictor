/**
 * ResultView — side-by-side original vs processed image with detection overlays.
 * Presentational only; receives all data via props.
 */

import { motion } from "framer-motion";
import { Eye, Zap, Layers } from "lucide-react";
import type { Detection } from "../../types";

interface ResultViewProps {
  originalUrl: string;
  processedUrl: string;
  detections: Detection[];
}

const CONFIDENCE_COLOR = (conf: number) => {
  if (conf >= 0.85) return "text-red-400 border-red-500/30 bg-red-500/10";
  if (conf >= 0.70) return "text-orange-400 border-orange-500/30 bg-orange-500/10";
  return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Image comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Original */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
              <Eye size={12} className="text-slate-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Original Input</span>
          </div>
          <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] transition-all hover:border-white/10">
            <img
              src={originalUrl}
              alt="Original road"
              className="w-full h-64 object-cover grayscale-[0.2] transition-all group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Processed / annotated */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap size={12} className="text-blue-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Processed Output</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] group">
            <img
              src={processedUrl}
              alt="Processed road with detections"
              className="w-full h-64 object-cover"
            />
            {/* Simulated bounding boxes */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Box 1 */}
              <rect x="15" y="40" width="22" height="18" rx="1"
                stroke="#EF4444" strokeWidth="0.7" fill="rgba(239,68,68,0.1)" strokeDasharray="2 1" />
              <rect x="15" y="34" width="22" height="6" rx="1" fill="#EF4444" />
              <text x="17" y="38.5" fontSize="3.5" fill="white" fontWeight="bold" fontFamily="monospace">Pothole 0.92</text>

              {/* Box 2 */}
              <rect x="55" y="25" width="28" height="12" rx="1"
                stroke="#F97316" strokeWidth="0.7" fill="rgba(249,115,22,0.1)" strokeDasharray="2 1" />
              <rect x="55" y="19" width="28" height="6" rx="1" fill="#F97316" />
              <text x="57" y="23.5" fontSize="3.5" fill="white" fontWeight="bold" fontFamily="monospace">Crack 0.79</text>

              {/* Box 3 */}
              <rect x="60" y="65" width="20" height="18" rx="1"
                stroke="#EF4444" strokeWidth="0.7" fill="rgba(239,68,68,0.1)" strokeDasharray="2 1" />
              <rect x="60" y="59" width="20" height="6" rx="1" fill="#EF4444" />
              <text x="62" y="63.5" fontSize="3.5" fill="white" fontWeight="bold" fontFamily="monospace">Pothole 0.88</text>
            </svg>

            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-blue-400 uppercase tracking-widest shadow-xl">
              AI INF-SERVER V1
            </div>
          </div>
        </div>
      </div>

      {/* Detection list */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={13} className="text-slate-600" />
          <p className="label">Classified Detections ({detections.length})</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {detections.map((det, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[11px] font-bold tracking-tight transition-all hover:scale-105 cursor-default shadow-sm ${CONFIDENCE_COLOR(det.confidence)}`}
            >
              <span>{TYPE_LABEL[det.type] ?? det.type}</span>
              <div className="w-1 h-1 rounded-full opacity-30 bg-current" />
              <span className="opacity-80 font-mono">{(det.confidence * 100).toFixed(0)}%</span>
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
