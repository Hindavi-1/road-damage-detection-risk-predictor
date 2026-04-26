/**
 * MethodologyPage — visual system pipeline with cards + arrows.
 * Shows the full ML pipeline from data collection to deployment.
 */

import { motion } from "framer-motion";
import {
  Database,
  Sliders,
  BrainCircuit,
  GitMerge,
  BarChart2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

// ── Pipeline stage definitions ────────────────────────────────────────────

const stages = [
  {
    step: "01",
    icon: <Database size={22} />,
    title: "Data Collection",
    color: "blue",
    details: [
      "RDD2022 public benchmark dataset",
      "Custom field captures across 3 regions",
      "4,782 annotated road images",
      "5 damage categories labelled",
    ],
    tech: ["LabelImg", "Roboflow", "CVAT"],
  },
  {
    step: "02",
    icon: <Sliders size={22} />,
    title: "Preprocessing",
    color: "cyan",
    details: [
      "Image resizing to 640×640 px",
      "Normalisation (mean subtraction)",
      "Data augmentation (flip, rotate, jitter)",
      "Train / Val / Test split (70/15/15)",
    ],
    tech: ["OpenCV", "Albumentations", "NumPy"],
  },
  {
    step: "03",
    icon: <BrainCircuit size={22} />,
    title: "Model Training",
    color: "purple",
    details: [
      "YOLOv8 architecture",
      "Weighted cross-entropy for class imbalance",
      "100 epochs, batch size 16",
      "Adam optimiser, LR warm-up",
    ],
    tech: ["PyTorch", "Ultralytics", "CUDA"],
  },
  {
    step: "04",
    icon: <GitMerge size={22} />,
    title: "Transfer Learning",
    color: "orange",
    details: [
      "Pre-trained COCO weights initialised",
      "Backbone frozen for first 20 epochs",
      "Fine-tuned on domain-specific data",
      "Differential learning rates applied",
    ],
    tech: ["ImageNet", "COCO", "YOLOv8-L"],
  },
  {
    step: "05",
    icon: <BarChart2 size={22} />,
    title: "Evaluation & Deployment",
    color: "emerald",
    details: [
      "mAP@0.5: 0.891 on test split",
      "Precision: 0.87 / Recall: 0.84",
      "Feature extraction → ML classifier",
      "Flask REST API for inference",
    ],
    tech: ["Flask", "ONNX", "Docker"],
  },
];

const COLOR_MAP: Record<string, { card: string; border: string; icon: string; badge: string }> = {
  blue:    { card: "from-blue-500/10 to-transparent",    border: "border-blue-500/25",    icon: "text-blue-400",    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20"    },
  cyan:    { card: "from-cyan-500/10 to-transparent",    border: "border-cyan-500/25",    icon: "text-cyan-400",    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"    },
  purple:  { card: "from-purple-500/10 to-transparent",  border: "border-purple-500/25",  icon: "text-purple-400",  badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  orange:  { card: "from-orange-500/10 to-transparent",  border: "border-orange-500/25",  icon: "text-orange-400",  badge: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  emerald: { card: "from-emerald-500/10 to-transparent", border: "border-emerald-500/25", icon: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
};

// ── Two-stage system diagram ───────────────────────────────────────────────

const systemStages = [
  {
    label: "Stage 1: Detection",
    sub: "Deep Learning",
    items: ["Image Input", "YOLOv8 Inference", "Bounding Box Output", "Class + Confidence"],
    color: "blue",
  },
  {
    label: "Stage 2: Risk Prediction",
    sub: "Machine Learning",
    items: ["Feature Extraction", "Pothole / Crack Count", "Damage Area %", "Priority Classification"],
    color: "red",
  },
];

export default function MethodologyPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h2 className="text-2xl font-extrabold text-white">System Methodology</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          A two-stage AI pipeline combining deep learning object detection with
          machine learning priority classification for intelligent road maintenance.
        </p>
      </motion.div>

      {/* ── Two-stage system overview ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {systemStages.map((s, i) => {
          const c = COLOR_MAP[s.color];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`glass rounded-2xl p-6 border ${c.border} bg-gradient-to-br ${c.card}`}
            >
              <div className="mb-4">
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${c.badge}`}>
                  {s.sub}
                </span>
                <h3 className={`text-base font-bold mt-3 ${c.icon}`}>{s.label}</h3>
              </div>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={14} className={c.icon} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Arrow connector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-white/10 text-xs text-slate-400 font-semibold">
          Detection Output
          <ChevronRight size={14} className="text-blue-400" />
          Feature Vector
          <ChevronRight size={14} className="text-blue-400" />
          Risk Score
          <ChevronRight size={14} className="text-blue-400" />
          Priority Decision
        </div>
      </div>

      {/* ── ML Pipeline steps ───────────────────────────────────────────── */}
      <div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs uppercase tracking-widest text-slate-600 font-semibold mb-8"
        >
          Training Pipeline — Step by Step
        </motion.h3>

        <div className="space-y-4">
          {stages.map((stage, i) => {
            const c = COLOR_MAP[stage.color];
            return (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`glass rounded-2xl p-6 border ${c.border} bg-gradient-to-r ${c.card} hover:scale-[1.01] transition-all duration-300`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center ${c.icon}`}>
                      {stage.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-700 font-mono font-bold">Step {stage.step}</p>
                      <h4 className={`text-base font-bold ${c.icon}`}>{stage.title}</h4>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px bg-white/[0.05] self-stretch" />

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ul className="space-y-1.5">
                      {stage.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.icon.replace("text-", "bg-")}`} />
                          {d}
                        </li>
                      ))}
                    </ul>

                    {/* Tech badges */}
                    <div className="flex flex-wrap gap-2 content-start">
                      {stage.tech.map((t) => (
                        <span
                          key={t}
                          className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold ${c.badge}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connector arrow */}
                {i < stages.length - 1 && (
                  <div className="mt-4 flex justify-center">
                    <ChevronRight size={16} className="text-slate-700 rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Performance metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6 border border-white/[0.07]"
      >
        <p className="text-sm font-semibold text-slate-300 mb-5">Model Performance Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { metric: "mAP@0.5",   value: "89.1%", color: "text-blue-400"   },
            { metric: "Precision", value: "87.3%", color: "text-cyan-400"   },
            { metric: "Recall",    value: "84.7%", color: "text-purple-400" },
            { metric: "F1 Score",  value: "85.9%", color: "text-emerald-400"},
          ].map((m) => (
            <div key={m.metric} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-slate-600 mt-1">{m.metric}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
