/**
 * DetectPage — container component for the full detection workflow.
 *
 * Pipeline stages rendered in order:
 *  1. Upload → 2. Detection Results → 3. Feature Extraction → 4. Risk Prediction → 5. Explanation
 *
 * All state lives here; child components are purely presentational.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  Layers,
  ShieldAlert,
  MessageSquareText,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

import UploadBox from "../components/detection/UploadBox";
import ResultView from "../components/detection/ResultView";
import SummaryPanel from "../components/detection/SummaryPanel";
import FeatureSummary from "../components/prediction/FeatureSummary";
import RiskCard from "../components/prediction/RiskCard";
import Loader from "../components/common/Loader";

import { analyzeImage } from "../lib/api";
import type { AnalysisResult, LoadingState } from "../types";

// ── Pipeline step indicator ────────────────────────────────────────────────

interface StepProps {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}

function PipelineStep({ number, label, active, done }: StepProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500
          ${done  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : ""}
          ${active && !done ? "bg-blue-500/20 border border-blue-500/40 text-blue-400 animate-pulse" : ""}
          ${!active && !done ? "bg-white/[0.04] border border-white/10 text-slate-600" : ""}`}
      >
        {done ? "✓" : number}
      </div>
      <p className={`text-[10px] font-semibold transition-colors ${active || done ? "text-slate-300" : "text-slate-700"}`}>
        {label}
      </p>
    </div>
  );
}

const STEPS = ["Upload", "Detect", "Extract", "Predict", "Decide"];

export default function DetectPage() {
  const [file,        setFile]        = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string | null>(null);
  const [result,      setResult]      = useState<AnalysisResult | null>(null);
  const [loadState,   setLoadState]   = useState<LoadingState>("idle");
  const [errorMsg,    setErrorMsg]    = useState<string>("");
  const [activeStep,  setActiveStep]  = useState<number>(0); // 0-indexed

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setErrorMsg("");
    setActiveStep(0);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setLoadState("idle");
    setErrorMsg("");
    setActiveStep(0);
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!file) return;
    try {
      setLoadState("loading");
      setActiveStep(1);
      const data = await analyzeImage(file);
      setActiveStep(4);
      setResult(data);
      setLoadState("success");
    } catch (err) {
      console.error("Analysis failed:", err);
      setErrorMsg("Analysis failed. Please check the server connection and try again.");
      setLoadState("error");
      setActiveStep(0);
    }
  }, [file]);

  const doneSteps = loadState === "success" ? 5 : activeStep;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* ── Pipeline progress bar ─────────────────────────────────────── */}
      <div className="glass rounded-2xl px-6 py-5 border border-white/[0.06]">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <PipelineStep
                number={i + 1}
                label={s}
                active={activeStep === i && loadState !== "success"}
                done={i < doneSteps || loadState === "success"}
              />
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-slate-700 flex-shrink-0 mb-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stage 1: Upload ──────────────────────────────────────────────── */}
      <Section
        icon={<ScanSearch size={18} className="text-blue-400" />}
        stage="Stage 1"
        title="Image Upload & Detection"
        color="blue"
      >
        <UploadBox
          onFileSelected={handleFileSelected}
          disabled={loadState === "loading"}
          preview={preview}
          onClear={handleClear}
        />

        {/* Action row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <button
            onClick={handleAnalyse}
            disabled={!file || loadState === "loading"}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
              ${file && loadState !== "loading"
                ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02]"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
              }`}
          >
            {loadState === "loading" ? (
              <><Loader size="sm" /> Analysing…</>
            ) : (
              <><ScanSearch size={15} /> Run Analysis</>
            )}
          </button>
          {file && loadState !== "loading" && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {/* Error */}
        {loadState === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400"
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            {errorMsg}
          </motion.div>
        )}
      </Section>

      {/* ── Results (visible after success) ─────────────────────────────── */}
      <AnimatePresence>
        {loadState === "success" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Stage 1 result: detections */}
            <Section
              icon={<ScanSearch size={18} className="text-blue-400" />}
              stage="Stage 1 — Result"
              title="Detection Results"
              color="blue"
            >
              <ResultView
                originalUrl={result.original_url ?? result.image_url}
                processedUrl={result.image_url}
                detections={result.detections}
              />
            </Section>

            {/* Stage 2: Feature extraction */}
            <Section
              icon={<Layers size={18} className="text-cyan-400" />}
              stage="Stage 2"
              title="Feature Extraction"
              color="cyan"
            >
              <div className="space-y-5">
                <SummaryPanel features={result.features} />
                <FeatureSummary features={result.features} />
              </div>
            </Section>

            {/* Stage 3 + 4: Prediction + Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section
                icon={<ShieldAlert size={18} className="text-red-400" />}
                stage="Stage 3"
                title="Risk Prediction"
                color="red"
              >
                <RiskCard prediction={result.prediction} />
              </Section>

              <Section
                icon={<MessageSquareText size={18} className="text-purple-400" />}
                stage="Stage 4"
                title="Decision Explanation"
                color="purple"
              >
                <ExplanationCard reason={result.prediction.reason} />
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Idle helper ──────────────────────────────────────────────────── */}
      {loadState === "idle" && !file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-slate-700 text-sm"
        >
          Upload a road image above to begin the analysis pipeline.
        </motion.div>
      )}
    </div>
  );
}

// ── Reusable section wrapper ───────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  stage: string;
  title: string;
  color: "blue" | "cyan" | "red" | "purple";
  children: React.ReactNode;
}

const COLOR_MAP = {
  blue:   { border: "border-blue-500/20",   badge: "bg-blue-500/10 text-blue-300 border-blue-500/20"   },
  cyan:   { border: "border-cyan-500/20",   badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"   },
  red:    { border: "border-red-500/20",    badge: "bg-red-500/10 text-red-300 border-red-500/20"       },
  purple: { border: "border-purple-500/20", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
};

function Section({ icon, stage, title, color, children }: SectionProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`glass rounded-2xl p-6 border ${c.border} space-y-5`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
            {stage}
          </span>
          <p className="text-sm font-bold text-slate-200 mt-1">{title}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Explanation card ────────────────────────────────────────────────────────

function ExplanationCard({ reason }: { reason: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6 border border-purple-500/20 h-full"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquareText size={18} className="text-purple-400" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Model Reasoning
          </p>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">
            "{reason}"
          </p>
          <div className="pt-3 flex flex-wrap gap-2">
            {["Deep Learning Detection", "Feature Analysis", "ML Classifier"].map((tag) => (
              <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
