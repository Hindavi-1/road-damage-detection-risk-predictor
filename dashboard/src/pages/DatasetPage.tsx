/**
 * DatasetPage — visualises class distribution, sample images, and augmentation.
 */

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Database, GitBranch, Image as ImageIcon, Layers } from "lucide-react";
import type { ClassDistribution } from "../types";

// ── Static dataset data ────────────────────────────────────────────────────

const classData: ClassDistribution[] = [
  { label: "Crack",    count: 1_847, color: "#F97316" },
  { label: "Pothole",  count: 1_234, color: "#EF4444" },
  { label: "Rutting",  count:   789, color: "#EAB308" },
  { label: "Erosion",  count:   412, color: "#22D3EE" },
  { label: "Patch",    count:   298, color: "#3B82F6" },
];

const splitData = [
  { split: "Train (70%)", count: 3_346, color: "#3B82F6" },
  { split: "Val (15%)",   count:   718, color: "#22D3EE" },
  { split: "Test (15%)",  count:   718, color: "#A855F7" },
];

const augmentations = [
  { name: "Horizontal Flip",  purpose: "Mirror orientation invariance",    applied: true  },
  { name: "Vertical Flip",    purpose: "Downward camera angle variation",  applied: true  },
  { name: "Rotation (±15°)",  purpose: "Camera tilt tolerance",            applied: true  },
  { name: "Brightness Jitter", purpose: "Lighting condition robustness",   applied: true  },
  { name: "Gaussian Blur",    purpose: "Motion blur simulation",           applied: true  },
  { name: "Random Crop",      purpose: "Scale & position variation",       applied: true  },
  { name: "Colour Jitter",    purpose: "Atmospheric condition variance",   applied: false },
  { name: "Mosaic",           purpose: "Multi-image context blending",     applied: false },
];

// Sample image grid (mock coloured placeholders)
const SAMPLE_COLOURS = [
  { label: "Pothole",  bg: "from-red-900/60 to-red-950/80",    text: "text-red-400"    },
  { label: "Crack",    bg: "from-orange-900/60 to-orange-950/80", text: "text-orange-400" },
  { label: "Rutting",  bg: "from-yellow-900/60 to-yellow-950/80", text: "text-yellow-400" },
  { label: "Erosion",  bg: "from-cyan-900/60 to-cyan-950/80",  text: "text-cyan-400"   },
  { label: "Pothole",  bg: "from-red-900/60 to-red-950/80",    text: "text-red-400"    },
  { label: "Crack",    bg: "from-orange-900/60 to-orange-950/80", text: "text-orange-400" },
  { label: "Patch",    bg: "from-blue-900/60 to-blue-950/80",  text: "text-blue-400"   },
  { label: "Rutting",  bg: "from-yellow-900/60 to-yellow-950/80", text: "text-yellow-400" },
];

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
      <p className="text-white font-bold mt-0.5">{payload[0].value.toLocaleString()} images</p>
    </div>
  );
};

export default function DatasetPage() {
  const total = classData.reduce((s, c) => s + c.count, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/[0.07]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Database size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dataset Overview</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {total.toLocaleString()} annotated road images across 5 damage classes
            </p>
          </div>
          <div className="ml-auto flex gap-6 text-center hidden sm:flex">
            {[
              { v: total.toLocaleString(), l: "Total Images" },
              { v: "5",                    l: "Classes"      },
              { v: "YOLOv8",               l: "Format"       },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-xl font-extrabold gradient-text">{s.v}</p>
                <p className="text-xs text-slate-600">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Class imbalance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/[0.07]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Layers size={15} className="text-orange-400" />
            <p className="text-sm font-semibold text-slate-300">Class Imbalance</p>
          </div>
          <p className="text-xs text-slate-600 mb-5">Image count per damage category</p>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={classData} barSize={36} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="label" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {classData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {classData.map((c) => (
              <div key={c.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
                {c.label}: <span className="text-slate-300 font-semibold">{c.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dataset split */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 border border-white/[0.07]"
        >
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={15} className="text-blue-400" />
            <p className="text-sm font-semibold text-slate-300">Dataset Split</p>
          </div>
          <p className="text-xs text-slate-600 mb-5">Train / Validation / Test breakdown</p>

          <div className="space-y-5 mt-4">
            {splitData.map((s) => {
              const pct = (s.count / total) * 100;
              return (
                <div key={s.split} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">{s.split}</span>
                    <span className="text-slate-200 font-bold">{s.count.toLocaleString()} images</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                  <p className="text-xs text-slate-600">{pct.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="mt-6 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-xs text-yellow-400/80 leading-relaxed">
            ⚠️ Class imbalance detected. Crack class has ~6× more samples than Patch.
            Weighted loss and oversampling applied during training.
          </div>
        </motion.div>
      </div>

      {/* Sample image grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-white/[0.07]"
      >
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon size={15} className="text-cyan-400" />
          <p className="text-sm font-semibold text-slate-300">Sample Images</p>
        </div>
        <p className="text-xs text-slate-600 mb-5">Representative training set samples per class</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_COLOURS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className={`relative h-36 rounded-xl bg-gradient-to-br ${s.bg} border border-white/[0.05] flex items-end p-3 overflow-hidden group hover:scale-[1.03] transition-transform cursor-default`}
            >
              {/* Simulated road texture pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px)",
                }} />
              </div>
              <span className={`relative text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 ${s.text}`}>
                {s.label}
              </span>
              <span className="absolute top-2 right-2 text-[10px] text-white/30 font-mono">
                #{String(i + 1).padStart(3, "0")}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Augmentation comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-2xl p-6 border border-white/[0.07]"
      >
        <p className="text-sm font-semibold text-slate-300 mb-1">Data Augmentation Pipeline</p>
        <p className="text-xs text-slate-600 mb-5">
          Transformations applied to expand effective dataset size and improve model generalisation
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {augmentations.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className={`rounded-xl p-4 border transition-all
                ${a.applied
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/35"
                  : "bg-white/[0.02] border-white/[0.05] opacity-50"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${a.applied ? "opacity-100" : "opacity-40"}`}>
                  {a.applied ? "✅" : "⬜"}
                </span>
                <p className={`text-xs font-semibold ${a.applied ? "text-emerald-300" : "text-slate-600"}`}>
                  {a.name}
                </p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{a.purpose}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
