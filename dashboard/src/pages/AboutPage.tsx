/**
 * AboutPage — project description, tech stack, and team section.
 */

import { motion } from "framer-motion";
import {
  ExternalLink,
  Mail,
  Cpu,
  Layers,
  Globe,
  BookOpen,
  Award,
  Users,
} from "lucide-react";

// ── Tech stack ─────────────────────────────────────────────────────────────

const techStack = [
  { category: "Deep Learning",  items: ["YOLOv8", "PyTorch", "Ultralytics", "ONNX"],         color: "blue"    },
  { category: "Backend",        items: ["Python 3.11", "Flask", "OpenCV", "scikit-learn"],    color: "purple"  },
  { category: "Frontend",       items: ["React 19", "TypeScript", "Tailwind CSS", "Recharts"],color: "cyan"    },
  { category: "Infrastructure", items: ["Docker", "GitHub Actions", "CUDA 12.1", "NGINX"],   color: "emerald" },
];

const COLOR_MAP: Record<string, string> = {
  blue:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
  purple:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
  cyan:    "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

// ── Team members ───────────────────────────────────────────────────────────

const team = [
  {
    name:    "Alex Chen",
    role:    "ML Engineer",
    sub:     "Model training & evaluation",
    avatar:  "AC",
    color:   "from-blue-500 to-cyan-500",
    github:  "#",
    email:   "#",
  },
  {
    name:    "Priya Sharma",
    role:    "Computer Vision",
    sub:     "Detection pipeline & dataset",
    avatar:  "PS",
    color:   "from-purple-500 to-pink-500",
    github:  "#",
    email:   "#",
  },
  {
    name:    "Omar Khalid",
    role:    "Backend Engineer",
    sub:     "Flask API & deployment",
    avatar:  "OK",
    color:   "from-orange-500 to-red-500",
    github:  "#",
    email:   "#",
  },
  {
    name:    "Sofia Ruiz",
    role:    "Frontend Engineer",
    sub:     "UI/UX & visualisation",
    avatar:  "SR",
    color:   "from-emerald-500 to-teal-500",
    github:  "#",
    email:   "#",
  },
];

// ── Key facts ──────────────────────────────────────────────────────────────

const keyFacts = [
  { icon: <Award size={18} className="text-yellow-400" />, label: "mAP@0.5",         value: "89.1%" },
  { icon: <Layers size={18} className="text-blue-400" />,  label: "Dataset Size",    value: "4,782" },
  { icon: <Cpu size={18} className="text-cyan-400" />,     label: "Inference Time",  value: "<2s"   },
  { icon: <Globe size={18} className="text-purple-400" />, label: "Damage Classes",  value: "5"     },
];

export default function AboutPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg glow-blue">
              <Cpu size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-400 uppercase tracking-widest font-bold">Research Project</p>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                Priority-Based Road Damage Detection
              </h2>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            A two-stage AI system that combines a fine-tuned YOLOv8 object detector with
            a machine-learning priority classifier to automate road damage assessment.
            The system enables highway authorities to make data-driven maintenance
            decisions, reducing inspection costs by up to 70% compared to manual surveys.
          </p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
              Deep Learning
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
              Computer Vision
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold">
              Risk Assessment
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {keyFacts.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 border border-white/[0.07] text-center hover:scale-[1.03] transition-all"
          >
            <div className="flex justify-center mb-3">{f.icon}</div>
            <p className="text-2xl font-extrabold gradient-text">{f.value}</p>
            <p className="text-xs text-slate-600 mt-1">{f.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tech stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6 border border-white/[0.07]"
      >
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={16} className="text-slate-400" />
          <p className="text-sm font-semibold text-slate-300">Technology Stack</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((ts, i) => (
            <motion.div
              key={ts.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="space-y-3"
            >
              <p className={`text-xs font-bold uppercase tracking-widest ${COLOR_MAP[ts.color].split(" ")[0]}`}>
                {ts.category}
              </p>
              <div className="space-y-2">
                {ts.items.map((item) => (
                  <div
                    key={item}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold ${COLOR_MAP[ts.color]}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-white/[0.07]"
      >
        <div className="flex items-center gap-2 mb-5">
          <Users size={16} className="text-slate-400" />
          <p className="text-sm font-semibold text-slate-300">Research Team</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all group text-center"
            >
              {/* Avatar */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                {member.avatar}
              </div>
              <p className="text-sm font-bold text-slate-200">{member.name}</p>
              <p className="text-xs text-blue-400 font-semibold mt-0.5">{member.role}</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">{member.sub}</p>

              {/* Social links */}
              <div className="flex justify-center gap-3 mt-4">
                <a href={member.github} className="text-slate-700 hover:text-slate-300 transition-colors" aria-label="GitHub">
                  <ExternalLink size={15} />
                </a>
                <a href={member.email} className="text-slate-700 hover:text-slate-300 transition-colors" aria-label="Email">
                  <Mail size={15} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Acknowledgements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5 border border-white/[0.05] text-center"
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Dataset sourced from the{" "}
          <span className="text-blue-400">RDD2022 Road Damage Detection Challenge</span>.
          Model trained on NVIDIA A100 GPU with PyTorch 2.2.
          <br />
          © 2025 Road AI Research Group — Open Source under MIT License.
        </p>
      </motion.div>
    </div>
  );
}
