/**
 * LandingPage — hero + features showcase.
 * Entry point of the application; routes to Detect and Dashboard.
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanSearch,
  BarChart3,
  ShieldCheck,
  Cpu,
  Zap,
  GitBranch,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

// ── Feature card data ──────────────────────────────────────────────────────

const features = [
  {
    icon: <ScanSearch size={22} className="text-blue-400" />,
    title: "Deep Learning Detection",
    desc: "State-of-the-art YOLOv8 model identifies potholes, cracks, rutting and erosion with high accuracy.",
    color: "from-blue-500/10 to-transparent",
    border: "border-blue-500/20",
  },
  {
    icon: <GitBranch size={22} className="text-cyan-400" />,
    title: "Feature Extraction",
    desc: "Automated extraction of structural features — defect counts, damaged area ratio, and severity indices.",
    color: "from-cyan-500/10 to-transparent",
    border: "border-cyan-500/20",
  },
  {
    icon: <Cpu size={22} className="text-purple-400" />,
    title: "ML Risk Prediction",
    desc: "Machine learning classifier assigns priority levels (Very High → Low) for informed maintenance decisions.",
    color: "from-purple-500/10 to-transparent",
    border: "border-purple-500/20",
  },
  {
    icon: <ShieldCheck size={22} className="text-emerald-400" />,
    title: "Priority Assessment",
    desc: "Evidence-based maintenance prioritisation helps road authorities allocate budgets efficiently.",
    color: "from-emerald-500/10 to-transparent",
    border: "border-emerald-500/20",
  },
  {
    icon: <BarChart3 size={22} className="text-orange-400" />,
    title: "Analytics Dashboard",
    desc: "Real-time visualisations of damage distributions, trends, and critical hotspot identification.",
    color: "from-orange-500/10 to-transparent",
    border: "border-orange-500/20",
  },
  {
    icon: <Zap size={22} className="text-yellow-400" />,
    title: "Real-Time Processing",
    desc: "Fast inference pipeline processes road images in seconds, enabling field deployment on mobile devices.",
    color: "from-yellow-500/10 to-transparent",
    border: "border-yellow-500/20",
  },
];

// ── Pipeline steps ─────────────────────────────────────────────────────────

const pipeline = [
  { step: "01", label: "Upload Image",    sub: "Road photo input"      },
  { step: "02", label: "AI Detection",    sub: "YOLOv8 inference"      },
  { step: "03", label: "Feature Extract", sub: "Structural analysis"   },
  { step: "04", label: "Risk Prediction", sub: "ML classification"     },
  { step: "05", label: "Decision",        sub: "Priority assignment"   },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-600/8 blur-3xl pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold tracking-wider mb-8 uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Road Intelligence
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-4xl"
        >
          <span className="text-white">AI Road Damage</span>
          <br />
          <span className="gradient-text">Detection System</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-slate-400 max-w-2xl text-base sm:text-lg leading-relaxed"
        >
          A two-stage intelligent pipeline combining deep learning detection with
          machine learning risk prediction to prioritise road maintenance — keeping
          roads safer and budgets smarter.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/detect")}
            className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.03]"
          >
            <ScanSearch size={17} />
            Start Detection
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.03]"
          >
            <BarChart3 size={17} />
            View Analytics
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Animated stat pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 flex flex-wrap gap-6 justify-center"
        >
          {[
            { v: "1,284+", l: "Images Analysed" },
            { v: "94.3%", l: "Detection Accuracy" },
            { v: "5",     l: "Damage Classes"    },
            { v: "<2s",   l: "Inference Time"    },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-extrabold gradient-text">{s.v}</p>
              <p className="text-xs text-slate-600 mt-0.5">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Pipeline visualisation ────────────────────────────────────────── */}
      <section className="px-6 py-16 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs uppercase tracking-widest text-slate-500 font-semibold mb-10"
          >
            Two-Stage Intelligent Pipeline
          </motion.h2>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {pipeline.map((p, i) => (
              <div key={p.step} className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="w-12 h-12 rounded-xl glass border border-blue-500/25 flex items-center justify-center text-xs font-bold text-blue-400">
                    {p.step}
                  </div>
                  <p className="text-xs font-semibold text-slate-300 leading-tight">{p.label}</p>
                  <p className="text-[10px] text-slate-600">{p.sub}</p>
                </motion.div>
                {i < pipeline.length - 1 && (
                  <div className="pipeline-line min-w-[20px] flex-shrink-0 mb-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-extrabold text-white">
              Intelligent Road Infrastructure <span className="gradient-text">Assessment</span>
            </h2>
            <p className="mt-3 text-slate-500 text-sm max-w-lg mx-auto">
              End-to-end automation from image capture to actionable maintenance priorities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`glass rounded-2xl p-6 border ${f.border} bg-gradient-to-br ${f.color} hover:scale-[1.02] hover:border-white/15 transition-all duration-300 cursor-default`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-2xl p-10 border border-blue-500/20 glow-blue text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />
          <h2 className="text-2xl font-extrabold text-white relative">
            Ready to analyse your first road image?
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-lg mx-auto relative">
            Upload a road image and get instant damage detection, feature analysis, and priority classification.
          </p>
          <button
            onClick={() => navigate("/detect")}
            className="mt-7 inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 hover:scale-[1.03] relative"
          >
            <ScanSearch size={17} />
            Launch Detection
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </section>
    </div>
  );
}
